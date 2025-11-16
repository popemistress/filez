import pool from '../lib/db';

async function addSharingColumns() {
  try {
    console.log('Adding sharing columns to uploads table...');
    
    // Add is_public column
    await pool.query(`
      ALTER TABLE uploads 
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false
    `);
    console.log('✓ Added is_public column');
    
    // Add share_token column
    await pool.query(`
      ALTER TABLE uploads 
      ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE
    `);
    console.log('✓ Added share_token column');
    
    // Create index on share_token for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_share_token 
      ON uploads(share_token)
    `);
    console.log('✓ Created index on share_token');
    
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addSharingColumns();
