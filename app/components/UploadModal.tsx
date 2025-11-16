"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File } from 'lucide-react';
import { useUploadThing } from "@/lib/uploadthing";

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { startUpload } = useUploadThing("mediaUploader", {
    onClientUploadComplete: () => {
      setUploading(false);
      setProgress(0);
      onUploadComplete();
      onClose();
    },
    onUploadError: (error: Error) => {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    },
    onUploadProgress: (p) => {
      setProgress(p);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploading(true);
      await startUpload(acceptedFiles);
    }
  }, [startUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/epub+zip': ['.epub']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    disabled: uploading
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600">Drop files here...</p>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Drag & drop files here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supported: PNG, JPG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX, EPUB (Max 16MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Selected Files */}
          {acceptedFiles.length > 0 && !uploading && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected files:</p>
              {acceptedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <File className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
