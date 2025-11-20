import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import pool from "@/lib/db";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const parentFolderId = formData.get('folderId') as string | null;
    const folderName = formData.get('folderName') as string | null;
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    
    // Create a new folder for the imported files
    let targetFolderId = parentFolderId;
    if (folderName) {
      const newFolderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await pool.query(
        'INSERT INTO folders (id, name, parent_id) VALUES ($1, $2, $3)',
        [newFolderId, folderName, parentFolderId]
      );
      targetFolderId = newFolderId;
    }
    
    const uploadedFiles: Record<string, unknown>[] = [];
    const errors: Record<string, unknown>[] = [];
    
    // Upload files in batches to UploadThing
    for (const file of files) {
      try {
        // Extract just the filename without folder path
        const fileName = file.name.split('/').pop() || file.name;
        
        const uploadResult = await utapi.uploadFiles(file);
        
        if (uploadResult.data) {
          // Save to database with clean filename
          const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Small delay to prevent ID collisions
          await new Promise(resolve => setTimeout(resolve, 10));
          
          await pool.query(
            'INSERT INTO uploads (id, name, url, file_type, file_size, folder_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, fileName, uploadResult.data.url, file.type || 'application/octet-stream', file.size, targetFolderId]
          );
          
          uploadedFiles.push({
            id,
            name: fileName,
            url: uploadResult.data.url,
            size: file.size,
            folderId: targetFolderId
          });
        } else {
          errors.push({ filename: file.name, error: 'Upload failed' });
        }
      } catch (error) {
        errors.push({ filename: file.name, error: String(error) });
      }
    }
    
    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles.length,
      errors: errors.length,
      files: uploadedFiles,
      errorDetails: errors
    });
  } catch {
    return NextResponse.json({ error: "Failed to import folder" }, { status: 500 });
  }
}
