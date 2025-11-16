import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { fileId, folderId } = await request.json();
    
    await pool.query(
      'UPDATE uploads SET folder_id = $1 WHERE id = $2',
      [folderId || null, fileId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving file:', error);
    return NextResponse.json({ error: "Failed to move file" }, { status: 500 });
  }
}
