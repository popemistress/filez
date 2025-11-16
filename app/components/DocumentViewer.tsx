"use client";

import React from 'react';
import { X } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';

interface DocumentViewerProps {
  document: DocumentMetadata;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{document.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-4rem)] overflow-auto p-4">
          {document.fileType.startsWith('image/') ? (
            <img
              src={document.url}
              alt={document.name}
              className="max-w-full h-auto mx-auto"
            />
          ) : document.fileType === 'application/pdf' ? (
            <iframe
              src={document.url}
              className="w-full h-full"
              title={document.name}
            />
          ) : document.fileType.startsWith('video/') ? (
            <video
              src={document.url}
              controls
              className="max-w-full h-auto mx-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg mb-4">Preview not available for this file type</p>
              <a
                href={document.url}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
