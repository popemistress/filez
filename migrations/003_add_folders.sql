-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add folder_id to uploads table
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_uploads_folder_id ON uploads(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
