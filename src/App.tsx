import { useState } from 'react';
import { COINList } from './pages/COINList';
import { COINEditor } from './pages/COINEditor';
import type { COIN } from './types/coin';
import './App.css';

type ViewMode = 'list' | 'editor';

function App() {
  // State for all COINs (in memory - no localStorage)
  const [coins, setCoins] = useState<COIN[]>([]);
  
  // View management
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentCOINId, setCurrentCOINId] = useState<string | null>(null);

  // Handler: Create new COIN
  const handleCreateCOIN = (name: string) => {
    const newCOIN: COIN = {
      id: crypto.randomUUID(),
      name,
      created: new Date(),
      modified: new Date(),
      elements: [],
      metadata: { tags: [] }
    };
    
    setCoins([...coins, newCOIN]);
    
    // Navigate to editor with the new COIN
    setCurrentCOINId(newCOIN.id);
    setViewMode('editor');
  };

  // Handler: Open a COIN in the editor
  const handleOpenCOIN = (coinId: string) => {
    setCurrentCOINId(coinId);
    setViewMode('editor');
  };

  // Handler: Close editor and return to list
  const handleCloseEditor = () => {
    setViewMode('list');
    setCurrentCOINId(null);
  };

  // Find current COIN for editor
  const currentCOIN = currentCOINId 
    ? coins.find(c => c.id === currentCOINId) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {viewMode === 'list' ? (
        <COINList 
          coins={coins}
          onCreateNew={handleCreateCOIN}
          onOpenCOIN={handleOpenCOIN}
        />
      ) : (
        currentCOIN && (
          <COINEditor 
            coin={currentCOIN}
            onClose={handleCloseEditor}
          />
        )
      )}
    </div>
  );
}

export default App;