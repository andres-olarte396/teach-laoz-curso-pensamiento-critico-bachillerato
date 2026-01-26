import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8 max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-8 bg-[var(--border-color)] rounded-lg w-3/4 opacity-50"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-1/2 opacity-30"></div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-6">
        <div className="h-4 bg-[var(--border-color)] rounded w-full opacity-40"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-5/6 opacity-40"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-full opacity-40"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-4/6 opacity-40"></div>
      </div>

      {/* Image Placeholder */}
      <div className="h-64 bg-[var(--border-color)] rounded-xl w-full opacity-30"></div>

      {/* More Text */}
      <div className="space-y-4">
        <div className="h-4 bg-[var(--border-color)] rounded w-11/12 opacity-40"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-full opacity-40"></div>
        <div className="h-4 bg-[var(--border-color)] rounded w-3/4 opacity-40"></div>
      </div>
    </div>
  );
};
