import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get all files in the folder
    const filesResult = await pool.query(
      'SELECT url FROM uploads WHERE folder_id = $1',
      [id]
    );
    
    // Delete files from UploadThing
    if (filesResult.rows.length > 0) {
      const fileKeys = filesResult.rows
        .map(row => row.url.split('/f/')[1])
        .filter(key => key); // Remove any undefined keys
      
      if (fileKeys.length > 0) {
        await utapi.deleteFiles(fileKeys);
      }
    }
    
    // Delete all files from database
    await pool.query('DELETE FROM uploads WHERE folder_id = $1', [id]);
    
    // Then delete the folder itself
    await pool.query('DELETE FROM folders WHERE id = $1', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    
    await pool.query(
      'UPDATE folders SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [name, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}
