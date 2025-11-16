import 'dotenv/config';
import pool from '@/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    client.release();
    await pool.end();
    
    console.log('✅ Connection test passed!');
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
