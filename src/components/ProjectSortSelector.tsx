import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type ProjectSortOption =
  | 'name-asc'           // Name (A-Z)
  | 'name-desc'          // Name (Z-A)
  | 'status-asc'         // Status (A-Z)
  | 'status-desc';       // Status (Z-A)

interface ProjectSortSelectorProps {
  currentSort: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
  rightAction?: React.ReactNode;
}

interface SortButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function SortButton({ label, isActive, onPress }: SortButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        pressed && styles.buttonPressed
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ProjectSortSelector({ currentSort, onSortChange, rightAction }: ProjectSortSelectorProps) {
  // Determine which field is active and its direction
  const isNameActive = currentSort === 'name-asc' || currentSort === 'name-desc';
  const isStatusActive = currentSort === 'status-asc' || currentSort === 'status-desc';

  const nameDirection = currentSort === 'name-asc' ? '↑' : '↓';
  const statusDirection = currentSort === 'status-asc' ? '↑' : '↓';

  // Handle button press - toggle direction if active, otherwise activate with default direction
  const handleNamePress = () => {
    if (isNameActive) {
      // Toggle direction
      onSortChange(currentSort === 'name-asc' ? 'name-desc' : 'name-asc');
    } else {
      // Activate with default (ascending = A-Z)
      onSortChange('name-asc');
    }
  };

  const handleStatusPress = () => {
    if (isStatusActive) {
      // Toggle direction
      onSortChange(currentSort === 'status-asc' ? 'status-desc' : 'status-asc');
    } else {
      // Activate with default (ascending)
      onSortChange('status-asc');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.label}>Sort by:</Text>
        <View style={styles.buttonContainer}>
          <SortButton
            label={`Name ${isNameActive ? nameDirection : '↑'}`}
            isActive={isNameActive}
            onPress={handleNamePress}
          />
          <SortButton
            label={`Status ${isStatusActive ? statusDirection : '↑'}`}
            isActive={isStatusActive}
            onPress={handleStatusPress}
          />
        </View>
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  rightAction: {
    marginLeft: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minHeight: 32,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});
