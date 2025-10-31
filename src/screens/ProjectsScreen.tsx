import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Project } from '../types';
import { mockProjects } from '../utils/mockData';
import ProjectCard from '../components/ProjectCard';
import EmptyProjectListState from '../components/EmptyProjectListState';
import { ProjectSortSelector } from '../components/ProjectSortSelector';
import { ViewToggle } from '../components/ViewToggle';
import { useCOINs } from '../contexts/COINContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function ProjectsScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const { projectSortOption, setProjectSortOption, viewMode, setViewMode } = useCOINs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

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

  // Filter out archived projects (they're not shown in Phase 1)
  const visibleProjects = useMemo(() => {
    return projects.filter((p) => p.status !== 'archived');
  }, [projects]);

  // Sort projects based on selected option (uses shared projectSortOption from COINContext)
  const sortedProjects = useMemo(() => {
    const sorted = [...visibleProjects];

    switch (projectSortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'status-asc':
        return sorted.sort((a, b) => {
          const statusCompare = a.status.localeCompare(b.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name); // Secondary: alphabetical
        });
      case 'status-desc':
        return sorted.sort((a, b) => {
          const statusCompare = b.status.localeCompare(a.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name); // Secondary: alphabetical
        });
      default:
        return sorted;
    }
  }, [visibleProjects, projectSortOption]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      // In a real app, this would reload from AsyncStorage
      setIsRefreshing(false);
    }, 500);
  };

  const handleProjectPress = (project: Project) => {
    // Navigate to ProjectDetailScreen
    (navigation as any).navigate('ProjectDetail', {
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleCreateProject = () => {
    Alert.alert(
      'Coming Soon',
      'Project creation will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  // Show empty state when no projects
  if (sortedProjects.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <EmptyProjectListState onCreateProject={handleCreateProject} />
      </SafeAreaView>
    );
  }

  const isGridView = viewMode === 'grid';
  const isListView = viewMode === 'list';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Sort selector with view toggle - uses shared projectSortOption from COINContext */}
      <ProjectSortSelector
        currentSort={projectSortOption}
        onSortChange={setProjectSortOption}
        rightAction={<ViewToggle viewMode={viewMode} onToggle={setViewMode} />}
      />

      {isGridView ? (
        <FlatList
          data={sortedProjects}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProjectCard
                project={item}
                viewMode="grid"
                onPress={() => handleProjectPress(item)}
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
      ) : (
        <FlatList
          data={sortedProjects}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              viewMode="list"
              onPress={() => handleProjectPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  gridContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
});
