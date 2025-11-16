import 'dotenv/config';
import pool from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDatabase() {
  try {
    const schemaSQL = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
