import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COIN } from '../types';
import { MOCK_COINS } from '../utils/mockData';
import { SortOption } from '../components/SortSelector';

const SORT_OPTION_KEY = '@design_the_what:sort_option';

interface COINContextType {
  coins: COIN[];
  updateCOIN: (coinId: string, updates: Partial<COIN>) => void;
  toggleFavorite: (coinId: string) => void;
  reloadCoins: () => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const COINContext = createContext<COINContextType | undefined>(undefined);

export function COINProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState<COIN[]>([]);
  const [sortOption, setSortOptionState] = useState<SortOption>('created-newest');

  useEffect(() => {
    // Load initial data and preferences
    setCoins(MOCK_COINS);
    loadSortPreference();
  }, []);

  const loadSortPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(SORT_OPTION_KEY);
      if (saved) {
        setSortOptionState(saved as SortOption);
      }
    } catch (error) {
      console.log('Error loading sort preference:', error);
    }
  };

  const setSortOption = async (option: SortOption) => {
    setSortOptionState(option);
    try {
      await AsyncStorage.setItem(SORT_OPTION_KEY, option);
    } catch (error) {
      console.log('Error saving sort preference:', error);
    }
  };

  const updateCOIN = (coinId: string, updates: Partial<COIN>) => {
    setCoins(prevCoins =>
      prevCoins.map(coin =>
        coin.id === coinId
          ? { ...coin, ...updates }
          : coin
      )
    );
  };

  const toggleFavorite = (coinId: string) => {
    setCoins(prevCoins =>
      prevCoins.map(coin =>
        coin.id === coinId
          ? { ...coin, isFavorite: !coin.isFavorite }
          : coin
      )
    );
  };

  const reloadCoins = () => {
    setCoins(MOCK_COINS);
  };

  return (
    <COINContext.Provider value={{ coins, updateCOIN, toggleFavorite, reloadCoins, sortOption, setSortOption }}>
      {children}
    </COINContext.Provider>
  );
}

export function useCOINs() {
  const context = useContext(COINContext);
  if (context === undefined) {
    throw new Error('useCOINs must be used within a COINProvider');
  }
  return context;
}
