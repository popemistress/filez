"use client";

import { useEffect, useState, useMemo } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DocumentCard, { DocumentMetadata } from "./components/DocumentCard";
import DocumentsList from "./components/DocumentsList";
import DocumentPreviewList from "./components/DocumentPreviewList";
import FilterBar from "./components/FilterBar";
import EnhancedDocumentViewer from "./components/EnhancedDocumentViewer";
import EnhancedUploadModal from "./components/EnhancedUploadModal";
import CreateFolderModal from "./components/CreateFolderModal";
import FolderCard from "./components/FolderCard";
import BulkActionsBar from "./components/BulkActionsBar";
import ShareFileModal from "./components/ShareFileModal";
import { ChevronRight } from "lucide-react";

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [shareFile, setShareFile] = useState<DocumentMetadata | null>(null);

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/uploads");
      const data = await res.json();
      
      const transformedData: DocumentMetadata[] = data.map((upload: any, index: number) => ({
        ...upload,
        tags: upload.tags || [], // Use tags from database, default to empty array
        documentType: generateDocumentType(upload.fileType),
        referenceNumber: `#${1999 + index}`,
      }));
      
      setUploads(transformedData);
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      setFolders(data);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const generateDocumentType = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word Document';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Spreadsheet';
    if (fileType.includes('epub')) return 'EPUB';
    return 'Document';
  };

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    uploads.forEach(doc => doc.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [uploads]);

  const availableDocTypes = useMemo(() => {
    const types = new Set<string>();
    uploads.forEach(doc => {
      if (doc.documentType) types.add(doc.documentType);
    });
    return Array.from(types).sort();
  }, [uploads]);

  // Filter documents by folder and other criteria
  const filteredDocuments = useMemo(() => {
    let filtered = uploads.filter(doc => doc.folderId === currentFolder);

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(doc =>
        doc.tags?.some(tag => selectedTags.includes(tag))
      );
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
  }, [uploads, currentFolder, searchQuery, selectedTags, selectedDocType, sortBy]);

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
    if (doc) setSelectedDocument(doc);
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with id:', id);
    
    // Use window.confirm explicitly for better cross-browser compatibility
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    console.log('Confirm result:', confirmed);
    
    if (!confirmed) {
      console.log('User cancelled delete');
      return;
    }
    
    console.log('Sending DELETE request to /api/uploads/' + id);
    try {
      const res = await fetch(`/api/uploads/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        // Firefox-specific: ensure no caching
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error('Delete failed:', data);
        alert(`Failed to delete file: ${data.error || 'Unknown error'}`);
        return;
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      console.log('File deleted successfully');
      
      // Update local state immediately without refetching
      setUploads(prev => prev.filter(u => u.id !== id));
      
    } catch (error) {
      console.error('Failed to delete document:', error);
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

  const handleEdit = (id: string) => {
    // For now, just open the document viewer
    // In a full implementation, this would open an editor
    const doc = uploads.find(u => u.id === id);
    if (doc) {
      alert(`Edit functionality for ${doc.name} will be implemented soon.`);
    }
  };

  const handleCreateFolder = async (name: string, color?: string) => {
    console.log('Creating folder:', name, 'with color:', color);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: currentFolder, color })
      });
      if (res.ok) {
        console.log('Folder created successfully');
        await fetchFolders();
      } else {
        const data = await res.json();
        console.error('Failed to create folder:', data);
        alert('Failed to create folder: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
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
      console.error('Failed to move file:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string, fileCount: number) => {
    console.log('handleDeleteFolder called with folderId:', folderId, 'fileCount:', fileCount);
    
    let confirmed;
    if (fileCount > 0) {
      confirmed = window.confirm(
        `This folder contains ${fileCount} file${fileCount > 1 ? 's' : ''}. Deleting this folder will also delete all files inside it. Are you sure you want to continue?`
      );
    } else {
      confirmed = window.confirm('Are you sure you want to delete this folder?');
    }
    
    console.log('Confirm result:', confirmed);
    if (!confirmed) {
      console.log('User cancelled folder delete');
      return;
    }

    console.log('Sending DELETE request to /api/folders/' + folderId);
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
      console.log('Folder delete response status:', res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error('Folder delete failed:', data);
        alert('Failed to delete folder: ' + (data.error || 'Unknown error'));
        return;
      }
      
      const data = await res.json();
      console.log('Folder delete response data:', data);
      console.log('Folder deleted successfully');
      
      // Update local state immediately
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (currentFolder === folderId) {
        setCurrentFolder(null);
      }
      
      // Refresh uploads to show files that were in the deleted folder
      await fetchUploads();
      
    } catch (error) {
      console.error('Failed to delete folder:', error);
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
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedFiles.size} file${selectedFiles.size > 1 ? 's' : ''}?`
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
      console.error('Failed to delete files:', error);
      alert('Failed to delete some files. Please try again.');
    }
  };

  const handleBulkMove = async (targetFolderId: string | null) => {
    if (selectedFiles.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedFiles).map(fileId =>
          fetch('/api/uploads/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId, folderId: targetFolderId })
          })
        )
      );
      
      setSelectedFiles(new Set());
      setSelectionMode(false);
      await fetchUploads();
    } catch (error) {
      console.error('Failed to move files:', error);
      alert('Failed to move some files. Please try again.');
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
              folderId: targetFolderId,
              tags: file.tags
            })
          })
        )
      );
      
      setSelectedFiles(new Set());
      setSelectionMode(false);
      await fetchUploads();
    } catch (error) {
      console.error('Failed to copy files:', error);
      alert('Failed to copy some files. Please try again.');
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchFolders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery, selectedTags, selectedDocType, currentFolder]);

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
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          totalCount={filteredDocuments.length}
          onResetFilters={handleResetFilters}
          onSortChange={setSortBy}
          onViewChange={setViewMode}
          currentView={viewMode}
          onTagsFilter={setSelectedTags}
          onDocTypeFilter={setSelectedDocType}
          availableTags={availableTags}
          availableDocTypes={availableDocTypes}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          onUploadClick={() => setShowUploadModal(true)}
          onCreateFolderClick={() => setShowCreateFolderModal(true)}
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
                      onEdit={handleEdit}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              ) : viewMode === 'preview' ? (
                <DocumentPreviewList
                  documents={paginatedDocuments}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onEdit={handleEdit}
                  onShare={handleShare}
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
        <EnhancedDocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {shareFile && (
        <ShareFileModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onUpdate={fetchUploads}
        />
      )}
      </div>
    </DndProvider>
  );
}
