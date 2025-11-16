import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Find the file by share token
    const result = await pool.query(
      `SELECT id, name, url, file_type as "fileType", file_size as "fileSize", 
       created_at as "createdAt", is_public as "isPublic"
       FROM uploads 
       WHERE share_token = $1`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    const file = result.rows[0];
    
    // Check if file is public
    if (!file.isPublic) {
      return NextResponse.json(
        { error: "This file is private" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching shared file:', error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
