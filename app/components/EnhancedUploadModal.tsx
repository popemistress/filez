"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Check, AlertCircle, Tag as TagIcon } from 'lucide-react';
import { useUploadThing } from "@/lib/uploadthing";

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  tags: string[];
}

export default function EnhancedUploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState<{ [key: number]: string }>({});

  const { startUpload } = useUploadThing("mediaUploader", {
    onClientUploadComplete: async (uploadedFiles) => {
      // Update tags for each uploaded file
      if (uploadedFiles && uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const uploadedFile = uploadedFiles[i];
          const fileState = files[i];
          
          if (fileState?.tags && fileState.tags.length > 0) {
            try {
              // Find the file ID by matching the URL
              const response = await fetch('/api/uploads');
              const allUploads = await response.json();
              const matchingUpload = allUploads.find((u: any) => u.url === uploadedFile.url);
              
              if (matchingUpload) {
                await fetch('/api/uploads', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: matchingUpload.id, tags: fileState.tags })
                });
              }
            } catch (error) {
              console.error('Failed to update tags:', error);
            }
          }
        }
      }
      
      setUploading(false);
      onUploadComplete();
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onUploadError: (error: Error) => {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length + files.length > 10) {
      alert('Maximum 10 files can be uploaded at once');
      return;
    }

    const newFiles: FileUploadState[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      tags: []
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
      'application/epub+zip': ['.epub'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 16 * 1024 * 1024,
    disabled: uploading || files.length >= 10
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Simulate individual file progress
    const uploadPromises = files.map(async (fileState, index) => {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' as const } : f
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'complete' as const, progress: 100 } : f
      ));
    });

    try {
      await Promise.all(uploadPromises);
      await startUpload(files.map(f => f.file));
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCurrentTagInput(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const addTag = (index: number) => {
    const tagInput = currentTagInput[index]?.trim();
    if (!tagInput) return;

    setFiles(prev => prev.map((f, i) => {
      if (i === index && !f.tags.includes(tagInput)) {
        return { ...f, tags: [...f.tags, tagInput] };
      }
      return f;
    }));

    setCurrentTagInput(prev => ({ ...prev, [index]: '' }));
  };

  const removeTag = (fileIndex: number, tagIndex: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === fileIndex) {
        return { ...f, tags: f.tags.filter((_, ti) => ti !== tagIndex) };
      }
      return f;
    }));
  };

  const canUpload = files.length > 0 && !uploading;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
            <p className="text-sm text-gray-500 mt-1">
              {files.length}/10 files selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dropzone */}
          {files.length < 10 && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-6
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
                ${uploading || files.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                
                {isDragActive ? (
                  <p className="text-base font-medium text-blue-600">Drop files here...</p>
                ) : (
                  <>
                    <div>
                      <p className="text-base font-medium text-gray-900 mb-1">
                        Drag & drop files here or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        Max 10 files, 16MB each • PDF, DOC, DOCX, XLS, XLSX, Images, EPUB, TXT, MD
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((fileState, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3">
                    {/* File Icon/Status */}
                    <div className="flex-shrink-0">
                      {fileState.status === 'complete' ? (
                        <div className="p-2 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : fileState.status === 'error' ? (
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-100 rounded-full">
                          <File className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileState.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(fileState.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {!uploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="ml-2 p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {fileState.status === 'uploading' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Uploading...</span>
                            <span className="text-xs font-medium text-gray-700">{fileState.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${fileState.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {fileState.status === 'complete' && (
                        <p className="text-xs text-green-600 mb-2">✓ Upload complete</p>
                      )}

                      {/* Tags Section */}
                      {!uploading && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TagIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Tags</span>
                          </div>
                          
                          {/* Tag Input */}
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={currentTagInput[index] || ''}
                              onChange={(e) => setCurrentTagInput(prev => ({ ...prev, [index]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag(index);
                                }
                              }}
                              placeholder="Add a tag..."
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => addTag(index)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>

                          {/* Tag List */}
                          {fileState.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {fileState.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {tag}
                                  <button
                                    onClick={() => removeTag(index, tagIndex)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              canUpload
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
