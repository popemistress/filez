import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from 'crypto';

// POST - Generate share link
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Generate a unique share token
    const shareToken = randomBytes(16).toString('hex');
    
    // Update the file to be public with the share token
    await pool.query(
      'UPDATE uploads SET is_public = true, share_token = $1 WHERE id = $2',
      [shareToken, id]
    );
    
    return NextResponse.json({ 
      success: true, 
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/share/${shareToken}`
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}

// DELETE - Make file private
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Update the file to be private and clear the share token
    await pool.query(
      'UPDATE uploads SET is_public = false, share_token = NULL WHERE id = $1',
      [id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error making file private:', error);
    return NextResponse.json({ error: "Failed to make file private" }, { status: 500 });
  }
}
