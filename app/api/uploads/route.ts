import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ensure columns exist
    await pool.query(`
      ALTER TABLE uploads ADD COLUMN IF NOT EXISTS folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE SET NULL
    `);
    
    const result = await pool.query(
      'SELECT id, name, url, file_type as "fileType", file_size as "fileSize", created_at as "createdAt", folder_id as "folderId", is_public as "isPublic", share_token as "shareToken" FROM uploads ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}
