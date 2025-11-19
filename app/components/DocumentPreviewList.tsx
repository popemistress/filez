"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Calendar, Share2, BookOpen, Edit } from 'lucide-react';
import { DocumentMetadata } from './DocumentCard';
import FileIcon from './FileIcon';
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
  onRead?: (id: string) => void;
  onViewImage?: (id: string) => void;
  onViewPdf?: (id: string) => void;
  onViewOfficeDocument?: (id: string) => void;
  onEditSpreadsheet?: (id: string) => void;
  onEditCode?: (id: string) => void;
  getFolderPath?: (folderId: string | null | undefined) => string;
  showFolderPath?: boolean;
}

export default function DocumentPreviewList({ documents, onPreview, onDelete, onDownload, onShare, selectionMode, selectedFiles, onToggleSelect, onRead, onViewImage, onViewPdf, onViewOfficeDocument, onEditSpreadsheet, onEditCode, getFolderPath, showFolderPath }: DocumentPreviewListProps) {
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


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.toLowerCase();
    
    // Images
    if (fileType.startsWith("image/")) return "🖼️";
    
    // Videos
    if (fileType.startsWith("video/")) return "🎥";
    
    // Audio
    if (fileType.startsWith("audio/")) return "🎵";
    
    // PDF
    if (fileType === "application/pdf") return "📄";
    
    // EPUB - Electronic Book
    if (fileType.includes("epub") || ext.endsWith(".epub")) return "📖";
    
    
    // Excel Spreadsheets
    if (ext.endsWith(".xls")) return "📊";
    if (ext.endsWith(".xlsx") || fileType.includes("spreadsheetml")) return "📈";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    
    // Text Files
    if (ext.endsWith(".txt") || fileType.includes("text/plain")) return "📃";
    
    // Markdown
    if (ext.endsWith(".md") || ext.endsWith(".markdown")) return "⬇️";
    
    // PowerPoint
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️";
    
    // Archives
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
    
    // Default
    return "📎";
  };

  const isEditable = (fileType: string, fileName: string) => {
    const editableTypes = ['sheet', 'excel', 'text', 'plain'];
    const editableExtensions = [
      '.xls', '.xlsx', '.txt', '.md',
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

  const isEpub = (fileType: string, fileName: string) => {
    return fileType.includes('epub') || fileName.toLowerCase().endsWith('.epub');
  };

  const isPdf = (fileType: string, fileName: string) => {
    return fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
  };


  const isSpreadsheet = (fileType: string, fileName: string) => {
    return fileType.includes('sheet') ||
           fileType.includes('excel') ||
           fileName.toLowerCase().endsWith('.xls') ||
           fileName.toLowerCase().endsWith('.xlsx');
  };

  const isImage = (fileType: string, fileName: string) => {
    return fileType.startsWith('image/') || 
           ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].some(ext => 
             fileName.toLowerCase().endsWith(ext)
           );
  };

  const isCodeFile = (fileType: string, fileName: string) => {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.css', '.html', '.xml', '.json', '.yaml', '.yml', '.sql'];
    return codeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isOfficeDocument = (fileType: string, fileName: string) => {
    const lowerFileType = fileType.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    return (
      // Word documents
      lowerFileType.includes('word') ||
      lowerFileType.includes('document') ||
      lowerFileType.includes('wordprocessingml') ||
      lowerFileName.endsWith('.doc') ||
      lowerFileName.endsWith('.docx') ||
      // Excel documents
      lowerFileType.includes('sheet') ||
      lowerFileType.includes('excel') ||
      lowerFileType.includes('spreadsheetml') ||
      lowerFileName.endsWith('.xls') ||
      lowerFileName.endsWith('.xlsx') ||
      // PowerPoint documents
      lowerFileType.includes('powerpoint') ||
      lowerFileType.includes('presentation') ||
      lowerFileType.includes('presentationml') ||
      lowerFileName.endsWith('.ppt') ||
      lowerFileName.endsWith('.pptx')
    );
  };

  const shouldHideViewButton = (fileType: string, fileName: string) => {
    // Hide view button for these file types
    const hideViewExtensions = ['.sql', '.txt', '.md', '.markdown'];
    return hideViewExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
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
      return 'Text document - click View to see contents';
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
                    <FileIcon fileName={doc.name} fileType={doc.fileType} size="lg" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="mb-2">
                    <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                      {doc.name}
                    </h3>
                    {/* Folder path - shown when searching */}
                    {showFolderPath && getFolderPath && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="truncate">{getFolderPath(doc.folderId)}</span>
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
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isImage(doc.fileType, doc.name) && onViewImage && (
                      <button
                        onClick={() => onViewImage(doc.id)}
                        className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center gap-1.5 transition-colors"
                        title="View Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Image
                      </button>
                    )}
                    {isPdf(doc.fileType, doc.name) && onViewPdf && (
                      <button
                        onClick={() => onViewPdf(doc.id)}
                        className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1.5 transition-colors"
                        title="View PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View PDF
                      </button>
                    )}
                    {isOfficeDocument(doc.fileType, doc.name) && onViewOfficeDocument && (
                      <button
                        onClick={() => onViewOfficeDocument(doc.id)}
                        className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center gap-1.5 transition-colors"
                        title="View Office Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Document
                      </button>
                    )}
                    {onPreview && !isEpub(doc.fileType, doc.name) && !isImage(doc.fileType, doc.name) && !isPdf(doc.fileType, doc.name) && !isOfficeDocument(doc.fileType, doc.name) && !shouldHideViewButton(doc.fileType, doc.name) && !isCodeFile(doc.fileType, doc.name) && (
                      <button
                        onClick={() => onPreview(doc.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5 transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    )}
                    {isEpub(doc.fileType, doc.name) && onRead && (
                      <button
                        onClick={() => onRead(doc.id)}
                        className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded flex items-center gap-1.5 transition-colors"
                        title="Read"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read
                      </button>
                    )}
                    {isSpreadsheet(doc.fileType, doc.name) && onEditSpreadsheet && (
                      <button
                        onClick={() => onEditSpreadsheet(doc.id)}
                        className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center gap-1.5 transition-colors"
                        title="Edit Spreadsheet"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                    {isCodeFile(doc.fileType, doc.name) && onEditCode && (
                      <button
                        onClick={() => onEditCode(doc.id)}
                        className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded flex items-center gap-1.5 transition-colors"
                        title="Edit Code"
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
