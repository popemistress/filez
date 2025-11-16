"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Edit, Calendar, Share2 } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';
import Tag from './Tag';
import { useDrag } from 'react-dnd';
import Image from 'next/image';

interface DocumentPreviewListProps {
  documents: DocumentMetadata[];
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  selectionMode?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DocumentPreviewList({ documents, onPreview, onDelete, onDownload, onShare, selectionMode, selectedFiles, onToggleSelect, onEdit }: DocumentPreviewListProps) {
  const [excerpts, setExcerpts] = useState<{ [key: string]: string }>({});

  // Extract text from documents
  useEffect(() => {
    documents.forEach(async (doc) => {
      if (excerpts[doc.id]) return; // Already extracted

      try {
        let text = '';

        // Extract from text files only (PDFs require server-side processing)
        if (doc.fileType.includes('text') || doc.fileType.includes('plain') || 
            doc.name.endsWith('.txt') || doc.name.endsWith('.md') ||
            doc.name.endsWith('.js') || doc.name.endsWith('.ts') ||
            doc.name.endsWith('.jsx') || doc.name.endsWith('.tsx') ||
            doc.name.endsWith('.py') || doc.name.endsWith('.java') ||
            doc.name.endsWith('.c') || doc.name.endsWith('.cpp') ||
            doc.name.endsWith('.html') || doc.name.endsWith('.css') ||
            doc.name.endsWith('.json') || doc.name.endsWith('.xml') ||
            doc.name.endsWith('.yaml') || doc.name.endsWith('.yml')) {
          const response = await fetch(doc.url);
          text = await response.text();
        }

        if (text) {
          // Truncate to first 200 characters
          const excerpt = text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
          setExcerpts(prev => ({ ...prev, [doc.id]: excerpt }));
        }
      } catch (error) {
        console.error(`Failed to extract text from ${doc.name}:`, error);
      }
    });
  }, [documents, excerpts]);

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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('epub')) return '📚';
    return '📄';
  };

  const isEditable = (fileType: string, fileName: string) => {
    const editableTypes = ['word', 'document', 'sheet', 'excel', 'text', 'plain'];
    const editableExtensions = [
      '.docx', '.doc', '.xls', '.xlsx', '.txt', '.md',
      // Programming languages
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r',
      '.m', '.mm', '.pl', '.sh', '.bash', '.zsh', '.fish', '.ps1',
      '.html', '.htm', '.css', '.scss', '.sass', '.less', '.xml', '.json',
      '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sql', '.graphql',
      '.vue', '.svelte', '.astro', '.dart', '.lua', '.vim', '.el', '.clj',
      '.ex', '.exs', '.erl', '.hrl', '.hs', '.ml', '.fs', '.fsx', '.vb',
      '.asm', '.s', '.f', '.f90', '.f95', '.for', '.jl', '.nim', '.zig'
    ];
    
    return editableTypes.some(type => fileType.includes(type)) || 
           editableExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const generateExcerpt = (doc: DocumentMetadata) => {
    // Use extracted text if available
    if (excerpts[doc.id]) {
      return excerpts[doc.id];
    }

    // Fallback to generic messages
    if (doc.fileType.includes('pdf')) {
      return 'PDF document - click View to see contents';
    } else if (doc.fileType.includes('text') || doc.fileType.includes('plain') || 
               doc.name.endsWith('.txt') || doc.name.endsWith('.md')) {
      return 'Loading text content...';
    } else if (doc.fileType.includes('word') || doc.fileType.includes('document')) {
      return 'Word document - click View to see contents';
    } else if (doc.fileType.includes('sheet') || doc.fileType.includes('excel')) {
      return 'Spreadsheet - click View to see contents';
    }
    return 'File preview not available - click View to open';
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const PreviewRow = () => {
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
              className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-move ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                {selectionMode && (
                  <div className="flex-shrink-0 flex items-start pt-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(doc.id);
                      }}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-32 h-40 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                  {doc.fileType.includes('image') ? (
                    <Image 
                      src={doc.url} 
                      alt={doc.name}
                      width={128}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-5xl">{getFileIcon(doc.fileType)}</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Tags */}
                  <div className="mb-2">
                    <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                      {doc.name}
                    </h3>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index} variant={getTagVariant(tag, index)}>
                            {tag}
                          </Tag>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{doc.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {generateExcerpt(doc)}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.createdAt)}
                    </span>
                    <span>{doc.documentType}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {onPreview && (
                      <button
                        onClick={() => onPreview(doc.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5 transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    )}
                    {isEditable(doc.fileType, doc.name) && onEdit && (
                      <button
                        onClick={() => onEdit(doc.id)}
                        className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center gap-1.5 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setTimeout(() => onDelete(doc.id), 0);
                        }}
                        className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1.5 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                    {onDownload && (
                      <button
                        onClick={() => onDownload(doc.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    )}
                    {onShare && (
                      <button
                        onClick={() => onShare(doc.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        };
        
        return <PreviewRow key={doc.id} />;
      })}
    </div>
  );
}
