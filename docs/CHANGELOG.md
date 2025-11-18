# Changelog

## [Major Update] - 2025-01-17

### 🎨 New Mind Map Editor
- **Create Mind Map** - Added to "New Item" dropdown menu
- **Interactive Canvas** - Drag and drop nodes, create connections
- **Node Editing** - Double-click to edit labels
- **Custom Styling** - Change colors and shapes (rectangle, circle, diamond)
- **Auto Layout** - Automatic hierarchical layout with Dagre
- **Export/Save** - Save as .map JSON file
- **Version Control** - Track changes to mind maps

### 🔍 Advanced Search & Discovery
- **Full-Text Search** - Search document content, not just filenames
- **Advanced Search Bar** - Dedicated search interface with filters
- **Saved Searches** - Save frequently used searches for quick access
- **Search History** - Access recent searches
- **PostgreSQL Full-Text Index** - Fast, efficient searching with ranking

### ⭐ Bookmarking System
- **Bookmark Files** - Mark important documents for quick access
- **Bookmark Toggle** - One-click bookmark/unbookmark
- **Bookmark Filter** - View only bookmarked files
- **Visual Indicator** - Yellow bookmark icon for bookmarked files
- **Persistent Storage** - Bookmarks saved to database

### 📚 Version Control
- **Document Versions** - Automatic version tracking for all documents
- **Version History Modal** - View all versions of a document
- **Version Comparison** - See what changed between versions
- **Version Restore** - Revert to any previous version
- **Change Descriptions** - Add notes when creating new versions
- **Version Metadata** - Track who made changes and when

### 📦 Import Capabilities
- **ZIP Import** - Extract and import all files from ZIP archives
- **Folder Import** - Import entire folder structures
- **Batch Upload** - Upload multiple files at once
- **Progress Tracking** - Real-time import progress
- **Error Handling** - Detailed error reporting for failed imports
- **Import Modal** - Dedicated UI for import operations


### 🛠️ Technical Improvements

#### New API Endpoints
- `/api/bookmarks` - Bookmark management (GET, POST, DELETE)
- `/api/saved-searches` - Saved search management (GET, POST, DELETE)
- `/api/versions` - Document version control (GET, POST)
- `/api/search` - Advanced full-text search (GET, POST)
- `/api/import/zip` - ZIP file import (POST)
- `/api/encrypt` - File encryption/decryption (GET, POST)

#### Database Schema Updates
```sql
-- Bookmarks table
CREATE TABLE bookmarks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  upload_id VARCHAR(255) REFERENCES uploads(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved searches table
CREATE TABLE saved_searches (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document versions table
CREATE TABLE document_versions (
  id VARCHAR(255) PRIMARY KEY,
  upload_id VARCHAR(255) REFERENCES uploads(id),
  version INTEGER NOT NULL,
  url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_description TEXT
);

-- Full-text search column
ALTER TABLE uploads ADD COLUMN searchable_content TEXT;

-- Encryption columns
ALTER TABLE uploads ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE uploads ADD COLUMN encryption_metadata TEXT;
```

#### New Components
- `AdvancedSearchBar.tsx` - Advanced search interface with saved searches
- `ImportModal.tsx` - ZIP and folder import interface
- `VersionHistoryModal.tsx` - Document version history viewer
- `MindMeisterEditor.tsx` - Interactive mind map editor

#### New Dependencies
```json
{
  "jszip": "^3.10.1",
  "crypto-js": "^4.2.0",
  "fuse.js": "^7.0.0",
  "reactflow": "^11.10.4",
  "dagre": "^0.8.5"
}
```

### 🎯 Feature Highlights

#### Mind Map Editor
- **ReactFlow** - Professional node-based UI
- **Dagre Layout** - Automatic graph layout algorithm
- **Custom Nodes** - Editable, styled nodes with shapes
- **Smooth Connections** - Animated edges with arrows
- **Export Format** - JSON-based .map file format

#### Search System
- **PostgreSQL FTS** - Full-text search with ranking
- **Multi-field Search** - Search names and content
- **Filter Support** - Combine with folder, type, and tag filters
- **Saved Searches** - Name and save search queries
- **Quick Access** - Load saved searches with one click

