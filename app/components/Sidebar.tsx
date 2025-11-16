"use client";

import React from 'react';
import { Home, FileText, Settings, Users, Inbox, Clock } from 'lucide-react';

export default function Sidebar() {
  const nav = [
    { label: 'Dashboard', icon: Home },
    { label: 'Documents', icon: FileText },
    { label: 'Correspondents', icon: Users },
    { label: 'Settings', icon: Settings },
  ];

  const savedViews = [
    { label: 'Inbox', icon: Inbox },
    { label: 'Recently Added', icon: Clock },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-4 sticky top-0">
      <div className="mb-6 p-2">
        <div className="text-lg font-semibold text-gray-800">Paperless</div>
        <div className="text-sm text-gray-500">v2.0.0</div>
      </div>

      <nav className="space-y-2">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <button
              key={n.label}
              className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 text-xs text-gray-500">
        <div className="font-medium mb-2">Saved views</div>
        <ul className="space-y-1">
          {savedViews.map((view) => {
            const Icon = view.icon;
            return (
              <li key={view.label} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer">
                <Icon className="w-3 h-3" />
                <span>{view.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
