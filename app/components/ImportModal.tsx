"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, FolderOpen, FileArchive, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadQueue } from '@/lib/uploadQueue';

interface ImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
  currentFolderId?: string | null;
}

export default function ImportModal({ onClose, onImportComplete, currentFolderId }: ImportModalProps) {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleZipImport = async (file: File) => {
    setImporting(true);
    setProgress(0);
    
    try {
      // Extract ZIP file contents on the client side
      const JSZip = (await import('jszip')).default;
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const filesToUpload: File[] = [];
      
      // Extract all files from ZIP
      for (const [filename, zipFile] of Object.entries(zip.files)) {
        if (zipFile.dir) continue; // Skip directories
        
        try {
          const blob = await zipFile.async('blob');
          const extractedFile = new File([blob], filename, { 
            type: blob.type || 'application/octet-stream' 
          });
          filesToUpload.push(extractedFile);
        } catch (error) {
          // Silent error handling
        }
      }
      
      if (filesToUpload.length === 0) {
        setResults({ error: 'No files found in ZIP archive' });
        return;
      }
      
      // Immediately refresh UI to show any new folders (if needed)
      await onImportComplete();
      
      // Add all extracted files to background upload queue
      const taskIds = uploadQueue.addBulkUpload(filesToUpload, currentFolderId);
      
      setResults({
        success: true,
        uploaded: filesToUpload.length,
        message: `${filesToUpload.length} files extracted and queued for upload in background`,
      });
      setProgress(100);
      
      // Simple and reliable approach: check completion every 500ms
      let hasRefreshed = false;
      
      const checkCompletion = () => {
        if (hasRefreshed) return;
        
        const allCompleted = uploadQueue.areTasksCompleted(taskIds);
        
        if (allCompleted) {
          hasRefreshed = true;
          // Force reload from server, bypassing cache
          try {
            // Try the legacy approach first (what you requested)
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
      setResults({ error: 'Failed to import ZIP file' });
    } finally {
      setImporting(false);
    }
  };

  const handleFolderImport = async (files: FileList) => {
    setImporting(true);
    setProgress(0);
    
    try {
      const totalFiles = files.length;
      
      // Extract folder name from first file's path
      const firstFile = files[0];
      const pathParts = firstFile.webkitRelativePath?.split('/') || [];
      const folderName = pathParts.length > 1 ? pathParts[0] : 'Imported Folder';
      
      // Create folder in database first
      const folderResponse = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          parentId: currentFolderId,
        }),
      });
      
      const folderData = await folderResponse.json();
      const newFolderId = folderData.id;
      
      // Immediately refresh UI to show the new folder
      await onImportComplete();
      
      // Add all files to background upload queue
      const fileArray = Array.from(files);
      const taskIds = uploadQueue.addBulkUpload(fileArray, newFolderId);
      
      setResults({
        success: true,
        uploaded: totalFiles,
        message: `${totalFiles} files queued for upload in background`,
      });
      setProgress(100);
      
      // Simple and reliable approach: check completion every 500ms
      let hasRefreshed = false;
      
      const checkCompletion = () => {
        if (hasRefreshed) return;
        
        const allCompleted = uploadQueue.areTasksCompleted(taskIds);
        
        if (allCompleted) {
          hasRefreshed = true;
          // Force reload from server, bypassing cache
          try {
            // Try the legacy approach first (what you requested)
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
      setResults({ error: 'Failed to import folder' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Import Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!importing && !results ? (
            <div className="space-y-4">
              {/* ZIP Import */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileArchive className="w-4 h-4" />
                  Import from ZIP Archive
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Upload a ZIP file to extract and import all contained files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleZipImport(file);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Select ZIP File
                </button>
              </div>

              <div className="border-t pt-4">
                {/* Folder Import */}
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Import Folder
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Select a folder to import all files within it
                </p>
                <input
                  ref={folderInputRef}
                  type="file"
                  /* @ts-ignore */
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFolderImport(files);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  Select Folder
                </button>
              </div>
            </div>
          ) : importing ? (
            <div className="py-8">
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-center text-sm text-gray-600 mb-2">Importing files...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">{progress}%</p>
            </div>
          ) : results ? (
            <div className="py-6">
              {results.error ? (
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-red-600">{results.error}</p>
                </div>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold mb-2">Import Complete!</p>
                  <p className="text-xs text-gray-600">
                    Successfully imported {results.uploaded} file(s)
                  </p>
                  {results.errors > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {results.errors} file(s) failed to import
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!importing && results && (
          <div className="px-6 py-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
