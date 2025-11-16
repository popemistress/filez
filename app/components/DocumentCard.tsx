"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Tag from './Tag';
import { Eye, Download, Trash2, Edit, FileText } from 'lucide-react';
import { useDrag } from 'react-dnd';

export type DocumentMetadata = {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize?: number;
  createdAt?: string;
  tags?: string[];
  correspondent?: string;
  documentType?: string;
  storagePath?: string;
  referenceNumber?: string;
  folderId?: string | null;
};

interface DocumentCardProps {
  doc: DocumentMetadata;
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onEdit?: (id: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function DocumentCard({ doc, onPreview, onDelete, onDownload, onEdit, selectionMode, isSelected, onToggleSelect }: DocumentCardProps) {
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

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️";
    return "📎";
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType === "application/pdf") return "PDF";
    if (fileType.includes("word")) return "DOCX";
    if (fileType.includes("sheet")) return "XLSX";
    if (fileType.includes("presentation")) return "PPTX";
    const parts = fileType.split("/");
    return parts[1]?.toUpperCase() || "FILE";
  };

  const getTagVariant = (tag: string, index: number) => {
    if (tag.toLowerCase() === 'inbox') return 'blue';
    const variants = ['orange', 'purple', 'green', 'pink', 'indigo', 'neutral'] as const;
    return variants[index % variants.length];
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
          <FileText className="w-16 h-16 text-gray-400" />
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

      {/* Tags overlay on thumbnail */}
      {doc.tags && doc.tags.length > 0 && (
        <div className={`absolute ${selectionMode ? 'left-9' : 'left-1.5'} top-1.5 flex flex-col gap-1 z-10`}>
          {doc.tags.slice(0, 3).map((tag, index) => (
            <Tag key={index} variant={getTagVariant(tag, index)}>
              {tag}
            </Tag>
          ))}
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
          </div>
        </div>

        {/* Action buttons - bordered like in reference image */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center gap-0">
          {onPreview && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPreview(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title="View"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 mx-auto transition-all" />
            </button>
          )}
          {isEditable() && onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(doc.id); }}
              className="flex-1 p-1.5 border-r border-gray-200 hover:bg-green-50 hover:text-green-600 transition-all group"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 group-hover:text-green-600 group-hover:scale-110 mx-auto transition-all" />
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
        </div>
      </div>
    </article>
  );
}
