"use client";

import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Check } from 'lucide-react';

interface ShareFileModalProps {
  file: {
    id: string;
    name: string;
    isPublic?: boolean;
    shareToken?: string | null;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareFileModal({ file, onClose, onUpdate }: ShareFileModalProps) {
  const [isPublic, setIsPublic] = useState(file.isPublic || false);
  const [shareToken, setShareToken] = useState(file.shareToken || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (shareToken) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/share/${shareToken}`);
    }
  }, [shareToken]);

  const handleGetLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/uploads/${file.id}/share`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate link');
      
      const data = await response.json();
      setIsPublic(true);
      setShareToken(data.shareToken);
      onUpdate();
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrivate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/uploads/${file.id}/share`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to make private');
      
      setIsPublic(false);
      setShareToken(null);
      onUpdate();
    } catch (error) {
      console.error('Error making file private:', error);
      alert('Failed to make file private. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = () => {
    if (isPublic) {
      handleMakePrivate();
    } else {
      handleGetLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Share "{file.name}"
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isPublic ? (
            // Private State
            <div className="space-y-4">
              <p className="text-gray-600">
                This file is private. Generate a link to share it with others.
              </p>
              <button
                onClick={handleGetLink}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Get Link'}
              </button>
            </div>
          ) : (
            // Public State
            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Anyone with the link can view this file
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-blue-600' : 'bg-gray-300'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Make Private Button */}
              <button
                onClick={handleMakePrivate}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : 'Make Private'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
