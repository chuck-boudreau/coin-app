import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COINCard } from '../components/COINCard';
import { COINListItem } from '../components/COINListItem';
import EmptyProjectDetailState from '../components/EmptyProjectDetailState';
import { SortSelector } from '../components/SortSelector';
import { ViewToggle } from '../components/ViewToggle';
import { useCOINs } from '../contexts/COINContext';
import { mockProjects } from '../utils/mockData';

interface ProjectDetailScreenProps {
  route: {
    params: {
      projectId: string;
      projectName: string;
    };
  };
}

export function ProjectDetailScreen({ route }: ProjectDetailScreenProps) {
  const { projectId, projectName } = route.params;
  const { width, height } = useWindowDimensions();
  const { coins, toggleFavorite, duplicateCOIN, sortOption, setSortOption, viewMode, setViewMode } = useCOINs(); // Use shared state from context
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simplified column layout prioritizing preview size over quantity
  const GAP = 16;
  const PADDING = 20;

  // Orientation-based column limits for optimal preview recognition
  const isLandscape = width > height;
  const maxColumns = isLandscape ? 3 : 2; // Portrait: 2, Landscape: 3

  const availableWidth = width - PADDING * 2;

  // Use maximum columns (simpler = better)
  const numColumns = maxColumns;

  // Calculate card width to fill available space
  const totalGaps = (numColumns - 1) * GAP;
  const cardWidth = (availableWidth - totalGaps) / numColumns;

  const horizontalPadding = PADDING;

  // Get project details
  const project = useMemo(() => {
    return mockProjects.find((p) => p.id === projectId);
  }, [projectId]);

  // Filter COINs that belong to this project
  const projectCoins = useMemo(() => {
    return coins.filter((coin) => coin.projectIds.includes(projectId));
  }, [coins, projectId]);

  // Apply sorting (uses shared sortOption from COINContext)
  const sortedCoins = useMemo(() => {
    const sorted = [...projectCoins];

    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'status-asc':
        return sorted.sort((a, b) => {
          const statusCompare = a.status.localeCompare(b.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name);
        });
      case 'status-desc':
        return sorted.sort((a, b) => {
          const statusCompare = b.status.localeCompare(a.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name);
        });
      case 'created-newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      case 'created-oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
      default:
        return sorted;
    }
  }, [projectCoins, sortOption]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleCardPress = (coinId: string) => {
    // TODO: Navigate to COIN editor (UC-101) when implemented
    Alert.alert(
      'Open COIN',
      `Would open COIN: ${coinId}\n\n(UC-101 not yet implemented)`,
      [{ text: 'OK' }]
    );
  };

  const handleRemove = (coinId: string) => {
    // Future: Remove COIN from project
    Alert.alert('Remove from Project', 'Feature coming in future update!', [
      { text: 'OK' },
    ]);
  };

  const handleDuplicate = (coinId: string) => {
    // Create a copy of the COIN
    duplicateCOIN(coinId);
  };

  const handleShare = (coinId: string) => {
    // TODO: Implement share functionality (UC-future)
    Alert.alert('Share COIN', 'Share functionality coming soon!', [{ text: 'OK' }]);
  };

  const handleAddFromRecents = () => {
    Alert.alert(
      'Coming Soon',
      'Select COINs to add to project (UC-210)',
      [{ text: 'OK' }]
    );
  };

  const handleCreateNew = () => {
    Alert.alert(
      'Coming Soon',
      'Create COIN in this project (UC-100 with project context)',
      [{ text: 'OK' }]
    );
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759'; // Green
      case 'onHold':
        return '#FF9500'; // Orange
      case 'completed':
        return '#007AFF'; // Blue
      case 'archived':
        return '#8E8E93'; // Gray
      default:
        return '#8E8E93';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'onHold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  // Show empty state when project has no COINs
  if (sortedCoins.length === 0 && project) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Project metadata bar */}
        <View style={styles.metadataBar}>
          <Text style={styles.metadataClient}>{project.clientOrDepartment}</Text>
          <View style={styles.metadataRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(project.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
            </View>
            <Text style={styles.coinCountText}>
              {project.coinCount} COIN{project.coinCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <EmptyProjectDetailState
          projectName={projectName}
          onAddFromRecents={handleAddFromRecents}
          onCreateNew={handleCreateNew}
        />
      </SafeAreaView>
    );
  }

  const isGridView = viewMode === 'grid';
  const isListView = viewMode === 'list';

  // Render content
  if (isGridView) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Project metadata bar */}
        {project && (
          <View style={styles.metadataBar}>
            <Text style={styles.metadataClient}>{project.clientOrDepartment}</Text>
            <View style={styles.metadataRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(project.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
              </View>
              <Text style={styles.coinCountText}>
                {sortedCoins.length} COIN{sortedCoins.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Sort selector with view toggle - uses shared sortOption from COINContext */}
        <SortSelector
          currentSort={sortOption}
          onSortChange={setSortOption}
          rightAction={<ViewToggle viewMode={viewMode} onToggle={setViewMode} />}
        />

        <FlatList
          data={sortedCoins}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <COINCard
                coin={item}
                onPress={handleCardPress}
                onRemove={handleRemove}
                onToggleFavorite={toggleFavorite}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          contentContainerStyle={[
            styles.gridContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      </SafeAreaView>
    );
  }

  // List view
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Project metadata bar */}
      {project && (
        <View style={styles.metadataBar}>
          <Text style={styles.metadataClient}>{project.clientOrDepartment}</Text>
          <View style={styles.metadataRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(project.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
            </View>
            <Text style={styles.coinCountText}>
              {sortedCoins.length} COIN{sortedCoins.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Sort selector with view toggle - uses shared sortOption from COINContext */}
      <SortSelector
        currentSort={sortOption}
        onSortChange={setSortOption}
        rightAction={<ViewToggle viewMode={viewMode} onToggle={setViewMode} />}
      />

      <FlatList
        data={sortedCoins}
        renderItem={({ item }) => (
          <COINListItem
            coin={item}
            onPress={handleCardPress}
            onToggleFavorite={toggleFavorite}
            onDuplicate={handleDuplicate}
            onShare={handleShare}
            onRemove={handleRemove}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  metadataBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  metadataClient: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinCountText: {
    fontSize: 14,
    color: '#666666',
  },
  gridContent: {
    paddingTop: 20,
    paddingBottom: 81,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 81,
  },
});
