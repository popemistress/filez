import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, url, file_type as "fileType", file_size as "fileSize", created_at as "createdAt", folder_id as "folderId" FROM uploads ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}
