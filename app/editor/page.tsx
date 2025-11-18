"use client";

import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Editor Unavailable</h1>
          </div>
          <p className="text-gray-600 text-lg">
            The DOCX editor has been removed from this application
          </p>
        </div>

        {/* Message */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Feature Removed</h2>
            <p className="text-gray-600 mb-6">
              The DOCX editor functionality has been removed from this application. 
              You can still view and manage your files from the main dashboard.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
