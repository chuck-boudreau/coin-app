import type { COIN } from '../types/coin';

interface COINEditorProps {
  coin: COIN;
  onClose: () => void;
}

export const COINEditor: React.FC<COINEditorProps> = ({ coin, onClose }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
        <button
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close editor"
        >
        <svg 
            className="w-6 h-6 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
            />
        </svg>
        <span className="text-gray-700 font-medium">Back</span>
        </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {coin.name}
          </h1>
        </div>
      </div>

      {/* Canvas Placeholder */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">✏️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            COIN Editor
          </h2>
          <p className="text-gray-600">
            Canvas and editing tools coming in Wave 2
          </p>
          <p className="text-sm text-gray-500 mt-4">
            For now, you can create COINs and see them in your library.
          </p>
        </div>
      </div>
    </div>
  );
};