-- Add deleted_at column for soft deletes and sync checking
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for faster sync checks
CREATE INDEX IF NOT EXISTS idx_uploads_deleted_at ON uploads(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create index for folder orphan checks
CREATE INDEX IF NOT EXISTS idx_uploads_folder_id ON uploads(folder_id) WHERE folder_id IS NOT NULL;
/