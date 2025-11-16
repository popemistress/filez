# Changelog

## [Latest Update] - 2025-11-16

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
