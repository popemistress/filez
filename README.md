# Next.js File Upload with UploadThing

A modern file upload application built with Next.js, featuring drag-and-drop functionality using react-dropzone, file uploads via UploadThing, and PostgreSQL database storage.

## Features

- 🎯 **Drag & Drop** - Upload files by dragging and dropping or clicking to select
- 📸 **Image & Video Support** - Upload and display both images and videos
- 📊 **Upload Progress** - Real-time progress bar during uploads
- 🗄️ **PostgreSQL Database** - Store upload metadata in PostgreSQL
- ⚡ **Next.js 15** - Built with the latest Next.js App Router
- 🎨 **Tailwind CSS** - Modern, responsive UI styling

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally or remotely
- UploadThing account (sign up at [uploadthing.com](https://uploadthing.com))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
UPLOADTHING_TOKEN=your_uploadthing_token_here
DATABASE_URL=postgresql://username:password@localhost:5432/fileupload?schema=public
```

- Get your `UPLOADTHING_TOKEN` from the [UploadThing Dashboard](https://uploadthing.com/dashboard)
- Update `DATABASE_URL` with your PostgreSQL connection string

### 3. Initialize Database

Run the database initialization script to create the required tables:

```bash
npm run db:init
```

This will create the `uploads` table in your PostgreSQL database.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses a single `uploads` table:

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

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── uploadthing/
│   │   │   ├── core.ts       # UploadThing file router configuration
│   │   │   └── route.ts      # UploadThing API route handler
│   │   └── uploads/
│   │       └── route.ts      # API endpoint to fetch uploads
│   ├── page.tsx              # Main upload page with drag & drop
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── db/
│   ├── schema.sql            # Database schema
│   └── init.ts               # Database initialization script
├── lib/
│   ├── db.ts                 # PostgreSQL connection pool
│   └── uploadthing.ts        # UploadThing React helpers
└── package.json
```

## Technologies Used

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[UploadThing](https://uploadthing.com/)** - File upload service
- **[react-dropzone](https://react-dropzone.js.org/)** - Drag and drop file uploads
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[pg](https://node-postgres.com/)** - PostgreSQL client for Node.js
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database schema

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [UploadThing Documentation](https://docs.uploadthing.com/)
- [react-dropzone Documentation](https://react-dropzone.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
# filez
# filez
