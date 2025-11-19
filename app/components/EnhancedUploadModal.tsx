"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Check, AlertCircle } from 'lucide-react';
import { uploadQueue } from '@/lib/uploadQueue';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export default function EnhancedUploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      // Handle rejected files silently
    }
    
    if (acceptedFiles.length + files.length > 10) {
      alert('Maximum 10 files can be uploaded at once');
      return;
    }

    const newFiles: FileUploadState[] = acceptedFiles.map(file => {
      return {
        file,
        progress: 0,
        status: 'pending' as const
      };
    });

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
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
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
    
    try {
      // Immediately refresh UI to show any new folders (if needed)
      await onUploadComplete();
      
      // Add all files to background upload queue
      const taskIds = uploadQueue.addBulkUpload(files.map(f => f.file), null);
      
      
      // Simple and reliable approach: check completion every 500ms
      let hasRefreshed = false;
      
      const checkCompletion = () => {
        if (hasRefreshed) return;
        
        const allCompleted = uploadQueue.areTasksCompleted(taskIds);
        
        if (allCompleted) {
          hasRefreshed = true;
          // Force reload from server, bypassing cache
          try {
            // Try the legacy approach first
            (window.location as any).reload(true);
          } catch (e) {
            // Fallback to modern approach
            window.location.href = window.location.href;
          }
        }
      };
      
      // Check every 500ms - more responsive
      const pollInterval = setInterval(checkCompletion, 500);
      
      // Also check immediately after a short delay
      setTimeout(checkCompletion, 100);
      
      // Clean up after 10 minutes max
      setTimeout(() => {
        if (!hasRefreshed) {
          clearInterval(pollInterval);
        }
      }, 600000);
      
      // Close modal immediately, uploads continue in background
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

                      {uploading && (
                        <p className="text-xs text-blue-600 mb-2">📤 Queued for upload...</p>
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
