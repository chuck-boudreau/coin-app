import { useState } from 'react';
import type { COIN } from '../types/coin';
import { COINListItem } from '../components/COINListItem';
import { EmptyState } from '../components/EmptyState';
import { CreateCOINModal } from '../components/modals/CreateCOINModal';

interface COINListProps {
  coins: COIN[];
  onCreateNew: (name: string) => void;
  onOpenCOIN: (id: string) => void;
}

export const COINList: React.FC<COINListProps> = ({ 
  coins, 
  onCreateNew, 
  onOpenCOIN 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sort by most recently modified (descending)
  const sortedCoins = [...coins].sort((a, b) => 
    b.modified.getTime() - a.modified.getTime()
  );

  const handleCreateCOIN = (name: string) => {
    onCreateNew(name);
    setShowCreateModal(false);
  };

  // Show empty state if no COINs
  if (sortedCoins.length === 0) {
    return (
      <>
        <EmptyState onCreateNew={() => setShowCreateModal(true)} />
        <CreateCOINModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCOIN}
          existingNames={coins.map(c => c.name)}
        />
      </>
    );
  }

  // Show COIN list
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My COINs
          </h1>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg min-h-[48px] transition-colors md:w-auto md:px-8"
          >
            + New COIN
          </button>
        </div>
        
        {/* COIN List */}
        <div className="space-y-2">
          {sortedCoins.map(coin => (
            <COINListItem 
              key={coin.id} 
              coin={coin} 
              onOpen={() => onOpenCOIN(coin.id)} 
            />
          ))}
        </div>
      </div>

      <CreateCOINModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCOIN}
        existingNames={coins.map(c => c.name)}
      />
    </>
  );
};