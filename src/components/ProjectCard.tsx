import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode, onPress }) => {
  // Get status badge color
  const getStatusColor = (status: Project['status']) => {
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
  const getStatusLabel = (status: Project['status']) => {
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

  if (viewMode === 'list') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.listContainer,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.listContent}>
          {/* Color tag circle */}
          <View style={[styles.colorCircle, { backgroundColor: project.colorTag }]} />

          {/* Project info */}
          <View style={styles.listInfo}>
            <Text style={styles.listName} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={styles.listClient} numberOfLines={1}>
              {project.clientOrDepartment}
            </Text>
            <View style={styles.listMetadata}>
              <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusTextSmall}>{getStatusLabel(project.status)}</Text>
              </View>
              <Text style={styles.coinCount}>
                {project.coinCount} COIN{project.coinCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Grid view
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.gridContainer,
        pressed && styles.pressed,
      ]}
    >
      {/* Color tag bar at top */}
      <View style={[styles.colorBar, { backgroundColor: project.colorTag }]} />

      <View style={styles.gridContent}>
        {/* Project name */}
        <Text style={styles.gridName} numberOfLines={2}>
          {project.name}
        </Text>

        {/* Client/Department */}
        <Text style={styles.gridClient} numberOfLines={1}>
          {project.clientOrDepartment}
        </Text>

        {/* Status badge and COIN count */}
        <View style={styles.gridMetadata}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
          </View>
          <Text style={styles.coinCountGrid}>
            {project.coinCount} COIN{project.coinCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Grid view styles
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  gridContent: {
    padding: 16,
  },
  gridName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  gridClient: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 12,
  },
  gridMetadata: {
    flexDirection: 'column',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinCountGrid: {
    fontSize: 14,
    color: '#666666',
  },

  // List view styles
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 6,
    minHeight: 60,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  colorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  listClient: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 4,
  },
  listMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinCount: {
    fontSize: 13,
    color: '#666666',
  },

  // Pressed state
  pressed: {
    opacity: 0.7,
  },
});

export default ProjectCard;
