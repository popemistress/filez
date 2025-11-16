import pool from "@/lib/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "16MB" },
    video: { maxFileSize: "1GB" },
    pdf: { maxFileSize: "16MB" },
    text: { maxFileSize: "16MB" },
    blob: { maxFileSize: "512MB" }
  })
  .onUploadComplete(async({ file }) => {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await pool.query(
      'INSERT INTO uploads (id, name, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)',
      [id, file.name, file.url, file.type, file.size]
    );
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;