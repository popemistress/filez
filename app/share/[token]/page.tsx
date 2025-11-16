"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface SharedFile {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedFile() {
      try {
        const response = await fetch(`/api/share/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('File not found or no longer shared');
          } else if (response.status === 403) {
            setError('This file is private');
          } else {
            setError('Failed to load file');
          }
          return;
        }
        
        const data = await response.json();
        setFile(data);
      } catch (err) {
        console.error('Error fetching shared file:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    }

    fetchSharedFile();
  }, [token]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (file) {
      window.open(file.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Not Available</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isImage = file.fileType.includes('image');
  const isPdf = file.fileType.includes('pdf');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isImage ? (
              <ImageIcon className="w-8 h-8 text-blue-600" />
            ) : (
              <FileText className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{file.name}</h1>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isImage ? (
            <div className="flex items-center justify-center p-8 bg-gray-100">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={file.url}
              className="w-full h-[80vh]"
              title={file.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-20 h-20 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Preview not available
              </h2>
              <p className="text-gray-600 mb-6">
                Click the download button to view this file
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