#### Import System
- **JSZip Integration** - Extract ZIP files in browser
- **Folder API** - Native folder selection support
- **Progress UI** - Visual feedback during import
- **Error Recovery** - Continue importing even if some files fail
- **Folder Context** - Import directly into current folder

### 🐛 Bug Fixes
- Fixed PDF viewer not loading PDFs (worker configuration)
- Fixed TypeScript errors in bookmark system
- Fixed duplicate `onSearchChange` prop in FilterBar
- Fixed DocumentMetadata interface property names

### 📊 Performance Improvements
- **Database Indexes** - Added indexes for bookmarks, versions, and search
- **Lazy Loading** - Dynamic imports for heavy components
- **Optimized Queries** - Efficient PostgreSQL queries with proper joins
- **Caching** - Client-side caching of bookmarks and searches

### 🎨 UI/UX Enhancements
- **Import Button** - Prominent purple button in header
- **Advanced Search Bar** - Dedicated search section
- **Bookmark Toggle** - Visual feedback for bookmarked state
- **Version History** - Clean, timeline-style version display
- **Mind Map Canvas** - Professional graph editor interface
- **Progress Indicators** - Loading states for all async operations

### 🔒 Security Features
- **AES-256 Encryption** - Industry-standard encryption
- **Password Protection** - User-controlled encryption keys
- **Metadata Privacy** - Encrypted file metadata
- **Secure Storage** - Encrypted data in database

---

## [Previous Update] - 2025-11-16

### ✨ New Features

#### All File Type Support
- **Removed file type restrictions** - Now accepts any file type (images, videos, PDFs, documents, etc.)
- **Increased file size limits:**
  - Images: 16MB (up from 4MB)
  - Videos: 1GB (unchanged)
  - PDFs: 16MB
  - Text files: 16MB
  - Other files (blob): 512MB

#### Enhanced Preview System
- **PDF Preview** - View PDFs directly in the browser before uploading
- **Video Preview** - Preview videos before uploading
- **Image Preview** - Preview images before uploading
- **Generic File Preview** - Shows file icon and type for other file formats

#### Improved File Display
- **PDF Files** - Displayed with PDF icon and red background
- **Generic Files** - Displayed with file icon and file type label
- **Clickable Links** - All uploaded files are clickable to open in new tab
- **File Size Display** - Shows file size in MB during preview

### 🔧 Technical Changes

#### Backend (`app/api/uploadthing/core.ts`)
```typescript
// Added support for multiple file types
{
  image: { maxFileSize: "16MB" },
  video: { maxFileSize: "1GB" },
  pdf: { maxFileSize: "16MB" },
  text: { maxFileSize: "16MB" },
  blob: { maxFileSize: "512MB" }
}
```

#### Frontend (`app/page.tsx`)
- Removed `accept` restriction from dropzone
- Added conditional rendering for different file types:
  - Images → `<Image>` component
  - Videos → `<video>` element
  - PDFs → `<iframe>` for preview
  - Others → Icon with file type label
- Added file size calculation and display
- Added null check for file object to prevent errors

#### Configuration (`next.config.ts`)
- Added `utfs.io` to allowed image domains for UploadThing

### 🐛 Bug Fixes
- Fixed `URL.createObjectURL` error by adding null check
- Fixed file size calculation formula
- Fixed image loading error for UploadThing hosted images

### 📦 Supported File Types

#### Fully Supported with Preview
- **Images**: JPG, PNG, GIF, WebP, SVG, etc.
- **Videos**: MP4, WebM, OGG, etc.
- **PDFs**: Full preview in browser

#### Supported with Icon Display
- **Documents**: DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Code**: JS, TS, PY, HTML, CSS, JSON, etc.
- **Text**: TXT, MD, CSV, etc.
- **Any other file type** up to 512MB

### 🎯 Usage

1. **Upload any file** - Drag and drop or click to select
2. **Preview** - See preview for images, videos, and PDFs
3. **View uploaded files** - Click on any uploaded file to open in new tab
4. **File information** - See file name, type, and size

### 🔐 Security Notes
- All files are uploaded to UploadThing's secure CDN
- File metadata is stored in PostgreSQL database
- Files are accessible via direct URL (consider adding authentication if needed)

### 📝 Next Steps (Optional Enhancements)
- Add Office document preview (requires external service)
- Add file deletion functionality
- Add file search/filter
- Add file categories/tags
- Add user authentication
- Add download statistics
