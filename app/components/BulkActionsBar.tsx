"use client";

import React, { useState } from 'react';
import { Trash2, FolderInput, Copy, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onMove: (folderId: string | null) => void;
  onCopy: (folderId: string | null) => void;
  onCancel: () => void;
  folders: Array<{ id: string; name: string; color?: string }>;
  currentFolder: string | null;
}

export default function BulkActionsBar({
  selectedCount,
  onDelete,
  onMove,
  onCopy,
  onCancel,
  folders,
  currentFolder
}: BulkActionsBarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  if (selectedCount === 0) return null;

  const availableFolders = folders.filter(f => f.id !== currentFolder);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
            {selectedCount}
          </div>
          <span className="font-medium">
            {selectedCount} file{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="h-6 w-px bg-blue-400" />

        <div className="flex items-center gap-2">
          {/* Move Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoveMenu(!showMoveMenu);
                setShowCopyMenu(false);
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <FolderInput className="w-4 h-4" />
              Move
            </button>
            {showMoveMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-xl py-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    onMove(null);
                    setShowMoveMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  📁 Root Folder
                </button>
                {availableFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMove(folder.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    📁 {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCopyMenu(!showCopyMenu);
                setShowMoveMenu(false);
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            {showCopyMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-900 rounded-lg shadow-xl py-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    onCopy(null);
                    setShowCopyMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  📁 Root Folder
                </button>
                {availableFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onCopy(folder.id);
                      setShowCopyMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    📁 {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="h-6 w-px bg-blue-400" />

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            title="Cancel selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
