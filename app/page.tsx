"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DocumentCard, { DocumentMetadata } from "./components/DocumentCard";
import DocumentsList from "./components/DocumentsList";
import DocumentPreviewList from "./components/DocumentPreviewList";
import FilterBar from "./components/FilterBar";
import EnhancedDocumentViewer from "./components/EnhancedDocumentViewer";
import { AlertDialog } from "./components/ui/DialogVariants";
import RenameDialog from "./components/RenameDialog";
import { useConfirmDialog } from "./hooks/useDialog";
import EnhancedUploadModal from "./components/EnhancedUploadModal";
import CreateFolderModal from "./components/CreateFolderModal";
import FolderCard from "./components/FolderCard";
import BulkActionsBar from "./components/BulkActionsBar";
import ShareFileModal from "./components/ShareFileModal";
import EpubReaderModal from "./components/EpubReaderModal";
import ImageViewer from "./components/ImageViewer";
import ImportModal from "./components/ImportModal";
import VersionHistoryModal from "./components/VersionHistoryModal";
import AdvancedSearchBar from "./components/AdvancedSearchBar";
import UploadStatusIndicator from "./components/UploadStatusIndicator";
import OfficeDocumentViewer from "./components/OfficeDocumentViewer";
import dynamic from 'next/dynamic';
import { ChevronRight } from "lucide-react";

// Dynamic imports for client-only components
const SpreadsheetEditor = dynamic(() => import('./components/SpreadsheetEditor'), { ssr: false });
const PdfViewer = dynamic(() => import('./components/PdfViewer'), { ssr: false });
const CodeEditor = dynamic(() => import('./components/CodeEditor'), { ssr: false });
const WYSIWYGEditor = dynamic(() => import('./components/WYSIWYGEditor'), { ssr: false });
const MindMapEditor = dynamic(() => import('./components/MindMapEditor'), { ssr: false });

interface FolderType {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
}

