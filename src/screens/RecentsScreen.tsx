import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COINCard } from '../components/COINCard';
import { COINListItem } from '../components/COINListItem';
import { EmptyRecentsState } from '../components/EmptyRecentsState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { NavigationHeader } from '../components/NavigationHeader';
import { SortSelector, SortOption } from '../components/SortSelector';
import { ViewToggle, ViewMode } from '../components/ViewToggle';
import { useCOINs } from '../contexts/COINContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEW_MODE_KEY = '@design_the_what:view_mode';

export function RecentsScreen() {
  const { width, height } = useWindowDimensions();
  const { coins, toggleFavorite, updateCOIN, sortOption, setSortOption } = useCOINs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Simplified column layout prioritizing preview size over quantity
  const GAP = 16;
  const PADDING = 20;

  // Orientation-based column limits for optimal preview recognition
  const isLandscape = width > height;
  const maxColumns = isLandscape ? 3 : 2;  // Portrait: 2, Landscape: 3

  const availableWidth = width - (PADDING * 2);

  // Use maximum columns (simpler = better)
  const numColumns = maxColumns;

  // Calculate card width to fill available space
  const totalGaps = (numColumns - 1) * GAP;
  const cardWidth = (availableWidth - totalGaps) / numColumns;

  const horizontalPadding = PADDING;

  // Load view mode preference when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadViewPreference();
    }, [])
  );

  const loadViewPreference = async () => {
    try {
      const savedView = await AsyncStorage.getItem(VIEW_MODE_KEY);
      if (savedView) {
        setViewMode(savedView as ViewMode);
      }
    } catch (error) {
      console.log('Error loading view preference:', error);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    // Sort state managed by COINContext - updates immediately across tabs
    setSortOption(newSort);
  };

  const handleViewModeChange = async (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, newMode);
    } catch (error) {
      console.log('Error saving view mode:', error);
    }
  };

  // Filter for recent COINs (has lastAccessedAt)
  const recentCOINs = useMemo(() => {
    return coins.filter(coin => coin.lastAccessedAt);
  }, [coins]);

  // Sort COINs based on selected option
  const sortedCOINs = useMemo(() => {
    const sorted = [...recentCOINs];

    switch (sortOption) {
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
      // No need to reload - context manages state
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
            // Clear lastAccessedAt to remove from recents
            updateCOIN(coinId, { lastAccessedAt: undefined });
          }
        }
      ]
    );
  };

  const handleToggleFavorite = (coinId: string) => {
    // Toggle favorite status using shared context
    // Visual feedback provided by: star icon change, haptic feedback, and scale animation
    toggleFavorite(coinId);
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

  const isEmpty = sortedCOINs.length === 0;
  const hasAnyCOINs = coins.length > 0;

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
                    onToggleFavorite={handleToggleFavorite}
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
                  onToggleFavorite={handleToggleFavorite}
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
