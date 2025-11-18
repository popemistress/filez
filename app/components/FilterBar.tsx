"use client";

import React from 'react';
import { ChevronDown, Grid3x3, List, X, Search, Plus, Upload, Folder, FileText, LayoutList, ArrowUpDown, Hash, Circle, Layout } from 'lucide-react';

interface FilterBarProps {
  totalCount: number;
  onResetFilters?: () => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list' | 'preview') => void;
  currentView?: 'grid' | 'list' | 'preview';
  onDocTypeFilter?: (type: string) => void;
  availableDocTypes?: string[];
  onSearchChange?: (search: string) => void;
  searchQuery?: string;
  onUploadClick?: () => void;
  onCreateFolderClick?: () => void;
  onCreateMindMapClick?: () => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

export default function FilterBar({ 
  totalCount, 
  onResetFilters,
  onSortChange,
  onViewChange,
  currentView = 'grid',
  onDocTypeFilter,
  availableDocTypes = [],
  onSearchChange,
  searchQuery = '',
  onUploadClick,
  onCreateFolderClick,
  onCreateMindMapClick,
  itemsPerPage = 20,
  onItemsPerPageChange
}: FilterBarProps) {
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showDocTypeMenu, setShowDocTypeMenu] = React.useState(false);
  const [showNewItemMenu, setShowNewItemMenu] = React.useState(false);
  const [showPerPageMenu, setShowPerPageMenu] = React.useState(false);
  
  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Date (Newest)', value: 'date-desc' },
    { label: 'Date (Oldest)', value: 'date-asc' },
    { label: 'Size (Largest)', value: 'size-desc' },
    { label: 'Size (Smallest)', value: 'size-asc' }
  ];

  const perPageOptions = [10, 20, 50, 100];

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {totalCount} documents
        </div>
        
        <div className="flex items-center gap-2">
          {/* New Item Button with Dropdown */}
          <div 
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowNewItemMenu(false);
              }
            }}
            tabIndex={-1}
          >
            <div className="flex rounded overflow-hidden">
              <button
                onClick={onUploadClick}
                className="px-2.5 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New item</span>
              </button>
              <button
                onClick={() => setShowNewItemMenu(!showNewItemMenu)}
                className="px-1.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 border-l border-blue-500"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {showNewItemMenu && (
              <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-300 rounded shadow-lg z-50">
                <button
                  onClick={() => {
                    onUploadClick?.();
                    setShowNewItemMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload File
                </button>
                <button
                  onClick={() => {
                    onCreateFolderClick?.();
                    setShowNewItemMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                >
                  <Folder className="w-3.5 h-3.5" />
                  Create Folder
                </button>
                <button
                  onClick={() => {
                    onCreateMindMapClick?.();
                    setShowNewItemMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                >
                  <Layout className="w-3.5 h-3.5" />
                  Mind Map
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center border-0 hover:border hover:border-gray-300 rounded overflow-hidden transition-all">
            <button 
              onClick={() => onViewChange?.('grid')}
              className={`px-2 py-1 ${currentView === 'grid' ? 'bg-green-600 text-white' : 'hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onViewChange?.('preview')}
              className={`px-2 py-1 border-l border-gray-300 ${currentView === 'preview' ? 'bg-green-600 text-white' : 'hover:bg-gray-50'}`}
              title="Preview view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onViewChange?.('list')}
              className={`px-2 py-1 border-l border-gray-300 ${currentView === 'list' ? 'bg-green-600 text-white' : 'hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div 
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowSortMenu(false);
              }
            }}
            tabIndex={-1}
          >
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-2.5 py-1.5 text-xs border-0 hover:border hover:border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>Sort</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-300 rounded shadow-lg z-50">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange?.(opt.value);
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onResetFilters && (
            <button 
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-xs border-0 hover:border hover:border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5 text-gray-600 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          
          <div 
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowPerPageMenu(false);
              }
            }}
            tabIndex={-1}
          >
            <button 
              onClick={() => setShowPerPageMenu(!showPerPageMenu)}
              className="px-2.5 py-1.5 text-xs border-0 hover:border hover:border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <Hash className="w-3.5 h-3.5 text-gray-500" />
              <span>{itemsPerPage} per page</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPerPageMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-50">
                {perPageOptions.map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      onItemsPerPageChange?.(count);
                      setShowPerPageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${itemsPerPage === count ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    {count} per page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
