"use client";

import React, { useRef, useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
});

interface JoditEditorModalProps {
  document: {
    id: string;
    name: string;
    url: string;
    fileType: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function JoditEditorModal({ document, onClose, onSave }: JoditEditorModalProps) {
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch document content
  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the document content
        const response = await fetch(document.url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const text = await response.text();
        
        // If it's a text-based file, use it directly
        // For HTML files, use as-is
        // For plain text, wrap in basic HTML
        if (document.fileType.includes('html')) {
          setContent(text);
        } else if (document.fileType.includes('text')) {
          setContent(`<p>${text.replace(/\n/g, '</p><p>')}</p>`);
        } else {
          setContent('<p>Start editing your document...</p>');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document content. Starting with blank document.');
        setContent('<p>Start editing your document...</p>');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [document.url, document.fileType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save the edited content to the API
      const saveResponse = await fetch(`/api/uploads/${document.id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          fileName: document.name
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save edited document');
      }

      const { url } = await saveResponse.json();

      // Update database with new URL
      const updateResponse = await fetch(`/api/uploads/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update document');
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving document:', err);
      alert('Failed to save document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const config = {
    readonly: false,
    height: 600,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'middle' as const,
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    showPoweredBy: false,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', '|',
      'symbol', 'fullsize', 'print'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['file', 'video'],
    disablePlugins: ['speech-recognize']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Document</h2>
            <p className="text-sm text-gray-500 mt-1">{document.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <JoditEditor
              ref={editor}
              value={content}
              config={config}
              onBlur={(newContent) => setContent(newContent)}
              onChange={(newContent) => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
