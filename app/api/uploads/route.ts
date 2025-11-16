import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ensure columns exist
    await pool.query(`
      ALTER TABLE uploads ADD COLUMN IF NOT EXISTS folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE SET NULL
    `);
    await pool.query(`
      ALTER TABLE uploads ADD COLUMN IF NOT EXISTS tags TEXT[]
    `);
    
    const result = await pool.query(
      'SELECT id, name, url, file_type as "fileType", file_size as "fileSize", created_at as "createdAt", folder_id as "folderId", tags FROM uploads ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, tags } = await request.json();
    
    await pool.query(
      'UPDATE uploads SET tags = $1 WHERE id = $2',
      [tags || [], id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating upload tags:', error);
    return NextResponse.json({ error: "Failed to update tags" }, { status: 500 });
  }
}