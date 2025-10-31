import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  SectionList,
  Text,
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
import { SortSelector, SortOption } from '../components/SortSelector';
import { ViewToggle } from '../components/ViewToggle';
import { GroupToggle } from '../components/GroupToggle';
import { useCOINs } from '../contexts/COINContext';
import { COIN } from '../types';

export function RecentsScreen() {
  const { width, height } = useWindowDimensions();
  const { coins, toggleFavorite, duplicateCOIN, updateCOIN, sortOption, setSortOption, viewMode, setViewMode, groupByProject, setGroupByProject } = useCOINs();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleSortChange = (newSort: SortOption) => {
    // Sort state managed by COINContext - updates immediately across tabs
    setSortOption(newSort);
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
        // Sort by status A-Z, then by name A-Z within each status
        return sorted.sort((a, b) => {
          const statusCompare = a.status.localeCompare(b.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name); // Secondary: alphabetical
        });

      case 'status-desc':
        // Sort by status Z-A, then by name A-Z within each status
        return sorted.sort((a, b) => {
          const statusCompare = b.status.localeCompare(a.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name); // Secondary: alphabetical
        });

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

  // Helper function to chunk array into groups of size n
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Group COINs by project when grouping is enabled
  const groupedSections = useMemo(() => {
    if (!groupByProject) return [];

    // Group COINs by project name
    const projectGroups = sortedCOINs.reduce((acc, coin) => {
      const projectName = coin.projectName || 'No Project';
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(coin);
      return acc;
    }, {} as Record<string, COIN[]>);

    // Convert to sections array and sort projects alphabetically
    return Object.entries(projectGroups)
      .map(([projectName, data]) => ({
        title: projectName,
        data,
      }))
      .sort((a, b) => {
        // "No Project" always last
        if (a.title === 'No Project') return 1;
        if (b.title === 'No Project') return -1;
        return a.title.localeCompare(b.title);
      });
  }, [sortedCOINs, groupByProject]);

  // Chunk grouped sections into rows for grid view
  const groupedSectionsChunked = useMemo(() => {
    if (!groupByProject || viewMode !== 'grid') return groupedSections;

    // Chunk each section's data into rows of numColumns
    return groupedSections.map(section => ({
      title: section.title,
      data: chunkArray(section.data, numColumns),
    }));
  }, [groupedSections, groupByProject, viewMode, numColumns]);

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

  const handleDuplicate = (coinId: string) => {
    // Create a copy of the COIN
    duplicateCOIN(coinId);
  };

  const handleShare = (coinId: string) => {
    // TODO: Implement share functionality (UC-future)
    Alert.alert('Share COIN', 'Share functionality coming soon!', [{ text: 'OK' }]);
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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {isEmpty ? (
        <EmptyRecentsState
          hasAnyCOINs={hasAnyCOINs}
          onCreateCOIN={handleCreateCOIN}
          onBrowseProjects={handleBrowseProjects}
        />
      ) : (
        <View style={styles.contentContainer}>
          <SortSelector
            currentSort={sortOption}
            onSortChange={handleSortChange}
            rightAction={
              <View style={styles.rightActions}>
                <GroupToggle groupByProject={groupByProject} onToggle={setGroupByProject} />
                <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
              </View>
            }
          />

          {groupByProject ? (
            // Grouped by project view
            viewMode === 'grid' ? (
              <SectionList
                sections={groupedSectionsChunked}
                keyExtractor={(item, index) => `row-${index}`}
                renderItem={({ item: row }) => (
                  <View style={[styles.columnWrapper, { marginBottom: 16 }]}>
                    {row.map((coin: COIN) => (
                      <View key={coin.id} style={{ width: cardWidth }}>
                        <COINCard
                          coin={coin}
                          onPress={handleCardPress}
                          onRemove={handleRemoveFromRecents}
                          onToggleFavorite={handleToggleFavorite}
                          onDuplicate={handleDuplicate}
                          onShare={handleShare}
                        />
                      </View>
                    ))}
                  </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                key={`grid-grouped-${numColumns}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                stickySectionHeadersEnabled={true}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#007AFF"
                  />
                }
              />
            ) : (
              <SectionList
                sections={groupedSections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <COINListItem
                    coin={item}
                    onPress={handleCardPress}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicate}
                    onShare={handleShare}
                    onRemove={handleRemoveFromRecents}
                  />
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                contentContainerStyle={styles.listViewContent}
                showsVerticalScrollIndicator={true}
                stickySectionHeadersEnabled={true}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#007AFF"
                  />
                }
              />
            )
          ) : viewMode === 'grid' ? (
            // Flat grid view
            <FlatList
              data={sortedCOINs}
              renderItem={({ item }) => (
                <View style={{ width: cardWidth, marginBottom: 16 }}>
                  <COINCard
                    coin={item}
                    onPress={handleCardPress}
                    onRemove={handleRemoveFromRecents}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicate}
                    onShare={handleShare}
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
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                  onRemove={handleRemoveFromRecents}
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  sectionHeader: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
