import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Update the file URL in database
    await pool.query(
      'UPDATE uploads SET url = $1 WHERE id = $2',
      [url, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get file info from database
    const result = await pool.query(
      'SELECT url FROM uploads WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileUrl = result.rows[0].url;
    
    // Extract file key from URL (e.g., https://utfs.io/f/abc123 -> abc123)
    const fileKey = fileUrl.split('/f/')[1];

    // Delete from UploadThing
    if (fileKey) {
      await utapi.deleteFiles(fileKey);
    }

    // Delete from database
    await pool.query('DELETE FROM uploads WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
