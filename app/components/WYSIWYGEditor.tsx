"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, Image, Table,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Quote, Heading1, Heading2, Heading3, Undo, Redo, Maximize, Minimize,
  Save, X, ChevronDown, Palette, Type, Highlighter, Subscript,
  Superscript, Minus, Check, Video, Music, FileCode, Smile,
  Upload, FileText
} from 'lucide-react';

interface WYSIWYGEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
  fileName?: string;
  fileType?: string;
  readOnly?: boolean;
}

export default function WYSIWYGEditor({
  initialContent = '',
  onSave,
  onClose,
  fileName = 'Untitled',
  fileType = 'html',
  readOnly = false,
}: WYSIWYGEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCode, setSourceCode] = useState(initialContent);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && !showSourceCode) {
      editorRef.current.innerHTML = content;
      updateCounts();
    }
  }, [content, showSourceCode]);

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      setCharacterCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setSourceCode(newContent);
      updateCounts();
      setHasUnsavedChanges(true);
    }
  };

  const handleSourceCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setSourceCode(newCode);
    setContent(newCode);
    setHasUnsavedChanges(true);
  };

  const applySourceCode = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = sourceCode;
      setContent(sourceCode);
      setShowSourceCode(false);
      updateCounts();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ddd;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table><p><br></p>';
      execCommand('insertHTML', tableHTML);
    }
  };

  const insertVideo = () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url) {
      const videoHTML = `<video controls style="max-width: 100%;"><source src="${url}"></video><p><br></p>`;
      execCommand('insertHTML', videoHTML);
    }
  };

  const insertAudio = () => {
    const url = prompt('Enter audio URL:');
    if (url) {
      const audioHTML = `<audio controls><source src="${url}"></audio><p><br></p>`;
      execCommand('insertHTML', audioHTML);
    }
  };

  const insertCodeBlock = () => {
    const code = prompt('Enter code:');
    if (code) {
      const codeHTML = `<pre style="background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>${code}</code></pre><p><br></p>`;
      execCommand('insertHTML', codeHTML);
    }
  };

  const insertEmoticon = () => {
    const emoticons = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
    const selected = prompt(`Choose an emoticon (enter number 1-${emoticons.length}):\n${emoticons.map((e, i) => `${i + 1}: ${e}`).join(' ')}`);
    if (selected) {
      const index = parseInt(selected) - 1;
      if (index >= 0 && index < emoticons.length) {
        execCommand('insertHTML', emoticons[index]);
      }
    }
  };

  const insertHorizontalLine = () => {
    execCommand('insertHTML', '<hr style="border: 1px solid #ddd; margin: 16px 0;"><p><br></p>');
  };

  const insertChecklist = () => {
    const checklistHTML = `
      <ul style="list-style: none; padding-left: 0;">
        <li><input type="checkbox" style="margin-right: 8px;"> Task 1</li>
        <li><input type="checkbox" style="margin-right: 8px;"> Task 2</li>
        <li><input type="checkbox" style="margin-right: 8px;"> Task 3</li>
      </ul><p><br></p>
    `;
    execCommand('insertHTML', checklistHTML);
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
    setShowFontSize(false);
  };

  const changeFontFamily = (font: string) => {
    execCommand('fontName', font);
    setShowFontFamily(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(showSourceCode ? sourceCode : content);
      setHasUnsavedChanges(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        execCommand('insertImage', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  const fontFamilies = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS'];

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-full max-w-[95vw] h-[90vh] rounded-lg shadow-2xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">{fileName}</h2>
            {hasUnsavedChanges && <span className="text-xs text-orange-500">● Unsaved</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSourceCode(!showSourceCode)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Toggle Source Code"
            >
              <FileCode className="w-4 h-4" />
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {!showSourceCode && !readOnly && (
          <div className="border-b bg-gray-50 p-2 overflow-x-auto">
            <div className="flex flex-wrap gap-1">
              {/* Text Formatting */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={() => execCommand('undo')} className="p-2 hover:bg-gray-200 rounded" title="Undo">
                  <Undo className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('redo')} className="p-2 hover:bg-gray-200 rounded" title="Redo">
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* Headings */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-gray-200 rounded" title="Heading 1">
                  <Heading1 className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-gray-200 rounded" title="Heading 2">
                  <Heading2 className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('formatBlock', 'h3')} className="p-2 hover:bg-gray-200 rounded" title="Heading 3">
                  <Heading3 className="w-4 h-4" />
                </button>
              </div>

              {/* Inline Styles */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded font-bold" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded italic" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded underline" title="Underline">
                  <Underline className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('strikeThrough')} className="p-2 hover:bg-gray-200 rounded" title="Strikethrough">
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('subscript')} className="p-2 hover:bg-gray-200 rounded" title="Subscript">
                  <Subscript className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('superscript')} className="p-2 hover:bg-gray-200 rounded" title="Superscript">
                  <Superscript className="w-4 h-4" />
                </button>
              </div>

              {/* Font */}
              <div className="flex gap-1 border-r pr-2 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowFontFamily(!showFontFamily)}
                    className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                    title="Font Family"
                  >
                    <Type className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showFontFamily && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10 min-w-[150px]">
                      {fontFamilies.map((font) => (
                        <button
                          key={font}
                          onClick={() => changeFontFamily(font)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFontSize(!showFontSize)}
                    className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                    title="Font Size"
                  >
                    <span className="text-xs">Size</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showFontSize && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
                      {fontSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => changeFontSize(size)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100"
                        >
                          Size {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="flex gap-1 border-r pr-2">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="Text Color"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 z-10">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => {
                          setSelectedColor(e.target.value);
                          execCommand('foreColor', e.target.value);
                        }}
                        className="w-20 h-8"
                      />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="Background Color"
                  >
                    <Highlighter className="w-4 h-4" />
                  </button>
                  {showBgColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 z-10">
                      <input
                        type="color"
                        value={selectedBgColor}
                        onChange={(e) => {
                          setSelectedBgColor(e.target.value);
                          execCommand('backColor', e.target.value);
                        }}
                        className="w-20 h-8"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Alignment */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded" title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded" title="Align Center">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded" title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('justifyFull')} className="p-2 hover:bg-gray-200 rounded" title="Justify">
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded" title="Numbered List">
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button onClick={insertChecklist} className="p-2 hover:bg-gray-200 rounded" title="Checklist">
                  <Check className="w-4 h-4" />
                </button>
              </div>

              {/* Insert */}
              <div className="flex gap-1 border-r pr-2">
                <button onClick={insertLink} className="p-2 hover:bg-gray-200 rounded" title="Insert Link">
                  <Link className="w-4 h-4" />
                </button>
                <button onClick={insertImage} className="p-2 hover:bg-gray-200 rounded" title="Insert Image URL">
                  <Image className="w-4 h-4" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-200 rounded" title="Upload Image">
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button onClick={insertTable} className="p-2 hover:bg-gray-200 rounded" title="Insert Table">
                  <Table className="w-4 h-4" />
                </button>
                <button onClick={insertVideo} className="p-2 hover:bg-gray-200 rounded" title="Insert Video">
                  <Video className="w-4 h-4" />
                </button>
                <button onClick={insertAudio} className="p-2 hover:bg-gray-200 rounded" title="Insert Audio">
                  <Music className="w-4 h-4" />
                </button>
              </div>

              {/* More */}
              <div className="flex gap-1">
                <button onClick={() => execCommand('formatBlock', 'blockquote')} className="p-2 hover:bg-gray-200 rounded" title="Block Quote">
                  <Quote className="w-4 h-4" />
                </button>
                <button onClick={insertCodeBlock} className="p-2 hover:bg-gray-200 rounded" title="Code Block">
                  <Code className="w-4 h-4" />
                </button>
                <button onClick={insertHorizontalLine} className="p-2 hover:bg-gray-200 rounded" title="Horizontal Line">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={insertEmoticon} className="p-2 hover:bg-gray-200 rounded" title="Emoticon">
                  <Smile className="w-4 h-4" />
                </button>
                <button onClick={() => execCommand('indent')} className="p-2 hover:bg-gray-200 rounded" title="Indent">
                  →
                </button>
                <button onClick={() => execCommand('outdent')} className="p-2 hover:bg-gray-200 rounded" title="Outdent">
                  ←
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showSourceCode ? (
            <div className="flex-1 flex flex-col p-4">
              <textarea
                value={sourceCode}
                onChange={handleSourceCodeChange}
                className="flex-1 font-mono text-sm border rounded p-4 resize-none"
                spellCheck={false}
              />
              <button
                onClick={applySourceCode}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Changes
              </button>
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable={!readOnly}
              onInput={handleContentChange}
              className="flex-1 p-6 overflow-auto focus:outline-none"
              style={{
                minHeight: '300px',
                lineHeight: '1.6',
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-4">
            <span>Characters: {characterCount}</span>
            <span>Words: {wordCount}</span>
          </div>
          <div className="text-xs text-gray-500">
            {fileType.toUpperCase()} Editor
          </div>
        </div>
      </div>
    </div>
  );
}