export default function Home() {
  const [uploads, setUploads] = useState<DocumentMetadata[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'preview'>('grid');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dialog hooks
  const { dialogState, closeDialog, confirmDialog, cancelDialog, confirm } = useConfirmDialog();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [shareFile, setShareFile] = useState<DocumentMetadata | null>(null);
  const [epubDocument, setEpubDocument] = useState<DocumentMetadata | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<Array<{src: string, alt: string, downloadUrl?: string}>>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [spreadsheetDocument, setSpreadsheetDocument] = useState<DocumentMetadata | null>(null);
  const [codeDocument, setCodeDocument] = useState<DocumentMetadata | null>(null);
  const [textDocument, setTextDocument] = useState<DocumentMetadata | null>(null);
  const [mindMapDocument, setMindMapDocument] = useState<DocumentMetadata | null>(null);
  const [showMindMapEditor, setShowMindMapEditor] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<DocumentMetadata | null>(null);
  const [officeDocument, setOfficeDocument] = useState<DocumentMetadata | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState<DocumentMetadata | null>(null);
  const [renameDialog, setRenameDialog] = useState<{open: boolean, id: string, currentName: string}>({open: false, id: '', currentName: ''});

  const fetchUploads = useCallback(async () => {
    try {
      const res = await fetch("/api/uploads");
      const data = await res.json();
      
      const transformedData = data.map((upload: Record<string, unknown>, index: number) => ({
        id: upload.id,
        name: upload.name,
        url: upload.url,
        fileType: upload.fileType,
        fileSize: upload.fileSize,
        createdAt: upload.createdAt,
        folderId: upload.folderId,
        documentType: generateDocumentType(upload.fileType as string),
        referenceNumber: `#${1999 + index}`,
      }));
      
      setUploads(transformedData);
    } catch (error) {
      // Silent error handling
    }
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      setFolders(data);
    } catch (error) {
      // Silent error handling
    }
  }, []);

  const generateDocumentType = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('wordprocessingml')) return 'Word Document';
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('spreadsheetml')) return 'Spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('presentationml')) return 'Presentation';
    if (fileType.includes('epub')) return 'EPUB';
    return 'Document';
  };

  const getFolderPath = (folderId: string | null | undefined): string => {
    if (!folderId) return 'Root';
    
    const path: string[] = [];
    let currentId: string | null | undefined = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder.name);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path.length > 0 ? path.join(' / ') : 'Root';
  };


  const availableDocTypes = useMemo(() => {
    const types = new Set<string>();
    uploads.forEach(doc => {
      if (doc.documentType) types.add(doc.documentType);
    });
    return Array.from(types).sort();
  }, [uploads]);

  // Filter documents by folder and other criteria
  const filteredDocuments = useMemo(() => {
    let filtered;
    
    // If there's a search query, search across ALL folders
    if (searchQuery) {
      filtered = uploads.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // If no search query, filter by current folder only
      filtered = uploads.filter(doc => doc.folderId === currentFolder);
    }


    if (selectedDocType) {
      filtered = filtered.filter(doc => doc.documentType === selectedDocType);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'size-desc':
          return (b.fileSize || 0) - (a.fileSize || 0);
        case 'size-asc':
          return (a.fileSize || 0) - (b.fileSize || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [uploads, currentFolder, searchQuery, selectedDocType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredDocuments.slice(start, end);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  // Get folders in current directory
  const currentFolders = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolder);
  }, [folders, currentFolder]);

  const handlePreview = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setSelectedDocument(doc);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      undefined,
      {
        variant: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    );
    
    if (!confirmed) {
      return;
    }
    try {
      const res = await fetch(`/api/uploads/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to delete file: ${data.error || 'Unknown error'}`);
        return;
      }
      
      // Update local state immediately without refetching
      setUploads(prev => prev.filter(u => u.id !== id));
      
    } catch (error) {
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleDownload = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) window.open(doc.url, '_blank');
  };

  const handleShare = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) setShareFile(doc);
  };


  const handleRead = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setEpubDocument(doc);
    }
  };

  const handleViewPdf = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setPdfDocument(doc);
    }
  };

  const handleViewOfficeDocument = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setOfficeDocument(doc);
    }
  };

  const isImageFile = (doc: DocumentMetadata) => {
    return doc.fileType.includes('image') || 
           doc.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
  };

  const handleViewImage = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      const allImages = uploads.filter(u => u.folderId === doc.folderId && isImageFile(u));
      setImageViewerImages(allImages.map(img => ({ src: img.url, alt: img.name, downloadUrl: img.url })));
      setImageViewerIndex(allImages.findIndex(img => img.id === id));
      setImageViewerVisible(true);
    }
  };


  const handleEditSpreadsheet = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setSpreadsheetDocument(doc);
    }
  };




  const handleEditCode = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setCodeDocument(doc);
    }
  };

  const handleEditText = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setTextDocument(doc);
    }
  };


  const handleRename = (id: string, currentName: string) => {
    setRenameDialog({open: true, id, currentName});
  };

  const handleRenameConfirm = async (newName: string) => {
    try {
      const response = await fetch(`/api/uploads/${renameDialog.id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      
      if (response.ok) {
        await fetchUploads();
      } else {
        alert('Failed to rename file');
      }
    } catch (error) {
      alert('Failed to rename file');
    }
  };

  const handleCreateMindMap = () => {
    setMindMapDocument({
      id: '',
      name: 'New Mind Map',
      url: '',
      fileType: 'application/json',
      fileSize: 0,
      documentType: 'Mind Map'
    });
    setShowMindMapEditor(true);
  };

  const handleEditMindMap = (id: string) => {
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      setMindMapDocument(doc);
      setShowMindMapEditor(true);
    }
  };

  const handleMindMapSave = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/mindmap/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: mindMapDocument?.id,
          name: mindMapDocument?.name,
          data
        })
      });
      
      if (response.ok) {
        await fetchUploads();
        setShowMindMapEditor(false);
        setMindMapDocument(null);
      } else {
        alert('Failed to save mind map');
      }
    } catch (error) {
      alert('Failed to save mind map');
    }
  };

  const handleCreateFolder = async (name: string, color?: string) => {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: currentFolder, color })
      });
      if (res.ok) {
        await fetchFolders();
      } else {
        const data = await res.json();
        alert('Failed to create folder: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleResetFilters = () => {
    setSelectedDocType('');
    setSortBy('date-desc');
    setSearchQuery('');
  };

  const handleMoveFile = async (fileId: string, folderId: string) => {
    try {
      const res = await fetch('/api/uploads/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, folderId })
      });
      if (res.ok) {
        fetchUploads();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleDeleteFolder = async (folderId: string, fileCount: number) => {
    const title = 'Delete Folder';
    const description = fileCount > 0 
      ? `This folder contains ${fileCount} file${fileCount > 1 ? 's' : ''}. Deleting this folder will also delete all files inside it. Are you sure you want to continue?`
      : 'Are you sure you want to delete this folder? This action cannot be undone.';
    
    const confirmed = await confirm(
      title,
      description,
      undefined,
      {
        variant: 'danger',
        confirmText: 'Delete Folder',
        cancelText: 'Cancel'
      }
    );
    
    if (!confirmed) {
      return;
    }
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert('Failed to delete folder: ' + (data.error || 'Unknown error'));
        return;
      }
      
      // Update local state immediately
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (currentFolder === folderId) {
        setCurrentFolder(null);
      }
      
      // Refresh uploads to show files that were in the deleted folder
      await fetchUploads();
      
    } catch (error) {
      alert('Failed to delete folder. Please try again.');
    }
  };

  // Bulk selection handlers
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === paginatedDocuments.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(paginatedDocuments.map(doc => doc.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    const confirmed = await confirm(
      'Delete Files',
      `Are you sure you want to delete ${selectedFiles.size} file${selectedFiles.size > 1 ? 's' : ''}? This action cannot be undone.`,
      undefined,
      {
        variant: 'danger',
        confirmText: `Delete ${selectedFiles.size} File${selectedFiles.size > 1 ? 's' : ''}`,
        cancelText: 'Cancel'
      }
    );
    
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedFiles).map(fileId =>
          fetch(`/api/uploads/${fileId}`, { method: 'DELETE' })
        )
      );
      
      setSelectedFiles(new Set());
      setSelectionMode(false);
      await fetchUploads();
    } catch (error) {
      alert('Failed to delete some files. Please try again.');
    }
  };

  const handleBulkMove = async (targetFolderId: string | null) => {
    if (selectedFiles.size === 0) return;

    // Optimistic update - instant UI feedback
    const movedFileIds = Array.from(selectedFiles);
    setUploads(prev => prev.map(file => 
      movedFileIds.includes(file.id) 
        ? { ...file, folderId: targetFolderId }
        : file
    ));
    setSelectedFiles(new Set());
    setSelectionMode(false);

    try {
      // Background API calls
      await Promise.all(
        movedFileIds.map(fileId =>
          fetch('/api/uploads/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId, folderId: targetFolderId })
          })
        )
      );
    } catch (error) {
      alert('Failed to move some files. Refreshing...');
      await fetchUploads();
    }
  };

  const handleBulkCopy = async (targetFolderId: string | null) => {
    if (selectedFiles.size === 0) return;

    try {
      const filesToCopy = uploads.filter(u => selectedFiles.has(u.id));
      
      await Promise.all(
        filesToCopy.map(file =>
          fetch('/api/uploads/copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url: file.url,
              name: `${file.name} (copy)`,
              fileType: file.fileType,
              fileSize: file.fileSize,
              folderId: targetFolderId
            })
          })
        )
      );
      
      setSelectedFiles(new Set());
      setSelectionMode(false);
      await fetchUploads();
    } catch (error) {
      alert('Failed to copy some files. Please try again.');
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchFolders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery, selectedDocType, currentFolder]);

  const breadcrumbs = useMemo(() => {
    const crumbs: FolderType[] = [];
    let folderId = currentFolder;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        crumbs.unshift(folder);
        folderId = folder.parentId || null;
      } else {
        break;
      }
    }
    
    return crumbs;
  }, [currentFolder, folders]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen" style={{ backgroundColor: '#F7F8FA' }}>
        <main className="w-full">
        {/* Header */}
        <div className="bg-white px-8 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import
            </button>
          </div>
        </div>

        {/* Advanced Search Bar */}
        <div className="bg-white px-8 py-3 border-b">
          <AdvancedSearchBar
            onSearch={(query) => setSearchQuery(query)}
          />
        </div>

        {/* Filter Bar */}
        <FilterBar 
          totalCount={filteredDocuments.length}
          onResetFilters={handleResetFilters}
          onSortChange={setSortBy}
          onViewChange={setViewMode}
          currentView={viewMode}
          onDocTypeFilter={setSelectedDocType}
          availableDocTypes={availableDocTypes}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          onUploadClick={() => setShowUploadModal(true)}
          onCreateFolderClick={() => setShowCreateFolderModal(true)}
          onCreateMindMapClick={handleCreateMindMap}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="bg-white px-8 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setCurrentFolder(null)}
                className="text-blue-600 hover:underline"
              >
                All Files
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => setCurrentFolder(crumb.id)}
                    className={`${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-900 font-medium'
                        : 'text-blue-600 hover:underline'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <section className="p-8">
          {/* Folders */}
          {currentFolders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Folders
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {currentFolders.map(folder => {
                  const fileCount = uploads.filter(u => u.folderId === folder.id).length;
                  return (
                    <FolderCard
                      key={folder.id}
                      id={folder.id}
                      name={folder.name}
                      color={folder.color}
                      fileCount={fileCount}
                      onClick={() => setCurrentFolder(folder.id)}
                      onMoveFile={handleMoveFile}
                      onDelete={handleDeleteFolder}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          {paginatedDocuments.length === 0 && currentFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-7xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {uploads.length === 0
                  ? 'Upload your first document to get started'
                  : 'Try adjusting your filters or navigate to a different folder'
                }
              </p>
            </div>
          ) : paginatedDocuments.length > 0 ? (
            <>
              {currentFolders.length > 0 && (
                <h3 className="text-sm font-medium text-gray-700 mb-3 mt-6">Files</h3>
              )}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                  {paginatedDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onPreview={handlePreview}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onShare={handleShare}
                      onRead={handleRead}
                      onViewImage={handleViewImage}
                      onViewPdf={handleViewPdf}
                      onViewOfficeDocument={handleViewOfficeDocument}
                      onEditSpreadsheet={handleEditSpreadsheet}
                      onEditCode={handleEditCode}
                      onEditText={handleEditText}
                      onEditMindMap={handleEditMindMap}
                      onRename={handleRename}
                      folderPath={getFolderPath(doc.folderId)}
                      showFolderPath={!!searchQuery}
                    />
                  ))}
                </div>
              ) : viewMode === 'preview' ? (
                <DocumentPreviewList
                  documents={paginatedDocuments}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onRead={handleRead}
                  onViewImage={handleViewImage}
                  onViewPdf={handleViewPdf}
                  onViewOfficeDocument={handleViewOfficeDocument}
                  onEditSpreadsheet={handleEditSpreadsheet}
                  onEditCode={handleEditCode}
                  getFolderPath={getFolderPath}
                  showFolderPath={!!searchQuery}
                />
              ) : (
                <DocumentsList
                  documents={paginatedDocuments}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  selectionMode={true}
                  selectedFiles={selectedFiles}
                  onToggleSelect={toggleFileSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onShare={handleShare}
                  getFolderPath={getFolderPath}
                  showFolderPath={!!searchQuery}
                />
              )}
            </>
          ) : null}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 pb-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              «
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-0.5 text-xs rounded ${
                    currentPage === pageNum
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              »
            </button>
          </div>
        )}
      </main>

      {/* Bulk Actions Bar */}
      {selectedFiles.size > 0 && viewMode === 'list' && (
        <BulkActionsBar
          selectedCount={selectedFiles.size}
          onDelete={handleBulkDelete}
          onMove={handleBulkMove}
          onCopy={handleBulkCopy}
          onCancel={() => {
            setSelectedFiles(new Set());
          }}
          folders={folders}
          currentFolder={currentFolder}
        />
      )}

      {/* Modals */}
      {showUploadModal && (
        <EnhancedUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={fetchUploads}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {selectedDocument && (
        <>
          {(selectedDocument.fileType === 'application/pdf' || selectedDocument.name.toLowerCase().endsWith('.pdf')) ? (
            <PdfViewer
              documentUrl={selectedDocument.url}
              documentName={selectedDocument.name}
              onClose={() => setSelectedDocument(null)}
            />
          ) : (
            <EnhancedDocumentViewer
              document={selectedDocument}
              onClose={() => setSelectedDocument(null)}
            />
          )}
        </>
      )}

      {shareFile && (
        <ShareFileModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onUpdate={fetchUploads}
        />
      )}

      {epubDocument && (
        <EpubReaderModal
          document={epubDocument}
          onClose={() => setEpubDocument(null)}
        />
      )}

      <ImageViewer
        images={imageViewerImages}
        visible={imageViewerVisible}
        onClose={() => setImageViewerVisible(false)}
        activeIndex={imageViewerIndex}
        downloadable={true}
        zoomable={true}
        rotatable={true}
        loop={true}
        showTotal={true}
      />



      {/* pdfViewerDocument removed - using unified PDF viewer */}

      {spreadsheetDocument && (
        <SpreadsheetEditor
          documentUrl={spreadsheetDocument.url}
          documentId={spreadsheetDocument.id}
          documentName={spreadsheetDocument.name}
          onSave={(data) => {
            fetchUploads();
          }}
          onClose={() => setSpreadsheetDocument(null)}
        />
      )}

      {/* Mind maps now open in popup windows */}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={async () => {
            await fetchUploads();
            await fetchFolders();
          }}
          currentFolderId={currentFolder}
        />
      )}

      {showVersionHistory && (
        <VersionHistoryModal
          documentId={showVersionHistory.id}
          documentName={showVersionHistory.name}
          onClose={() => setShowVersionHistory(null)}
          onRestore={(version) => {
            setShowVersionHistory(null);
          }}
        />
      )}

      {codeDocument && (
        <CodeEditor
          documentUrl={codeDocument.url}
          documentId={codeDocument.id}
          documentName={codeDocument.name}
          fileType={codeDocument.fileType}
          onClose={() => setCodeDocument(null)}
          onSave={async (content) => {
            // Save functionality to be implemented
          }}
        />
      )}

      {textDocument && (
        <WYSIWYGEditor
          initialContent=""
          fileName={textDocument.name}
          fileType={textDocument.fileType}
          onClose={() => setTextDocument(null)}
          onSave={async (content) => {
            // Save functionality to be implemented
          }}
        />
      )}

      {/* PDF Viewer */}
      {pdfDocument && (
        <PdfViewer
          documentUrl={pdfDocument.url}
          documentName={pdfDocument.name}
          onClose={() => setPdfDocument(null)}
        />
      )}

      {/* Office Document Viewer */}
      {officeDocument && (
        <OfficeDocumentViewer
          document={officeDocument}
          onClose={() => setOfficeDocument(null)}
        />
      )}

      {/* Upload Status Indicator */}
      <UploadStatusIndicator />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={dialogState.open}
        onClose={closeDialog}
        title={dialogState.title}
        description={dialogState.description}
        onConfirm={confirmDialog}
        onCancel={cancelDialog}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant === 'default' ? 'warning' : dialogState.variant}
      />

      <RenameDialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({open: false, id: '', currentName: ''})}
        onConfirm={handleRenameConfirm}
        currentName={renameDialog.currentName}
      />

      {/* Mind Map Editor */}
      {showMindMapEditor && mindMapDocument && (
        <MindMapEditor
          documentId={mindMapDocument.id}
          documentUrl={mindMapDocument.url}
          documentName={mindMapDocument.name}
          onClose={() => {
            setShowMindMapEditor(false);
            setMindMapDocument(null);
          }}
          onSave={handleMindMapSave}
        />
      )}

      </div>
    </DndProvider>
  );
}
