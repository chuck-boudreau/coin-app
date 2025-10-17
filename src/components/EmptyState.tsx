import React from 'react';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Icon/Illustration */}
      <div className="text-6xl mb-4" role="img" aria-label="COIN diagram icon">
        📊
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        No COINs yet
      </h2>
      
      <p className="text-gray-600 mb-8 text-center max-w-sm">
        Create your first COIN to get started
      </p>
      
      <button 
        onClick={onCreateNew}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg min-h-[48px] transition-colors"
      >
        + Create Your First COIN
      </button>
    </div>
  );
};