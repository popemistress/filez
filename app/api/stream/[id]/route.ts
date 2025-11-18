import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Get file info from database
    const result = await pool.query(
      'SELECT url, name, file_type, file_size FROM uploads WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = result.rows[0];
    const fileUrl = file.url;

    // Fetch the file from UploadThing
    const fileResponse = await fetch(fileUrl);
    
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const totalSize = fileBuffer.byteLength;

    // Parse Range header
    const rangeHeader = request.headers.get('range');
    
    if (!rangeHeader) {
      // No range requested, return full file
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': file.file_type || 'application/octet-stream',
          'Content-Length': totalSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': `inline; filename="${file.name}"`,
        },
      });
    }

    // Parse range header (format: "bytes=start-end")
    const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!rangeMatch) {
      return NextResponse.json({ error: "Invalid range header" }, { status: 416 });
    }

    const start = parseInt(rangeMatch[1], 10);
    const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : totalSize - 1;

    // Validate range
    if (start >= totalSize || end >= totalSize || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`,
        },
      });
    }

    const chunkSize = end - start + 1;
    const chunk = fileBuffer.slice(start, end + 1);

    // Return partial content
    return new NextResponse(chunk, {
      status: 206,
      headers: {
        'Content-Type': file.file_type || 'application/octet-stream',
        'Content-Length': chunkSize.toString(),
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error('Error streaming file:', error);
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
