import pool from "@/lib/db";
import { NextResponse } from "next/server";

async function ensureSavedSearchesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_searches (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      query TEXT NOT NULL,
      filters JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  try {
    await ensureSavedSearchesTable();
    
    const result = await pool.query(`
      SELECT id, name, query, filters, created_at as "createdAt", updated_at as "updatedAt"
      FROM saved_searches
      ORDER BY updated_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json({ error: "Failed to fetch saved searches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSavedSearchesTable();
    
    const { name, query, filters } = await request.json();
    
    const id = `ss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await pool.query(
      'INSERT INTO saved_searches (id, name, query, filters) VALUES ($1, $2, $3, $4)',
      [id, name, query, JSON.stringify(filters || {})]
    );
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json({ error: "Failed to create saved search" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Search ID required" }, { status: 400 });
    }
    
    await pool.query(
      'DELETE FROM saved_searches WHERE id = $1',
      [id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json({ error: "Failed to delete saved search" }, { status: 500 });
  }
}
