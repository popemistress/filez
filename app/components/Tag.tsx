"use client";

import React from 'react';

type TagVariant = 'neutral' | 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'indigo';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
}

export default function Tag({ children, variant = 'neutral' }: TagProps) {
  const mapping: Record<TagVariant, string> = {
    neutral: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-500 text-white',
    green: 'bg-teal-500 text-white',
    pink: 'bg-pink-500 text-white',
    indigo: 'bg-indigo-600 text-white',
  };
  
  const classes = `inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${mapping[variant] || mapping.neutral}`;
  
  return <span className={classes}>{children}</span>;
}
