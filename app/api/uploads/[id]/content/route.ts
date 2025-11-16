import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, fileName } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Convert HTML content to blob
    const blob = new Blob([content], { type: 'text/html' });
    
    // Create a File object from the blob
    const file = new File([blob], fileName || `document-${id}.html`, { 
      type: 'text/html' 
    });

    // Upload to UploadThing
    const uploadedFiles = await utapi.uploadFiles(file);
    
    if (!uploadedFiles || uploadedFiles.error) {
      throw new Error('Failed to upload to UploadThing');
    }

    const newUrl = uploadedFiles.data.url;

    return NextResponse.json({ 
      success: true, 
      url: newUrl 
    });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json({ 
      error: "Failed to save content" 
    }, { status: 500 });
  }
}
