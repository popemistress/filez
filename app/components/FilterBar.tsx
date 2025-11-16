"use client";

import React from 'react';
import { ChevronDown, Grid3x3, List, X, Search, Plus, Upload, Folder, FileText, LayoutList, ArrowUpDown, Tag as TagIcon, Hash } from 'lucide-react';

interface FilterBarProps {
  totalCount: number;
  onResetFilters?: () => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list' | 'preview') => void;
  currentView?: 'grid' | 'list' | 'preview';
  onTagsFilter?: (tags: string[]) => void;
  onDocTypeFilter?: (type: string) => void;
  availableTags?: string[];
  availableDocTypes?: string[];
  onSearchChange?: (search: string) => void;
  searchQuery?: string;
  onUploadClick?: () => void;
  onCreateFolderClick?: () => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

export default function FilterBar({ 
  totalCount, 
  onResetFilters,
  onSortChange,
  onViewChange,
  currentView = 'grid',
  onTagsFilter,
  onDocTypeFilter,
  availableTags = [],
  availableDocTypes = [],
  onSearchChange,
  searchQuery = '',
  onUploadClick,
  onCreateFolderClick,
  itemsPerPage = 20,
  onItemsPerPageChange
}: FilterBarProps) {
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showTagsMenu, setShowTagsMenu] = React.useState(false);
  const [showDocTypeMenu, setShowDocTypeMenu] = React.useState(false);
  const [showNewItemMenu, setShowNewItemMenu] = React.useState(false);
  const [showPerPageMenu, setShowPerPageMenu] = React.useState(false);
  const [tagSearchQuery, setTagSearchQuery] = React.useState('');
  
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
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" style={{ left: '20px', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Title & content"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-64 pl-11 pr-3 py-1.5 text-xs border-0 hover:border hover:border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
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
          
          <div 
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowTagsMenu(false);
                setTagSearchQuery('');
              }
            }}
            tabIndex={-1}
          >
            <button 
              onClick={() => setShowTagsMenu(!showTagsMenu)}
              className="px-2.5 py-1.5 text-xs border-0 hover:border hover:border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <TagIcon className="w-3.5 h-3.5 text-gray-500" />
              <span>Tags</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTagsMenu && availableTags.length > 0 && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-300 rounded shadow-lg z-50">
                {/* Search input */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {/* Tag list - limit to 5 */}
                <div className="max-h-48 overflow-y-auto">
                  {availableTags
                    .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          onTagsFilter?.([tag]);
                          setShowTagsMenu(false);
                          setTagSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"
                      >
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        {tag}
                      </button>
                    ))}
                  {availableTags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-500 text-center">No tags found</div>
                  )}
                </div>
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
