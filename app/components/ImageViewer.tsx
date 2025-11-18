"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export interface ImageViewerImage {
  src: string;
  alt: string;
  downloadUrl?: string;
}

interface ImageViewerProps {
  images: ImageViewerImage[];
  visible: boolean;
  onClose: () => void;
  activeIndex?: number;
  downloadable?: boolean;
  zoomable?: boolean;
  rotatable?: boolean;
  loop?: boolean;
  showTotal?: boolean;
}

export default function ImageViewer({
  images,
  visible,
  onClose,
  activeIndex = 0,
  downloadable = true,
  zoomable = true,
  rotatable = true,
  loop = true,
  showTotal = true,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setLoading(true);
    setLoadError(false);
  }, [currentIndex]);

  // Update current index when activeIndex prop changes
  useEffect(() => {
    setCurrentIndex(activeIndex);
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, currentIndex]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= images.length) {
      if (loop) {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, images.length, loop]);

  const handlePrevious = useCallback(() => {
    if (images.length <= 1) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (loop) {
        setCurrentIndex(images.length - 1);
      }
    } else {
      setCurrentIndex(prevIndex);
    }
  }, [currentIndex, images.length, loop]);

  const handleZoomIn = useCallback(() => {
    if (!zoomable) return;
    setScale(prev => Math.min(prev + 0.2, 5));
  }, [zoomable]);

  const handleZoomOut = useCallback(() => {
    if (!zoomable) return;
    setScale(prev => Math.max(prev - 0.2, 0.1));
  }, [zoomable]);

  const handleRotate = useCallback(() => {
    if (!rotatable) return;
    setRotation(prev => (prev + 90) % 360);
  }, [rotatable]);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(() => {
    if (!downloadable || !images[currentIndex]) return;
    const image = images[currentIndex];
    const url = image.downloadUrl || image.src;
    const link = document.createElement('a');
    link.href = url;
    link.download = image.alt || `image-${currentIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentIndex, images, downloadable]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Mouse drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!zoomable) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  }, [zoomable]);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setLoadError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setLoadError(true);
  }, []);

  if (!visible || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
            disabled={!loop && currentIndex === 0}
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
            disabled={!loop && currentIndex === images.length - 1}
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
        {zoomable && (
          <>
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </>
        )}

        {rotatable && (
          <button
            onClick={handleRotate}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
            title="Rotate (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all text-sm"
          title="Reset"
        >
          1:1
        </button>

        {downloadable && (
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={handleFullscreen}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Image Counter */}
      {showTotal && images.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {currentIndex + 1} of {images.length}
        </div>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {loadError ? (
          <div className="text-white text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p>Failed to load image</p>
            <p className="text-sm text-gray-300 mt-2">{currentImage.alt}</p>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              opacity: loading ? 0 : 1,
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Image Info */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded max-w-md">
        <p className="text-sm font-medium truncate">{currentImage.alt}</p>
        {currentImage.src && (
          <p className="text-xs text-gray-300 truncate mt-1">{currentImage.src}</p>
        )}
      </div>
    </div>
  );
}
