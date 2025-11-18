"use client";

import React from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { X, Download, ExternalLink } from 'lucide-react';

interface DocViewerModalProps {
  document: {
    id: string;
    name: string;
    url: string;
    fileType: string;
    fileSize: number;
  };
  onClose: () => void;
}

export default function DocViewerModal({ document, onClose }: DocViewerModalProps) {
  const docs = [
    {
      uri: document.url,
      fileName: document.name,
      fileType: document.fileType,
    }
  ];

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(document.url, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl flex flex-col w-full max-w-[95vw] h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                {document.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{document.fileType}</span>
                <span>•</span>
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleOpenExternal}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
              },
            }}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
