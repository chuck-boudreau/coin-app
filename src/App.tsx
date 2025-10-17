import React, { useState } from 'react';
import { COINList } from './pages/COINList';
import type { COIN } from './types/coin';
import './App.css';

function App() {
  // State for all COINs (in memory - no localStorage)
  const [coins, setCoins] = useState<COIN[]>([]);
  
  // Currently selected COIN ID (null = on list page)
  const [currentCOINId, setCurrentCOINId] = useState<string | null>(null);

  // Handler: Create new COIN (UC-100 will implement this)
  const handleCreateNew = () => {
    console.log('Create new COIN clicked - UC-100 will handle this');
    // TODO: Open UC-100 modal in next implementation
  };

  // Handler: Open a COIN in the editor
  const handleOpenCOIN = (coinId: string) => {
    console.log('Open COIN:', coinId);
    setCurrentCOINId(coinId);
    // TODO: Navigate to editor view (future implementation)
  };

  // For now, always show the COIN list (UC-201)
  // Editor view will be added in future use cases
  return (
    <div className="min-h-screen bg-gray-50">
      <COINList 
        coins={coins}
        onCreateNew={handleCreateNew}
        onOpenCOIN={handleOpenCOIN}
      />
    </div>
  );
}

export default App;