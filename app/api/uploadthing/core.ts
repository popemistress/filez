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
    // Extract folderId from the multipart form-data
    let folderId: string | null = null;

    try {
      const formData = await req.formData();
      const rawFolderId = formData.get("folderId");
      if (typeof rawFolderId === "string" && rawFolderId.trim().length > 0) {
        folderId = rawFolderId;
      }
    } catch {
      // If formData parsing fails, we simply treat it as no folderId
      folderId = null;
    }

    return { folderId };
  })
  .onUploadComplete(async ({ file, metadata }) => {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const folderId = (metadata as any).folderId || null;

    // Persist file with optional folder_id so it shows up inside that folder
    await pool.query(
      'INSERT INTO uploads (id, name, url, file_type, file_size, folder_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, file.name, file.url, file.type, file.size, folderId]
    );
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;