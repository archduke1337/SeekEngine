import React from 'react';

export const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg
          className="text-[var(--primary)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
      )}
    </div>
  );
};

export const SkeletonLoader = ({ type = 'search-result' }) => {
  if (type === 'search-result') {
    return (
      <div className="animate-pulse space-y-4 py-4">
        <div className="h-4 bg-[var(--surface)] rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-[var(--surface)] rounded w-5/6"></div>
          <div className="h-4 bg-[var(--surface)] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return null;
};

export const PageLoader = () => (
  <div className="fixed inset-0 bg-[var(--primary-bg)] bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);
