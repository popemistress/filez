"use client";

import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { uploadQueue } from '@/lib/uploadQueue';

interface UploadTask {
  id: string;
  file: File;
  folderId?: string | null;
  onProgress?: (progress: number) => void;
  onComplete?: (result: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  result?: Record<string, unknown>;
  error?: Error;
}

export default function UploadStatusIndicator() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const unsubscribe = uploadQueue.subscribe((updatedTasks) => {
      setTasks(updatedTasks as UploadTask[]);
      
      // Auto-show errors
      const hasErrors = updatedTasks.some(t => t.status === 'failed');
      if (hasErrors) {
        setShowErrors(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const stats = uploadQueue.getStats();
  const hasActive = stats.uploading > 0 || stats.pending > 0;
  const hasErrors = stats.failed > 0;

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact Status */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
            hasErrors
              ? 'bg-red-600 text-white'
              : hasActive
              ? 'bg-blue-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {hasErrors ? (
            <AlertCircle className="w-5 h-5 animate-pulse" />
          ) : hasActive ? (
            <Upload className="w-5 h-5 animate-bounce" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <div className="text-sm font-medium">
            {hasErrors
              ? `${stats.failed} Upload${stats.failed > 1 ? 's' : ''} Failed`
              : hasActive
              ? `Uploading ${stats.uploading} of ${stats.total}`
              : `${stats.completed} Upload${stats.completed > 1 ? 's' : ''} Complete`}
          </div>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl w-96 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Upload Queue</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasErrors && (
                <button
                  onClick={() => uploadQueue.retryFailed()}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Retry Failed"
                >
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                </button>
              )}
              <button
                onClick={() => uploadQueue.clearCompleted()}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 bg-gray-50 border-b grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold text-gray-600">{stats.total}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">{stats.uploading}</div>
              <div className="text-gray-500">Active</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{stats.completed}</div>
              <div className="text-gray-500">Done</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">{stats.failed}</div>
              <div className="text-gray-500">Failed</div>
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                  task.status === 'failed' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {task.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                  {task.status === 'uploading' && (
                    <Upload className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
                  )}
                  {task.status === 'pending' && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                  )}
                  {task.status === 'failed' && (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {task.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(task.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    
                    {task.status === 'uploading' && (
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {task.status === 'failed' && task.error && (
                      <div className="mt-1 text-xs text-red-600">
                        {task.error.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
