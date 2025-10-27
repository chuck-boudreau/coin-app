import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { EmptyRecentsStateProps } from '../types';

export function EmptyRecentsState({
  hasAnyCOINs,
  onCreateCOIN,
  onBrowseProjects
}: EmptyRecentsStateProps) {
  return (
    <View style={styles.container}>
      {/* Icon placeholder - using text for now */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>📋</Text>
      </View>

      <Text style={styles.primaryText}>No Recent COINs</Text>
      <Text style={styles.secondaryText}>
        COINs you open will appear here for quick access
      </Text>

      {!hasAnyCOINs ? (
        // New user - show create button
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed
          ]}
          onPress={onCreateCOIN}
        >
          <Text style={styles.createButtonText}>Create Your First COIN</Text>
        </Pressable>
      ) : (
        // Has COINs but none in recents - show guidance
        <Text style={styles.guidanceText}>
          Browse the Projects tab or create a new COIN to get started
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  primaryText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 280,
    alignItems: 'center',
  },
  createButtonPressed: {
    opacity: 0.8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  guidanceText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
