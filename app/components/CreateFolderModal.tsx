"use client";

import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreateFolder: (name: string, color?: string) => void;
}

const FOLDER_COLORS = [
  { name: 'Blue', value: 'blue', from: 'from-blue-50', to: 'to-indigo-50', border: 'border-blue-200', icon: 'text-blue-500' },
  { name: 'Green', value: 'green', from: 'from-green-50', to: 'to-emerald-50', border: 'border-green-200', icon: 'text-green-500' },
  { name: 'Purple', value: 'purple', from: 'from-purple-50', to: 'to-violet-50', border: 'border-purple-200', icon: 'text-purple-500' },
  { name: 'Orange', value: 'orange', from: 'from-orange-50', to: 'to-amber-50', border: 'border-orange-200', icon: 'text-orange-500' },
  { name: 'Pink', value: 'pink', from: 'from-pink-50', to: 'to-rose-50', border: 'border-pink-200', icon: 'text-pink-500' },
  { name: 'Red', value: 'red', from: 'from-red-50', to: 'to-rose-50', border: 'border-red-200', icon: 'text-red-500' },
  { name: 'Yellow', value: 'yellow', from: 'from-yellow-50', to: 'to-amber-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
  { name: 'Gray', value: 'gray', from: 'from-gray-50', to: 'to-slate-50', border: 'border-gray-200', icon: 'text-gray-500' },
];

export default function CreateFolderModal({ onClose, onCreateFolder }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setCreating(true);
    await onCreateFolder(folderName.trim(), selectedColor);
    setCreating(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={creating}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Folder Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    disabled={creating}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all
                      bg-gradient-to-br ${color.from} ${color.to}
                      ${isSelected ? `${color.border} ring-2 ring-offset-2 ring-${color.value}-500` : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <Folder className={`w-6 h-6 mx-auto ${color.icon}`} />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <span className="block text-[10px] text-gray-600 mt-1 text-center">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={creating || !folderName.trim()}
          >
            {creating ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}
