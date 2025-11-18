"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Download, Copy, Check, Maximize, Minimize } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  documentUrl: string;
  documentId: string;
  documentName: string;
  fileType: string;
  onClose?: () => void;
  onSave?: (content: string) => void;
}

export default function CodeEditor({
  documentUrl,
  documentId,
  documentName,
  fileType,
  onClose,
  onSave,
}: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getLanguage = () => {
    const ext = documentName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      txt: 'plaintext',
      sh: 'shell',
      bash: 'shell',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  useEffect(() => {
    loadFile();
  }, [documentUrl]);

  const loadFile = async () => {
    try {
      const response = await fetch(documentUrl);
      const text = await response.text();
      setCode(text);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading file:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(code);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = documentName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-full max-w-[95vw] h-[90vh] rounded-lg shadow-2xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
              {getLanguage().slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-semibold">{documentName}</h2>
              <p className="text-xs text-gray-400">{getLanguage()}</p>
            </div>
            {hasUnsavedChanges && <span className="text-xs text-orange-400">● Unsaved</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <Editor
              height="100%"
              language={getLanguage()}
              value={code}
              onChange={(value) => {
                setCode(value || '');
                setHasUnsavedChanges(true);
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                rulers: [80, 120],
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                folding: true,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
