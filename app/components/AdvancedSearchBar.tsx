"use client";

import React, { useState, useEffect } from 'react';
import { Search, Save, Star, X, History, Bookmark as BookmarkIcon } from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: string;
}

interface AdvancedSearchBarProps {
  onSearch: (query: string, filters?: any) => void;
}

export default function AdvancedSearchBar({ onSearch }: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch('/api/saved-searches');
      const data = await res.json();
      setSavedSearches(data);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim() || !query.trim()) return;

    try {
      await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName,
          query: query,
          filters: {}
        })
      });
      
      setSearchName('');
      setShowSaveDialog(false);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setQuery(search.query);
    onSearch(search.query, search.filters);
    setShowSavedSearches(false);
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      fetchSavedSearches();
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search documents and content..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-11 pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Save Search Button */}
        {query && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Save search"
          >
            <Save className="w-4 h-4" />
          </button>
        )}

        {/* Saved Searches Button */}
        <div 
          className="relative"
          onMouseEnter={() => setShowSavedSearches(true)}
          onMouseLeave={() => setShowSavedSearches(false)}
        >
          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Saved searches"
          >
            <History className="w-4 h-4" />
          </button>
          
          {/* Saved Searches List */}
          {showSavedSearches && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
              <div className="p-2">
                <h3 className="text-sm font-semibold mb-2 px-2">Saved Searches</h3>
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-gray-500 px-2 py-4 text-center">No saved searches</p>
                ) : (
                  savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded group"
                    >
                      <button
                        onClick={() => {
                          handleLoadSearch(search);
                          setShowSavedSearches(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium">{search.name}</div>
                        <div className="text-xs text-gray-500">{search.query}</div>
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(search.id)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-semibold mb-2">Save Search</h3>
          <input
            type="text"
            placeholder="Search name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveSearch}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
