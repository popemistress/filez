import { NextResponse } from "next/server";
import JSZip from "jszip";
import { UTApi } from "uploadthing/server";
import pool from "@/lib/db";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;
    
    if (!zipFile) {
      return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
    }
    
    const arrayBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const uploadedFiles: any[] = [];
    const errors: any[] = [];
    
    // Process each file in the ZIP
    for (const [filename, file] of Object.entries(zip.files)) {
      if (file.dir) continue; // Skip directories
      
      try {
        const blob = await file.async('blob');
        const fileToUpload = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
        
        // Upload to UploadThing
        const uploadResult = await utapi.uploadFiles(fileToUpload);
        
        if (uploadResult.data) {
          // Save to database
          const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await pool.query(
            'INSERT INTO uploads (id, name, url, file_type, file_size, folder_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, filename, uploadResult.data.url, blob.type || 'application/octet-stream', blob.size, folderId]
          );
          
          uploadedFiles.push({
            id,
            name: filename,
            url: uploadResult.data.url,
            size: blob.size,
            folderId: folderId
          });
        } else {
          errors.push({ filename, error: 'Upload failed' });
        }
      } catch (error) {
        errors.push({ filename, error: String(error) });
      }
    }
    
    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles.length,
      errors: errors.length,
      files: uploadedFiles,
      errorDetails: errors
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to import ZIP file" }, { status: 500 });
  }
}
