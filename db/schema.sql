-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for faster ordering
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);
