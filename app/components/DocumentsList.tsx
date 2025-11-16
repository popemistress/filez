"use client";

import React from 'react';
import { Eye, Trash2, Download, Calendar, Share2 } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';
import Tag from './Tag';
import { useDrag } from 'react-dnd';

interface DocumentsListProps {
  documents: DocumentMetadata[];
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  selectionMode?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export default function DocumentsList({ documents, onPreview, onDelete, onDownload, onShare, selectionMode, selectedFiles, onToggleSelect, onToggleSelectAll }: DocumentsListProps) {
  const getTagVariant = (tag: string, index: number) => {
    const variants = ['blue', 'purple', 'orange', 'green', 'pink', 'indigo'] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const allSelected = documents.length > 0 && documents.every(doc => selectedFiles?.has(doc.id));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase tracking-wider">
        {selectionMode && (
          <>
            <div className="w-10 flex items-center justify-center flex-shrink-0">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div className="w-px h-6 bg-gray-300 flex-shrink-0"></div>
          </>
        )}
        <div className="flex-1 min-w-0">Name</div>
        <div className="w-32 flex-shrink-0">Tags</div>
        <div className="w-24 flex-shrink-0">Type</div>
        <div className="w-28 flex-shrink-0">Date</div>
        <div className="w-32 flex-shrink-0 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {documents.map((doc) => {
          const ListRow = () => {
            const [{ isDragging }, drag] = useDrag(() => ({
              type: 'FILE',
              item: { id: doc.id },
              collect: (monitor) => ({
                isDragging: monitor.isDragging(),
              }),
            }));

            const isSelected = selectedFiles?.has(doc.id) || false;

            return (
              <div 
                ref={drag as any}
                key={doc.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all cursor-move ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
              >
            {/* Checkbox */}
            {selectionMode && (
              <>
                <div className="w-10 flex items-center justify-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelect?.(doc.id);
                    }}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="w-px h-10 bg-gray-200 flex-shrink-0"></div>
              </>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
                {doc.fileType.includes('image') ? '🖼️' :
                 doc.fileType.includes('pdf') ? '📄' :
                 doc.fileType.includes('word') || doc.fileType.includes('document') ? '📝' :
                 doc.fileType.includes('sheet') || doc.fileType.includes('excel') ? '📊' :
                 doc.fileType.includes('epub') ? '📚' : '📄'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="w-32 flex-shrink-0 flex flex-wrap gap-1">
              {doc.tags?.slice(0, 2).map((tag, index) => (
                <Tag key={index} variant={getTagVariant(tag, index)}>
                  {tag}
                </Tag>
              ))}
              {doc.tags && doc.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{doc.tags.length - 2}</span>
              )}
            </div>

            {/* Type */}
            <div className="w-24 flex-shrink-0">
              <span className="text-sm text-gray-700">{doc.documentType || 'Document'}</span>
            </div>

            {/* Date */}
            <div className="w-28 flex-shrink-0 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="w-32 flex-shrink-0 flex items-center justify-end gap-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(doc.id)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setTimeout(() => onDelete(doc.id), 0);
                  }}
                  className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
              {onDownload && (
                <button
                  onClick={() => onDownload(doc.id)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={() => onShare(doc.id)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
            );
          };
          
          return <ListRow key={doc.id} />;
        })}
      </div>
    </div>
  );
}
