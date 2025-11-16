import pool from "@/lib/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    blob: { maxFileSize: "16MB", maxFileCount: 10 }
  })
  .middleware(async ({ req }) => {
    // Extract tags from request if available
    return { tags: [] as string[] };
  })
  .onUploadComplete(async({ file, metadata }) => {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Ensure tags column exists
    await pool.query(`
      ALTER TABLE uploads ADD COLUMN IF NOT EXISTS tags TEXT[]
    `);
    
    // Insert with tags
    const tags = metadata.tags || [];
    await pool.query(
      'INSERT INTO uploads (id, name, url, file_type, file_size, tags) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, file.name, file.url, file.type, file.size, tags]
    );
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;