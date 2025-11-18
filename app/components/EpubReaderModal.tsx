"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, BookOpen, Bookmark, Highlighter, ChevronLeft, ChevronRight, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import ePub, { Book, Rendition, Contents } from 'epubjs';
import { epubDb, Annotation } from '@/lib/epub-db';

interface EpubReaderModalProps {
  document: {
    id: string;
    name: string;
    url: string;
    fileSize: number;
  };
  onClose: () => void;
}

export default function EpubReaderModal({ document, onClose }: EpubReaderModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  
  const [currentLocation, setCurrentLocation] = useState('');
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(100);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Load book
  useEffect(() => {
    if (!viewerRef.current) return;

    const loadBook = async () => {
      try {
        
        // Check if book exists in IndexedDB
        let bookRecord = await epubDb.books.get(document.id);
        
        if (!bookRecord) {
          // Fetch and store the book
          const response = await fetch(document.url);
          const blob = await response.blob();
          
          bookRecord = {
            id: document.id,
            name: document.name,
            size: document.fileSize,
            url: document.url,
            createdAt: Date.now(),
            annotations: [],
            file: blob,
          };
          
          await epubDb.books.add(bookRecord);
        }

        // Initialize ePub.js with ArrayBuffer for better compatibility
        const arrayBuffer = await bookRecord.file!.arrayBuffer();
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Generate locations first
        await book.locations.generate(1024);

        // Display the book
        await rendition.display(bookRecord.currentCfi);

        // Load annotations
        setAnnotations(bookRecord.annotations || []);
        
        // Render existing highlights
        bookRecord.annotations?.forEach((annotation) => {
          rendition.annotations.highlight(
            annotation.cfiRange,
            {},
            () => {},
            'highlight',
            { fill: annotation.color || 'yellow' }
          );
        });

        // Track location changes
        rendition.on('relocated', (location: any) => {
          if (book.locations && book.locations.length() > 0) {
            const percent = book.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.round(percent * 100));
            setCurrentLocation(location.start.cfi);
            
            // Save progress
            epubDb.books.update(document.id, {
              currentCfi: location.start.cfi,
              percentage: Math.round(percent * 100),
              updatedAt: Date.now(),
            });
          }
        });

        // Handle text selection
        rendition.on('selected', (cfiRange: string, contents: Contents) => {
          const selection = contents.window.getSelection();
          if (selection && selection.toString().length > 0) {
            setSelectedText(selection.toString());
            
            // Get selection position
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setMenuPosition({ x: rect.left, y: rect.top - 40 });
            setShowAnnotationMenu(true);
          }
        });

      } catch (error) {
        console.error('Error loading ePub:', error);
        console.error('Document URL:', document.url);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        alert(`Failed to load ePub file: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    loadBook();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [document]);

  const handlePrevPage = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  const handleNextPage = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  const handleFontSizeChange = useCallback((delta: number) => {
    const newSize = Math.max(50, Math.min(200, fontSize + delta));
    setFontSize(newSize);
    renditionRef.current?.themes.fontSize(`${newSize}%`);
  }, [fontSize]);

  const handleAddHighlight = useCallback(async (color: string = 'yellow') => {
    if (!renditionRef.current || !selectedText) return;

    const contents: any = renditionRef.current.getContents();
    if (!contents || contents.length === 0) return;
    
    const selection = contents[0].window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const cfiRange = (renditionRef.current as any).getRange(range).toString();

    const annotation: Annotation = {
      id: `annotation_${Date.now()}`,
      cfiRange,
      text: selectedText,
      color,
      createdAt: Date.now(),
    };

    // Add highlight to rendition
    renditionRef.current.annotations.highlight(
      cfiRange,
      {},
      () => {},
      'highlight',
      { fill: color }
    );

    // Save to database
    const updatedAnnotations = [...annotations, annotation];
    setAnnotations(updatedAnnotations);
    
    await epubDb.books.update(document.id, {
      annotations: updatedAnnotations,
      updatedAt: Date.now(),
    });

    setShowAnnotationMenu(false);
    setSelectedText('');
  }, [selectedText, annotations, document.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Font Size Controls */}
            <button
              onClick={() => handleFontSizeChange(-10)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Decrease font size"
            >
              <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">{fontSize}%</span>
            <button
              onClick={() => handleFontSizeChange(10)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Increase font size"
            >
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Reader Content */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={viewerRef} className="w-full h-full" />

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <button
            onClick={handleNextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Annotation Menu */}
          {showAnnotationMenu && (
            <div
              className="absolute bg-white rounded-lg shadow-xl p-2 flex gap-2 z-50"
              style={{ left: menuPosition.x, top: menuPosition.y }}
            >
              <button
                onClick={() => handleAddHighlight('yellow')}
                className="w-8 h-8 rounded bg-yellow-300 hover:bg-yellow-400 transition-colors"
                title="Yellow highlight"
              />
              <button
                onClick={() => handleAddHighlight('lightgreen')}
                className="w-8 h-8 rounded bg-green-300 hover:bg-green-400 transition-colors"
                title="Green highlight"
              />
              <button
                onClick={() => handleAddHighlight('lightblue')}
                className="w-8 h-8 rounded bg-blue-300 hover:bg-blue-400 transition-colors"
                title="Blue highlight"
              />
              <button
                onClick={() => handleAddHighlight('pink')}
                className="w-8 h-8 rounded bg-pink-300 hover:bg-pink-400 transition-colors"
                title="Pink highlight"
              />
            </div>
          )}
        </div>

        {/* Footer - Progress Bar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
