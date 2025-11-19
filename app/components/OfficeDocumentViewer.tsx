"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, RefreshCw, AlertCircle, FileText, BarChart3, Presentation } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';

interface OfficeDocumentViewerProps {
  document: DocumentMetadata;
  onClose: () => void;
}

export default function OfficeDocumentViewer({ document, onClose }: OfficeDocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const getOfficeViewerUrl = () => {
    // Use Microsoft Office Online viewer (same as react-doc-viewer)
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`;
  };

  const getDocumentTypeInfo = () => {
    const fileType = document.fileType.toLowerCase();
    const fileName = document.name.toLowerCase();
    
    // Word Documents
    if (fileType.includes('word') || fileType.includes('document') || 
        fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
        fileType.includes('wordprocessingml')) {
      return {
        type: 'Word Document',
        icon: <FileText className="w-6 h-6" />,
        color: 'blue',
        extensions: ['.doc', '.docx'],
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      };
    }
    
    // Excel Spreadsheets
    if (fileType.includes('sheet') || fileType.includes('excel') || 
        fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ||
        fileType.includes('spreadsheetml')) {
      return {
        type: 'Excel Spreadsheet',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'green',
        extensions: ['.xls', '.xlsx'],
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }
    
    // PowerPoint Presentations
    if (fileType.includes('powerpoint') || fileType.includes('presentation') || 
        fileName.endsWith('.ppt') || fileName.endsWith('.pptx') ||
        fileType.includes('presentationml')) {
      return {
        type: 'PowerPoint Presentation',
        icon: <Presentation className="w-6 h-6" />,
        color: 'orange',
        extensions: ['.ppt', '.pptx'],
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      };
    }
    
    // Default Office Document
    return {
      type: 'Office Document',
      icon: <FileText className="w-6 h-6" />,
      color: 'gray',
      extensions: [],
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    };
  };

  const docInfo = getDocumentTypeInfo();

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    // Reset states when document changes
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [document.id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-6">
          <div className={`p-4 rounded-full ${docInfo.bgColor} ${docInfo.borderColor} border-2`}>
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Document</h3>
            <p className="text-gray-600 mb-4">
              The {docInfo.type.toLowerCase()} couldn't be loaded in the viewer. This might be due to:
            </p>
            <ul className="text-sm text-gray-500 text-left space-y-1 mb-6">
              <li>• The file URL is not publicly accessible</li>
              <li>• The document is corrupted or password-protected</li>
              <li>• Microsoft Office Online service is temporarily unavailable</li>
              <li>• The file format is not supported by the online viewer</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
            <a
              href={document.url}
              download
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download File
            </a>
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${docInfo.bgColor} z-10`}>
            <div className={`p-4 rounded-full ${docInfo.borderColor} border-2 bg-white mb-4`}>
              <div className={docInfo.textColor}>
                {docInfo.icon}
              </div>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className={`font-medium ${docInfo.textColor}`}>Loading {docInfo.type}...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}
        
        <iframe
          key={`${document.id}-${retryCount}`} // Force reload on retry
          src={getOfficeViewerUrl()}
          className="w-full h-full border-0"
          title={document.name}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
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
        <div className={`flex items-center justify-between p-4 border-b ${docInfo.borderColor} ${docInfo.bgColor}`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-white ${docInfo.borderColor} border`}>
              <div className={docInfo.textColor}>
                {docInfo.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 truncate">{document.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded text-xs font-medium ${docInfo.bgColor} ${docInfo.textColor}`}>
                  {docInfo.type}
                </span>
                <span>•</span>
                <span>{document.fileType}</span>
                {document.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <a
              href={document.url}
              download
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </a>
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 h-[calc(90vh-80px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
