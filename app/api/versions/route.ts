import pool from "@/lib/db";
import { NextResponse } from "next/server";

async function ensureVersionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_versions (
      id VARCHAR(255) PRIMARY KEY,
      upload_id VARCHAR(255) NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      url TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      change_description TEXT
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_versions_upload ON document_versions(upload_id)
  `);
}

export async function GET(request: Request) {
  try {
    await ensureVersionsTable();
    
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
    }
    
    const result = await pool.query(`
      SELECT id, upload_id as "uploadId", version, url, file_size as "fileSize",
             created_at as "createdAt", change_description as "changeDescription"
      FROM document_versions
      WHERE upload_id = $1
      ORDER BY version DESC
    `, [uploadId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureVersionsTable();
    
    const { uploadId, url, fileSize, changeDescription } = await request.json();
    
    // Get the latest version number
    const versionResult = await pool.query(
      'SELECT COALESCE(MAX(version), 0) as max_version FROM document_versions WHERE upload_id = $1',
      [uploadId]
    );
    
    const newVersion = versionResult.rows[0].max_version + 1;
    const id = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await pool.query(
      `INSERT INTO document_versions 
       (id, upload_id, version, url, file_size, change_description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, uploadId, newVersion, url, fileSize, changeDescription || '']
    );
    
    return NextResponse.json({ success: true, id, version: newVersion });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}
