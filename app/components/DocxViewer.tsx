"use client";

import React, { useEffect, useState, useRef } from 'react';
import mammoth from 'mammoth';

interface DocxViewerProps {
  url: string;
  fileName: string;
}

export default function DocxViewer({ url, fileName }: DocxViewerProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the file with CORS mode
        const response = await fetch(url, { 
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
        
        if (result.messages.length > 0) {
          console.warn('Conversion warnings:', result.messages);
        }
      } catch (err) {
        console.error('Error loading DOCX:', err);
        setError('Failed to load document. Please try downloading it instead.');
      } finally {
        setLoading(false);
      }
    };

    loadDocx();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div 
        className="max-w-4xl mx-auto p-8 prose prose-sm"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.6',
          color: '#333'
        }}
      />
    </div>
  );
}
