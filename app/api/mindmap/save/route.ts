import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const { id, name, data } = await request.json();
    
    // Convert mind map data to JSON string
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // Create a file from the blob
    const file = new File([blob], `${name}.mindmap`, { type: 'application/json' });
    
    // Upload to UploadThing
    const uploadResult = await utapi.uploadFiles([file]);
    
    if (!uploadResult || uploadResult.length === 0 || uploadResult[0].error) {
      console.error('UploadThing upload failed:', uploadResult);
      return NextResponse.json(
        { error: 'Failed to upload mind map' },
        { status: 500 }
      );
    }
    
    const uploadedFile = uploadResult[0].data;
    
    if (!uploadedFile) {
      return NextResponse.json(
        { error: 'Upload failed - no file data returned' },
        { status: 500 }
      );
    }
    
    // If this is an update (has ID), we could update the database record
    // For now, we'll just return the new file info
    
    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.key,
        name: uploadedFile.name,
        url: uploadedFile.url,
        size: uploadedFile.size
      }
    });
    
  } catch (error) {
    console.error('Error saving mind map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
