"use client";

import React from 'react';
import { Folder, FolderOpen, MoreVertical, Trash2 } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface FolderCardProps {
  id: string;
  name: string;
  color?: string;
  fileCount?: number;
  onClick: () => void;
  onMoveFile?: (fileId: string, folderId: string) => void;
  onDelete?: (folderId: string, fileCount: number) => void;
}

const COLOR_SCHEMES = {
  blue: { from: 'from-blue-50', to: 'to-indigo-50', border: 'border-blue-200/50', hoverBorder: 'hover:border-blue-300', hoverFrom: 'hover:from-blue-100', hoverTo: 'hover:to-indigo-100', icon: 'text-blue-500', hoverIcon: 'group-hover:text-blue-600', hoverText: 'group-hover:text-blue-700', badge: 'bg-blue-600' },
  green: { from: 'from-green-50', to: 'to-emerald-50', border: 'border-green-200/50', hoverBorder: 'hover:border-green-300', hoverFrom: 'hover:from-green-100', hoverTo: 'hover:to-emerald-100', icon: 'text-green-500', hoverIcon: 'group-hover:text-green-600', hoverText: 'group-hover:text-green-700', badge: 'bg-green-600' },
  purple: { from: 'from-purple-50', to: 'to-violet-50', border: 'border-purple-200/50', hoverBorder: 'hover:border-purple-300', hoverFrom: 'hover:from-purple-100', hoverTo: 'hover:to-violet-100', icon: 'text-purple-500', hoverIcon: 'group-hover:text-purple-600', hoverText: 'group-hover:text-purple-700', badge: 'bg-purple-600' },
  orange: { from: 'from-orange-50', to: 'to-amber-50', border: 'border-orange-200/50', hoverBorder: 'hover:border-orange-300', hoverFrom: 'hover:from-orange-100', hoverTo: 'hover:to-amber-100', icon: 'text-orange-500', hoverIcon: 'group-hover:text-orange-600', hoverText: 'group-hover:text-orange-700', badge: 'bg-orange-600' },
  pink: { from: 'from-pink-50', to: 'to-rose-50', border: 'border-pink-200/50', hoverBorder: 'hover:border-pink-300', hoverFrom: 'hover:from-pink-100', hoverTo: 'hover:to-rose-100', icon: 'text-pink-500', hoverIcon: 'group-hover:text-pink-600', hoverText: 'group-hover:text-pink-700', badge: 'bg-pink-600' },
  red: { from: 'from-red-50', to: 'to-rose-50', border: 'border-red-200/50', hoverBorder: 'hover:border-red-300', hoverFrom: 'hover:from-red-100', hoverTo: 'hover:to-rose-100', icon: 'text-red-500', hoverIcon: 'group-hover:text-red-600', hoverText: 'group-hover:text-red-700', badge: 'bg-red-600' },
  yellow: { from: 'from-yellow-50', to: 'to-amber-50', border: 'border-yellow-200/50', hoverBorder: 'hover:border-yellow-300', hoverFrom: 'hover:from-yellow-100', hoverTo: 'hover:to-amber-100', icon: 'text-yellow-600', hoverIcon: 'group-hover:text-yellow-700', hoverText: 'group-hover:text-yellow-800', badge: 'bg-yellow-600' },
  gray: { from: 'from-gray-50', to: 'to-slate-50', border: 'border-gray-200/50', hoverBorder: 'hover:border-gray-300', hoverFrom: 'hover:from-gray-100', hoverTo: 'hover:to-slate-100', icon: 'text-gray-500', hoverIcon: 'group-hover:text-gray-600', hoverText: 'group-hover:text-gray-700', badge: 'bg-gray-600' },
};

export default function FolderCard({ id, name, color = 'blue', fileCount = 0, onClick, onMoveFile, onDelete }: FolderCardProps) {
  const colorScheme = COLOR_SCHEMES[color as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.blue;
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'FILE',
    drop: (item: { id: string }) => {
      onMoveFile?.(item.id, id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop as any}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 cursor-pointer",
        `bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} border ${colorScheme.border}`,
        `hover:shadow-md hover:scale-105 ${colorScheme.hoverBorder}`,
        `${colorScheme.hoverFrom} ${colorScheme.hoverTo}`,
        isActive && "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 scale-105 shadow-lg"
      )}
    >
      {/* Folder Icon */}
      <div className={cn(
        "relative mb-2 transition-transform duration-200",
        "group-hover:scale-110"
      )}>
        {isActive ? (
          <FolderOpen className="w-8 h-8 text-green-500" />
        ) : (
          <Folder className={`w-8 h-8 ${colorScheme.icon} ${colorScheme.hoverIcon}`} />
        )}
        
        {/* File count badge */}
        {fileCount > 0 && (
          <div className={`absolute -top-1 -right-1 ${colorScheme.badge} text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm`}>
            {fileCount > 99 ? '99+' : fileCount}
          </div>
        )}
      </div>

      {/* Folder Name */}
      <span className={cn(
        "text-sm font-medium text-gray-900 text-center truncate w-full px-1",
        colorScheme.hoverText, "transition-colors"
      )}>
        {name}
      </span>

      {/* Delete button - shows on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Use setTimeout to ensure the event is fully processed
            setTimeout(() => onDelete(id, fileCount), 0);
          }}
          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md z-20"
          title="Delete folder"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Drop indicator */}
      {isActive && (
        <div className="absolute inset-0 rounded-lg border border-dashed border-green-500 bg-green-500/10 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-green-700 bg-white/90 px-2 py-0.5 rounded-full shadow">
            Drop
          </span>
        </div>
      )}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-blue-600/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
