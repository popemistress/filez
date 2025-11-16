# Setup Guide

## What Was Changed

### ✅ Completed Changes

1. **Removed Prisma** - All Prisma-related code and dependencies have been removed
2. **Added PostgreSQL** - Direct PostgreSQL connection using the `pg` package
3. **Database Schema** - Created SQL schema file in `db/schema.sql`
4. **Updated API Routes** - Modified uploadthing core and uploads API to use PostgreSQL
5. **Added UploadThing Styles** - Imported UploadThing styles in `globals.css`
6. **Updated Documentation** - Comprehensive README with setup instructions

### 📦 Files Created

- `lib/db.ts` - PostgreSQL connection pool
- `db/schema.sql` - Database schema
- `db/init.ts` - Database initialization script

### 🔧 Files Modified

- `app/api/uploadthing/core.ts` - Uses PostgreSQL instead of Prisma
- `app/api/uploads/route.ts` - Uses PostgreSQL instead of Prisma
- `package.json` - Removed Prisma, added pg, @types/pg, and tsx
- `app/globals.css` - Added UploadThing styles import
- `README.md` - Updated with comprehensive setup instructions

## Next Steps

### 1. Install Dependencies

Run this command to install the new packages:

```bash
npm install
```

This will install:
- `pg` - PostgreSQL client
- `@types/pg` - TypeScript types for pg
- `tsx` - TypeScript executor for running the database init script

### 2. Create Environment File

Create a `.env` file in the root directory with:

```env
UPLOADTHING_TOKEN=your_uploadthing_token_here
DATABASE_URL=postgresql://username:password@localhost:5432/fileupload?schema=public
```

**To get your UploadThing token:**
1. Go to [uploadthing.com/dashboard](https://uploadthing.com/dashboard)
2. Sign up or log in
3. Create a new app or use an existing one
4. Copy your API token

**For the database URL:**
- Replace `username` with your PostgreSQL username
- Replace `password` with your PostgreSQL password
- Replace `localhost:5432` if your database is hosted elsewhere
- Replace `fileupload` with your database name

### 3. Initialize Database

Run the database initialization script:

```bash
npm run db:init
```

This creates the `uploads` table in your PostgreSQL database.

### 4. Remove Old Prisma Files (Optional)

You can safely delete these files/folders:
- `prisma/` directory
- `lib/prisma.ts`
- `lib/generated/` directory

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to test the application.

## Features Already Implemented

✅ **Drag & Drop** - Using react-dropzone
✅ **File Upload Progress Bar** - Real-time progress tracking
✅ **Image & Video Support** - Both file types supported
✅ **Upload Preview** - Preview files before uploading
✅ **Uploaded Files Display** - Grid view of all uploaded files
✅ **PostgreSQL Storage** - File metadata stored in PostgreSQL
✅ **UploadThing Integration** - File hosting via UploadThing

## Troubleshooting

### TypeScript Errors

The lint errors you see are expected until you run `npm install`. After installation, all TypeScript errors should resolve.

### Database Connection Issues

If you get database connection errors:
1. Ensure PostgreSQL is running
2. Verify your `DATABASE_URL` in `.env` is correct
3. Check that the database exists
4. Verify your PostgreSQL user has proper permissions

### UploadThing Errors

If uploads fail:
1. Verify your `UPLOADTHING_TOKEN` is correct
2. Check the UploadThing dashboard for any issues
3. Ensure you're within your plan's upload limits

## Database Schema

```sql
CREATE TABLE uploads (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

- `POST /api/uploadthing` - Handle file uploads via UploadThing
- `GET /api/uploads` - Fetch all uploaded files from database

## Tech Stack

- **Next.js 15** - App Router
- **React 19** - UI framework
- **UploadThing** - File upload service
- **react-dropzone** - Drag & drop functionality
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **Tailwind CSS** - Styling
