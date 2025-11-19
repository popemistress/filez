"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import FileIcon from './FileIcon';
import { Eye, Download, Trash2, FileText, Share2, BookOpen, Edit, Lock, Unlock, FileEdit, Type } from 'lucide-react';
import { useDrag } from 'react-dnd';

export interface DocumentMetadata {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt?: string;
  documentType?: string;
  referenceNumber?: string;
  folderId?: string | null;
  isPublic?: boolean;
  shareToken?: string | null;
  isEncrypted?: boolean;
};

interface DocumentCardProps {
  doc: DocumentMetadata;
  onPreview?: (id: string) => void;
  onViewImage?: (id: string) => void;
  onViewPdf?: (id: string) => void;
  onViewOfficeDocument?: (id: string) => void;
  onRead?: (id: string) => void;
  onEditSpreadsheet?: (id: string) => void;
  onEditCode?: (id: string) => void;
  onEditText?: (id: string) => void;
  onEditMindMap?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onRename?: (id: string, currentName: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  folderPath?: string;
  showFolderPath?: boolean;
}

export default function DocumentCard({
  doc,
  onPreview,
  onViewImage,
  onViewPdf,
  onViewOfficeDocument,
  onRead,
  onEditSpreadsheet,
  onEditCode,
  onEditText,
  onEditMindMap,
  onDelete,
  onDownload,
  onShare,
  onRename,
  selectionMode,
  isSelected,
  onToggleSelect,
  folderPath,
  showFolderPath
}: DocumentCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FILE',
    item: { id: doc.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  const title = doc.name || 'Untitled Document';
  const date = doc.createdAt 
    ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
  
  const isEditable = () => {
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
    
    return editableTypes.some(type => doc.fileType.includes(type)) || 
           editableExtensions.some(ext => doc.name.toLowerCase().endsWith(ext));
  };

  const isEpub = () => {
    return doc.fileType.includes('epub') || doc.name.toLowerCase().endsWith('.epub');
  };

  const isImage = () => {
    return doc.fileType.startsWith('image/') || 
           ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].some(ext => 
             doc.name.toLowerCase().endsWith(ext)
           );
  };

  const isOfficeDocument = () => {
    // DOC/DOCX files
    if (doc.fileType.includes('word') || 
        doc.fileType.includes('document') ||
        doc.fileType.includes('wordprocessingml') ||
        doc.name.toLowerCase().endsWith('.doc') || 
        doc.name.toLowerCase().endsWith('.docx')) {
      return true;
    }
    
    // XLS/XLSX files
    if (doc.fileType.includes('sheet') ||
        doc.fileType.includes('excel') ||
        doc.fileType.includes('spreadsheetml') ||
        doc.name.toLowerCase().endsWith('.xls') ||
        doc.name.toLowerCase().endsWith('.xlsx')) {
      return true;
    }
    
    // PowerPoint files (PPT/PPTX)
    if (doc.fileType.includes('powerpoint') ||
        doc.fileType.includes('presentation') ||
        doc.fileType.includes('presentationml') ||
        doc.name.toLowerCase().endsWith('.ppt') ||
        doc.name.toLowerCase().endsWith('.pptx')) {
      return true;
    }
    
    return false;
  };

  const isDocViewerSupported = () => {
    // Text files
    if (doc.fileType.includes('text/plain') ||
        doc.name.toLowerCase().endsWith('.txt')) {
      return true;
    }
    
    // Video files (WEBM)
    if (doc.fileType.includes('video/webm') ||
        doc.name.toLowerCase().endsWith('.webm')) {
      return true;
    }
    
    return false;
  };

  const isPdf = () => {
    return doc.fileType === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
  };

  const isSpreadsheet = () => {
    return doc.fileType.includes('sheet') ||
           doc.fileType.includes('excel') ||
           doc.name.toLowerCase().endsWith('.xls') ||
           doc.name.toLowerCase().endsWith('.xlsx');
  };


  const isCodeFile = () => {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.sql', '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.yml', '.sh', '.bash', '.txt', '.md', '.markdown'];
    return codeExtensions.some(ext => doc.name.toLowerCase().endsWith(ext));
  };

  const isTextFile = () => {
    // Text files are now handled as code files for editing
    return false;
  };

  const isMindMap = () => {
    return doc.name.toLowerCase().endsWith('.mindmap') ||
           doc.name.toLowerCase().endsWith('.map') ||
           doc.documentType === 'Mind Map';
  };

  const shouldHideViewButton = () => {
    // Hide view button for these file types
    const hideViewExtensions = ['.sql', '.txt', '.md', '.markdown'];
    return hideViewExtensions.some(ext => doc.name.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.toLowerCase();
    
    // Images
    if (fileType.startsWith("image/")) return "🖼️";
    
    // Videos
    if (fileType.startsWith("video/")) return "🎥";
    
    // PDF
    if (fileType === "application/pdf") return "📄";
    
    // EPUB - Electronic Book
    if (fileType.includes("epub") || ext.endsWith(".epub")) return "📖";
    
    // Word Documents
    if (ext.endsWith(".doc")) return "📄";
    if (ext.endsWith(".docx") || fileType.includes("wordprocessingml")) return "📝";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    
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
    
    // Default
    return "📎";
  };

  const getFileTypeLabel = (fileType: string, fileName: string) => {
    if (fileType === "application/pdf") return "PDF";
    if (fileType.includes("word")) return "DOCX";
    if (fileType.includes("sheet")) return "XLSX";
    if (fileType.includes("presentation")) return "PPTX";
    if (fileType.includes("epub") || fileName.toLowerCase().endsWith(".epub")) return "EPUB";
    const parts = fileType.split("/");
    return parts[1]?.toUpperCase() || "FILE";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };


  const renderThumbnail = () => {
    if (doc.fileType.startsWith("image/") && !imageError) {
      return (
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          <Image 
            src={doc.url} 
            alt={doc.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );
    } else if (doc.fileType.includes('pdf')) {
      return (
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <iframe
              src={`${doc.url}#view=FitH&toolbar=0&navpanes=0`}
              className="w-full h-full pointer-events-none"
              title={doc.name}
            />
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
          </div>
        </div>
      );
    } else if (doc.fileType.includes('text') || doc.fileType.includes('plain') ||
               doc.name.endsWith('.txt') || doc.name.endsWith('.md') ||
               doc.name.endsWith('.js') || doc.name.endsWith('.ts') ||
               doc.name.endsWith('.jsx') || doc.name.endsWith('.tsx') ||
               doc.name.endsWith('.py') || doc.name.endsWith('.java') ||
               doc.name.endsWith('.html') || doc.name.endsWith('.css') ||
               doc.name.endsWith('.json')) {
      return (
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full p-3 overflow-hidden">
            <pre className="text-[8px] leading-tight text-gray-600 font-mono whitespace-pre-wrap break-all">
              {doc.name.endsWith('.json') ? '{\n  "preview": "...",\n  "data": {...}\n}' :
               doc.name.endsWith('.html') ? '<!DOCTYPE html>\n<html>\n  <head>...' :
               doc.name.endsWith('.css') ? '.class {\n  property: value;\n}' :
               doc.name.endsWith('.py') ? 'def function():\n    return value' :
               doc.name.endsWith('.js') || doc.name.endsWith('.ts') ? 'function name() {\n  return value;\n}' :
               'Text document\nPreview content...'}
            </pre>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          <FileIcon fileName={doc.name} fileType={doc.fileType} size="lg" />
        </div>
      );
    }
  };

  return (
    <article 
      ref={drag as any}
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col relative hover:shadow-2xl hover:scale-110 hover:border-blue-400 hover:-translate-y-2 hover:z-10 transition-all duration-300 cursor-move ${isDragging ? 'opacity-50 scale-95' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute left-2 top-2 z-20">
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


      {/* Thumbnail with fixed aspect ratio - increased height by 50% */}
      <div className="relative w-full bg-gray-100" style={{ paddingTop: '78.75%' }}>
        <div className="absolute inset-0 overflow-hidden">
          {renderThumbnail()}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-normal text-gray-900 title-clamp mb-1.5 leading-tight">
            {title}
          </h3>

          {/* Folder path - shown when searching */}
          {showFolderPath && folderPath && (
            <div className="flex items-center gap-1 text-[10px] text-blue-600 mb-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="truncate">{folderPath}</span>
            </div>
          )}

          {/* Metadata row */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
              </svg>
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{formatFileSize(doc.fileSize)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons - bordered like in reference image */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center gap-0">
          {isImage() && onViewImage && (
            <button 
              onClick={(e) => { e.stopPropagation(); onViewImage(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title="View Image"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isPdf() && onViewPdf && (
            <button 
              onClick={(e) => { e.stopPropagation(); onViewPdf(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all group"
              title="View PDF"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-red-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isOfficeDocument() && onViewOfficeDocument && !isImage() && (
            <button 
              onClick={(e) => { e.stopPropagation(); onViewOfficeDocument(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title="View Office Document"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {onPreview && !isEpub() && !isSpreadsheet() && !isMindMap() && !isDocViewerSupported() && !isPdf() && !isOfficeDocument() && !isImage() && !shouldHideViewButton() && !isCodeFile() && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPreview(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title="View"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isEpub() && onRead && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRead(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-purple-50 hover:text-purple-600 transition-all group"
              title="Read"
            >
              <BookOpen className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isSpreadsheet() && onEditSpreadsheet && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditSpreadsheet(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-green-50 hover:text-green-600 transition-all group"
              title="Edit Spreadsheet"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 group-hover:text-green-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isCodeFile() && onEditCode && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditCode(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-purple-50 hover:text-purple-600 transition-all group"
              title="Edit Code"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isMindMap() && onEditMindMap && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditMindMap(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
              title="Edit Mind Map"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isTextFile() && onEditText && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditText(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
              title="Edit Text"
            >
              <FileEdit className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                // Use setTimeout to ensure the event is fully processed
                setTimeout(() => onDelete(doc.id), 0);
              }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all group"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {onDownload && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(doc.id); }}
              className="flex-1 p-1.5 hover:bg-gray-50 hover:text-gray-800 transition-all group"
              title="Download"
            >
              <Download className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {onShare && (
            <button 
              onClick={(e) => { e.stopPropagation(); onShare(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all group"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {onRename && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRename(doc.id, doc.name); }}
              className="flex-1 p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title="Rename"
            >
              <FileEdit className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
