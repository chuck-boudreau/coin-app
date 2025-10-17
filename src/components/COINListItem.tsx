import React from 'react';
import type { COIN } from '../types/coin';
import { formatDate } from '../utils/dateFormatter';

interface COINListItemProps {
  coin: COIN;
  onOpen: () => void;
}

export const COINListItem: React.FC<COINListItemProps> = ({ coin, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[60px]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {coin.name}
          </h3>
          
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
            <span>Created: {formatDate(coin.created)}</span>
            <span>•</span>
            <span>Modified: {formatDate(coin.modified)}</span>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0 text-gray-400">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </button>
  );
};