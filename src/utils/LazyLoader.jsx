import React from 'react';

const LazyLoader = ({ size = "large" }) => {
  const sizeClass = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-16 w-16"
  }[size];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent`}>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LazyLoader;