import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COINCard } from '../components/COINCard';
import { COINListItem } from '../components/COINListItem';
import { EmptyRecentsState } from '../components/EmptyRecentsState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { NavigationHeader } from '../components/NavigationHeader';
import { SortSelector, SortOption } from '../components/SortSelector';
import { ViewToggle, ViewMode } from '../components/ViewToggle';
import { COIN } from '../types';
import { getRecentCOINs, MOCK_COINS } from '../utils/mockData';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SORT_OPTION_KEY = '@design_the_what:sort_option';
const VIEW_MODE_KEY = '@design_the_what:view_mode';

export function RecentsScreen() {
  const { width, height } = useWindowDimensions();
  const [recentCOINs, setRecentCOINs] = useState<COIN[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Determine if portrait or landscape by comparing width vs height
  const isPortrait = height > width;
  const numColumns = isPortrait ? 3 : 4;

  // Calculate card width for grid layout
  const horizontalPadding = 16; // padding on left and right
  const gap = 16; // gap between cards
  const availableWidth = width - (horizontalPadding * 2);
  const totalGaps = (numColumns - 1) * gap;
  const cardWidth = (availableWidth - totalGaps) / numColumns;

  // Load recent COINs and preferences on mount
  useEffect(() => {
    loadRecentCOINs();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedSort, savedView] = await Promise.all([
        AsyncStorage.getItem(SORT_OPTION_KEY),
        AsyncStorage.getItem(VIEW_MODE_KEY)
      ]);

      if (savedSort) {
        setSortOption(savedSort as SortOption);
      }
      if (savedView) {
        setViewMode(savedView as ViewMode);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const handleSortChange = async (newSort: SortOption) => {
    setSortOption(newSort);
    try {
      await AsyncStorage.setItem(SORT_OPTION_KEY, newSort);
    } catch (error) {
      console.log('Error saving sort option:', error);
    }
  };

  const handleViewModeChange = async (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, newMode);
    } catch (error) {
      console.log('Error saving view mode:', error);
    }
  };

  const loadRecentCOINs = () => {
    // In real app, this would load from AsyncStorage
    // For now, using mock data
    const coins = getRecentCOINs(20);
    setRecentCOINs(coins);
  };

  // Sort COINs based on selected option
  const sortedCOINs = useMemo(() => {
    const sorted = [...recentCOINs];

    switch (sortOption) {
      case 'recent':
        // Sort by lastAccessedAt (newest first)
        return sorted.sort((a, b) => {
          const dateA = new Date(a.lastAccessedAt || a.updatedAt).getTime();
          const dateB = new Date(b.lastAccessedAt || b.updatedAt).getTime();
          return dateB - dateA;
        });

      case 'name-asc':
        // Sort by name A-Z
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'name-desc':
        // Sort by name Z-A
        return sorted.sort((a, b) => b.name.localeCompare(a.name));

      case 'status-asc':
        // Sort by status A-Z (alphabetical: approved, archived, draft, review)
        return sorted.sort((a, b) => a.status.localeCompare(b.status));

      case 'status-desc':
        // Sort by status Z-A (alphabetical reverse: review, draft, archived, approved)
        return sorted.sort((a, b) => b.status.localeCompare(a.status));

      case 'created-newest':
        // Sort by createdAt (newest first)
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

      case 'created-oldest':
        // Sort by createdAt (oldest first)
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });

      default:
        return sorted;
    }
  }, [recentCOINs, sortOption]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      loadRecentCOINs();
      setIsRefreshing(false);
    }, 500);
  };

  const handleCardPress = (coinId: string) => {
    // TODO: Navigate to COIN editor (UC-101) when implemented
    Alert.alert(
      'Open COIN',
      `Would open COIN: ${coinId}\n\n(UC-101 not yet implemented - this is UC-200 only)`,
      [{ text: 'OK' }]
    );
  };

  const handleRemoveFromRecents = (coinId: string) => {
    // TODO: Remove from recents (keep in storage)
    Alert.alert(
      'Remove from Recents',
      'This will remove the COIN from your recent list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setRecentCOINs(prev => prev.filter(coin => coin.id !== coinId));
          }
        }
      ]
    );
  };

  const handleCreateCOIN = () => {
    // TODO: Navigate to UC-100 (Create COIN) when implemented
    Alert.alert(
      'Create COIN',
      'Would open Create COIN modal\n\n(UC-100 not yet implemented - this is UC-200 only)',
      [{ text: 'OK' }]
    );
  };

  const handleBrowseProjects = () => {
    // TODO: Navigate to Projects tab (UC-201) when implemented
    Alert.alert(
      'Browse Projects',
      'Would switch to Projects tab\n\n(UC-201 not yet implemented - this is UC-200 only)',
      [{ text: 'OK' }]
    );
  };

  const isEmpty = recentCOINs.length === 0;
  const hasAnyCOINs = MOCK_COINS.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {isEmpty ? (
        <EmptyRecentsState
          hasAnyCOINs={hasAnyCOINs}
          onCreateCOIN={handleCreateCOIN}
          onBrowseProjects={handleBrowseProjects}
        />
      ) : (
        <View style={styles.contentContainer}>
          <NavigationHeader
            rightAction={
              <ViewToggle viewMode={viewMode} onToggle={handleViewModeChange} />
            }
          />
          <SortSelector currentSort={sortOption} onSortChange={handleSortChange} />

          {viewMode === 'grid' ? (
            <FlatList
              data={sortedCOINs}
              renderItem={({ item }) => (
                <View style={{ width: cardWidth, marginBottom: 16 }}>
                  <COINCard
                    coin={item}
                    onPress={handleCardPress}
                    onRemove={handleRemoveFromRecents}
                    showCreatedDate={sortOption === 'created-newest' || sortOption === 'created-oldest'}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={`grid-${numColumns}`}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#007AFF"
                />
              }
            />
          ) : (
            <FlatList
              data={sortedCOINs}
              renderItem={({ item }) => (
                <COINListItem
                  coin={item}
                  onPress={handleCardPress}
                  showCreatedDate={sortOption === 'created-newest' || sortOption === 'created-oldest'}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listViewContent}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#007AFF"
                />
              }
            />
          )}
        </View>
      )}
      <FloatingActionButton onPress={handleCreateCOIN} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 81,
  },
  listViewContent: {
    padding: 16,
    paddingBottom: 97,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 16,
  },
});
