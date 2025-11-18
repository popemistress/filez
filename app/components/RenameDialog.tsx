'use client';

import { useState } from 'react';
import { CustomDialog } from './ui/DialogVariants';

interface RenameDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  title?: string;
}

export default function RenameDialog({ 
  open, 
  onClose, 
  onConfirm, 
  currentName,
  title = "Rename File"
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    if (newName.trim() === currentName) {
      setError('Please enter a different name');
      return;
    }
    
    onConfirm(newName.trim());
    handleClose();
  };

  const handleClose = () => {
    setNewName(currentName);
    setError('');
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
            File Name
          </label>
          <input
            id="filename"
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new name"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Rename
          </button>
        </div>
      </form>
    </CustomDialog>
  );
}
