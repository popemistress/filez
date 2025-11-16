"use client";

import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type Upload = {
  id: string;
  name: string;
  url: string;
  fileType: string;
};

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { startUpload, isUploading } = useUploadThing("mediaUploader", {
    onClientUploadComplete: () => {
      setFile(null);
      setPreview(null);
      setProgress(0);
      fetchUploads();
    },
    onUploadProgress: setProgress,
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      if (f) {
        setPreview(URL.createObjectURL(f));
        setFile(f);
      }
    },
  });

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads");
    setUploads(await res.json());
  };

  const deleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUploads();
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const filteredUploads = uploads.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">File Upload Center</h1>
          <p className="text-gray-600">Upload and manage your files with ease</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all shadow-sm ${
            isDragActive
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          {!preview ? (
            <div className="space-y-3">
              <div className="text-6xl">📁</div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop or click to select any file
              </p>
              <p className="text-sm text-gray-500">
                Supports images, videos, PDFs, documents, and more
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {file?.type.startsWith("image/") ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="max-h-64 mx-auto rounded"
                />
              ) : file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  controls
                  className="max-h-64 mx-auto rounded"
                />
              ) : file?.type === "application/pdf" ? (
                <iframe
                  src={preview}
                  className="w-full h-96 rounded border"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-6xl">📄</div>
                  <p className="text-sm font-medium text-gray-900">{file?.type || "Unknown type"}</p>
                </div>
              )}
              <p className="text-base font-semibold text-gray-900">{file?.name}</p>
              <p className="text-sm text-gray-600">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        {file && !isUploading && (
          <button
            onClick={() => startUpload([file])}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Upload File
          </button>
        )}

        {isUploading && (
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Uploading...</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Files Gallery</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search for files"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {filteredUploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="text-6xl">📁</div>
                  <div className="absolute -right-2 -top-2 text-4xl">📄</div>
                  <div className="absolute -left-2 top-4 text-3xl">🎨</div>
                  <div className="absolute right-4 top-8 text-2xl">👋</div>
                </div>
              </div>
              <p className="text-gray-900 font-medium mb-1">No files were found.</p>
              <p className="text-sm text-gray-500">
                Please upload files to any item's files column, gallery or updates so they will be displayed here.
              </p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {filteredUploads.map((u) => (
                <div key={u.id} className={viewMode === "grid" ? "bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all group relative" : "bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all group flex items-center gap-3"}>
                  <button
                    onClick={() => deleteFile(u.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  {viewMode === "grid" ? (
                    <>
                      {u.fileType.startsWith("image/") ? (
                        <Image
                          src={u.url}
                          alt={u.name}
                          width={400}
                          height={200}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : u.fileType.startsWith("video/") ? (
                        <video
                          src={u.url}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : u.fileType === "application/pdf" ? (
                        <a href={u.url} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="w-full h-32 bg-red-50 rounded flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📄</div>
                              <p className="text-xs text-red-600">PDF</p>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <a href={u.url} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="w-full h-32 bg-gray-50 rounded flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📎</div>
                              <p className="text-xs text-gray-600">{u.fileType.split("/")[1]?.toUpperCase() || "FILE"}</p>
                            </div>
                          </div>
                        </a>
                      )}
                      <p className="text-sm mt-3 truncate font-medium text-gray-900">{u.name}</p>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        {u.fileType.startsWith("image/") ? (
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-xl">🖼️</div>
                        ) : u.fileType.startsWith("video/") ? (
                          <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center text-xl">🎥</div>
                        ) : u.fileType === "application/pdf" ? (
                          <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-xl">📄</div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">📎</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.fileType}</p>
                      </div>
                      <a
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
