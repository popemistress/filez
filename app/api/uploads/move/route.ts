import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const { fileId, folderId } = await request.json();
    
    // Get file info and folder name
    const fileResult = await pool.query(
      'SELECT name, url, file_type, file_size FROM uploads WHERE id = $1',
      [fileId]
    );
    
    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    const file = fileResult.rows[0];
    const currentName = file.name;
    let newName = currentName;
    
    // Get folder name if moving to a folder
    if (folderId) {
      const folderResult = await pool.query(
        'SELECT name FROM folders WHERE id = $1',
        [folderId]
      );
      
      if (folderResult.rows.length > 0) {
        const folderName = folderResult.rows[0].name;
        // Prefix filename with folder name for UploadThing
        newName = `${folderName}/${currentName}`;
      }
    }
    
    // If name changed, re-upload to UploadThing with new name
    if (newName !== currentName) {
      try {
        // Download file
        const fileResponse = await fetch(file.url);
        if (fileResponse.ok) {
          const fileBlob = await fileResponse.blob();
          const newFile = new File([fileBlob], newName, { type: file.file_type });
          
          // Upload with new name
          const uploadResult = await utapi.uploadFiles(newFile);
          
          if (uploadResult.data) {
            const newUrl = uploadResult.data.url;
            
            // Update database with new URL and folder
            await pool.query(
              'UPDATE uploads SET folder_id = $1, url = $2 WHERE id = $3',
              [folderId || null, newUrl, fileId]
            );
            
            // Delete old file
            try {
              const oldFileKey = file.url.split('/').pop();
              if (oldFileKey) {
                await utapi.deleteFiles(oldFileKey);
              }
            } catch (deleteError) {
              console.error('Error deleting old file:', deleteError);
            }
            
            return NextResponse.json({ success: true, newUrl });
          }
        }
      } catch (uploadError) {
        console.error('Error with UploadThing sync:', uploadError);
        // Fallback: just update folder_id
      }
    }
    
    // Update folder_id in database
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
