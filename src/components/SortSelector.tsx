import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'status-asc' | 'status-desc' | 'created-newest' | 'created-oldest';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
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

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by:</Text>
      <View style={styles.buttonContainer}>
        <SortButton
          label="Recent"
          isActive={currentSort === 'recent'}
          onPress={() => onSortChange('recent')}
        />
        <SortButton
          label="Name A-Z"
          isActive={currentSort === 'name-asc'}
          onPress={() => onSortChange('name-asc')}
        />
        <SortButton
          label="Name Z-A"
          isActive={currentSort === 'name-desc'}
          onPress={() => onSortChange('name-desc')}
        />
        <SortButton
          label="Status A-Z"
          isActive={currentSort === 'status-asc'}
          onPress={() => onSortChange('status-asc')}
        />
        <SortButton
          label="Status Z-A"
          isActive={currentSort === 'status-desc'}
          onPress={() => onSortChange('status-desc')}
        />
        <SortButton
          label="Newest"
          isActive={currentSort === 'created-newest'}
          onPress={() => onSortChange('created-newest')}
        />
        <SortButton
          label="Oldest"
          isActive={currentSort === 'created-oldest'}
          onPress={() => onSortChange('created-oldest')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
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
