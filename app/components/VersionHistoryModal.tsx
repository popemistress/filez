"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Download, Eye, RotateCcw } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  url: string;
  fileSize: number;
  createdAt: string;
  createdBy: string;
  changeDescription: string;
}

interface VersionHistoryModalProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
  onRestore?: (version: Version) => void;
}

export default function VersionHistoryModal({ 
  documentId, 
  documentName, 
  onClose,
  onRestore 
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/versions?uploadId=${documentId}`);
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Version History</h2>
            <p className="text-sm text-gray-600">{documentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No version history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="font-semibold text-sm">v{version.version}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Version {version.version}</span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(version.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={version.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={version.url}
                        download
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {index !== 0 && onRestore && (
                        <button
                          onClick={() => onRestore(version)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {version.changeDescription && (
                    <p className="text-sm text-gray-700 mb-2 ml-13">
                      {version.changeDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 ml-13">
                    <span>Size: {formatFileSize(version.fileSize)}</span>
                    {version.createdBy && <span>By: {version.createdBy}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 Tip: Click the restore icon to revert to a previous version
          </p>
        </div>
      </div>
    </div>
  );
}
