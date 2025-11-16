"use client";

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';
import DocxViewer from './DocxViewer';

interface EnhancedDocumentViewerProps {
  document: DocumentMetadata;
  onClose: () => void;
}

export default function EnhancedDocumentViewer({ document, onClose }: EnhancedDocumentViewerProps) {
  const renderViewer = () => {
    const fileType = document.fileType.toLowerCase();
    
    // Images
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('gif') || fileType.includes('webp')) {
      return (
        <img
          src={document.url}
          alt={document.name}
          className="max-w-full max-h-full object-contain mx-auto"
        />
      );
    }
    
    // PDF
    if (fileType.includes('pdf')) {
      return (
        <iframe
          src={`${document.url}#view=FitH`}
          className="w-full h-full"
          title={document.name}
        />
      );
    }
    
    // Word Documents (.doc, .docx) - Use mammoth for better rendering
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('msword') || fileType.includes('wordprocessingml')) {
      return (
        <DocxViewer url={document.url} fileName={document.name} />
      );
    }
    
    // Excel Documents (.xls, .xlsx)
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('sheet')) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`}
          className="w-full h-full"
          title={document.name}
        />
      );
    }
    
    // EPUB
    if (fileType.includes('epub')) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
          <div className="text-6xl">📚</div>
          <p className="text-lg font-medium">EPUB Viewer</p>
          <p className="text-sm text-gray-500">Download the file to read in your preferred EPUB reader</p>
          <a
            href={document.url}
            download
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download EPUB
          </a>
        </div>
      );
    }
    
    // Fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
        <div className="text-6xl">📄</div>
        <p className="text-lg font-medium">Preview not available</p>
        <p className="text-sm text-gray-500">This file type cannot be previewed in the browser</p>
        <div className="flex gap-3">
          <a
            href={document.url}
            download
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download File
          </a>
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open in New Tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-7xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 truncate">{document.name}</h2>
            <p className="text-sm text-gray-500">{document.fileType}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={document.url}
              download
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-4rem)] overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {renderViewer()}
        </div>
      </div>
    </div>
  );
}
