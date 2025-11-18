"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  X, Download, Upload, Save, Plus, Trash2, Copy,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  FileSpreadsheet, Undo, Redo
} from 'lucide-react';

interface SpreadsheetEditorProps {
  documentUrl?: string;
  documentId?: string;
  documentName?: string;
  onClose?: () => void;
  onSave?: (data: any) => void;
}

type CellData = CellBase<any>;

export default function SpreadsheetEditor({ 
  documentUrl, 
  documentId,
  documentName = 'Untitled Spreadsheet', 
  onClose,
  onSave 
}: SpreadsheetEditorProps) {
  const [data, setData] = useState<Matrix<CellData>>([
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
  ]);
  const [sheetName, setSheetName] = useState(documentName);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load spreadsheet from URL
  useEffect(() => {
    if (documentUrl) {
      loadSpreadsheet(documentUrl);
    }
  }, [documentUrl]);

  const loadSpreadsheet = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      // Convert to spreadsheet format
      const spreadsheetData: Matrix<CellData> = (jsonData as any[][]).map(row =>
        row.map(cell => ({ value: cell }))
      );
      
      // Ensure minimum size
      while (spreadsheetData.length < 20) {
        spreadsheetData.push(Array(8).fill({ value: '' }));
      }
      
      setData(spreadsheetData);
      setSheetName(firstSheetName);
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
      alert('Failed to load spreadsheet');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      const spreadsheetData: Matrix<CellData> = (jsonData as any[][]).map(row =>
        row.map(cell => ({ value: cell }))
      );
      
      while (spreadsheetData.length < 20) {
        spreadsheetData.push(Array(8).fill({ value: '' }));
      }
      
      setData(spreadsheetData);
      setSheetName(file.name.replace(/\.(xlsx|xls)$/, ''));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Failed to import file');
    }
  };

  const handleExport = () => {
    try {
      // Convert spreadsheet data to array format
      const exportData = data.map(row =>
        row.map(cell => cell?.value ?? '')
      );
      
      // Create workbook
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${sheetName}.xlsx`);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export spreadsheet');
    }
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        const exportData = data.map(row =>
          row.map(cell => cell?.value ?? '')
        );
        onSave(exportData);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving:', error);
        alert('Failed to save');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addRow = () => {
    const newRow = Array(data[0]?.length || 8).fill({ value: '' });
    setData([...data, newRow]);
    setHasUnsavedChanges(true);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, { value: '' }]);
    setData(newData);
    setHasUnsavedChanges(true);
  };

  const deleteRow = () => {
    if (data.length > 1) {
      setData(data.slice(0, -1));
      setHasUnsavedChanges(true);
    }
  };

  const deleteColumn = () => {
    if (data[0]?.length > 1) {
      const newData = data.map(row => row.slice(0, -1));
      setData(newData);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <input
              type="text"
              value={sheetName}
              onChange={(e) => {
                setSheetName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-xl font-semibold border-none outline-none focus:border-b-2 focus:border-green-500 bg-transparent"
            />
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-500">● Unsaved changes</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b bg-gray-50 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* File Operations */}
            <div className="flex items-center gap-1 border-r pr-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Import"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row/Column Operations */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={addRow}
                className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center gap-1 transition-colors"
                title="Add Row"
              >
                <Plus className="w-3 h-3" />
                Row
              </button>
              <button
                onClick={addColumn}
                className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center gap-1 transition-colors"
                title="Add Column"
              >
                <Plus className="w-3 h-3" />
                Col
              </button>
              <button
                onClick={deleteRow}
                className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1 transition-colors"
                title="Delete Row"
              >
                <Trash2 className="w-3 h-3" />
                Row
              </button>
              <button
                onClick={deleteColumn}
                className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1 transition-colors"
                title="Delete Column"
              >
                <Trash2 className="w-3 h-3" />
                Col
              </button>
            </div>

            {/* Formatting */}
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-200 rounded" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded" title="Underline">
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-l pl-2">
              <button className="p-2 hover:bg-gray-200 rounded" title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded" title="Align Center">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded" title="Align Right">
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Spreadsheet */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="bg-white shadow-lg">
            <Spreadsheet
              data={data}
              onChange={(newData) => {
                setData(newData);
                setHasUnsavedChanges(true);
              }}
              columnLabels={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{data.length} rows × {data[0]?.length || 0} columns</span>
            <span className="text-xs">Use arrow keys to navigate cells</span>
          </div>
        </div>
      </div>
    </div>
  );
}
