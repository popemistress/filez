import pool from "@/lib/db";
import { NextResponse } from "next/server";

// Create folders table if it doesn't exist
async function ensureFoldersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
        color VARCHAR(50) DEFAULT 'blue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      ALTER TABLE uploads ADD COLUMN IF NOT EXISTS folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE SET NULL
    `);
    
    await pool.query(`
      ALTER TABLE folders ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'blue'
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_folder_id ON uploads(folder_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)
    `);
  } catch (error) {
    console.error('Error ensuring folders table:', error);
  }
}

export async function GET() {
  try {
    await ensureFoldersTable();
    
    const result = await pool.query(
      'SELECT id, name, parent_id as "parentId", color, created_at as "createdAt", updated_at as "updatedAt" FROM folders ORDER BY name ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureFoldersTable();
    
    const { name, parentId, color } = await request.json();
    const id = `folder_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await pool.query(
      'INSERT INTO folders (id, name, parent_id, color) VALUES ($1, $2, $3, $4)',
      [id, name, parentId || null, color || 'blue']
    );
    
    return NextResponse.json({ id, name, parentId, color });
  } catch {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
