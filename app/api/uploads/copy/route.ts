import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const { url, name, fileType, fileSize, folderId, tags } = await request.json();
    
    // Download the file from the original URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download file from UploadThing');
    }
    
    const blob = await response.blob();
    
    // Create a File object from the blob
    const file = new File([blob], name, { type: fileType });
    
    // Upload the file to UploadThing
    const uploadResult = await utapi.uploadFiles(file);
    
    if (!uploadResult.data) {
      throw new Error('Failed to upload file to UploadThing');
    }
    
    const newUrl = uploadResult.data.url;
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Insert the new file record with the new URL
    await pool.query(
      'INSERT INTO uploads (id, name, url, file_type, file_size, folder_id, tags) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, newUrl, fileType, fileSize, folderId || null, tags || []]
    );
    
    return NextResponse.json({ success: true, id, url: newUrl });
  } catch (error) {
    console.error('Error copying file:', error);
    return NextResponse.json({ error: "Failed to copy file" }, { status: 500 });
  }
}
