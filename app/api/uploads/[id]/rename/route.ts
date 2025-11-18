import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json();
    const { id } = await params;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get current file info from database
    const result = await pool.query(
      'SELECT url, file_type, file_size FROM uploads WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const currentFile = result.rows[0];
    const oldUrl = currentFile.url;

    try {
      // Download the file from the old URL
      const fileResponse = await fetch(oldUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file from UploadThing');
      }
      
      const fileBlob = await fileResponse.blob();
      const file = new File([fileBlob], name, { type: currentFile.file_type });

      // Upload with new name to UploadThing
      const uploadResult = await utapi.uploadFiles(file);

      if (uploadResult.data) {
        const newUrl = uploadResult.data.url;

        // Update database with new URL and name
        await pool.query(
          'UPDATE uploads SET name = $1, url = $2 WHERE id = $3',
          [name, newUrl, id]
        );

        // Delete old file from UploadThing (extract file key from URL)
        try {
          const oldFileKey = oldUrl.split('/').pop();
          if (oldFileKey) {
            await utapi.deleteFiles(oldFileKey);
          }
        } catch (deleteError) {
          console.error('Error deleting old file:', deleteError);
          // Continue even if delete fails
        }

        return NextResponse.json({ success: true, name, url: newUrl });
      } else {
        throw new Error('Upload failed');
      }
    } catch (uploadError) {
      console.error('Error with UploadThing sync:', uploadError);
      // Fallback: just update the name in database
      await pool.query(
        'UPDATE uploads SET name = $1 WHERE id = $2',
        [name, id]
      );
      return NextResponse.json({ 
        success: true, 
        name, 
        warning: 'Name updated but file not synced with UploadThing' 
      });
    }
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}
