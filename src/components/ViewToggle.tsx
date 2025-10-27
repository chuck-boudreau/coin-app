import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          viewMode === 'grid' && styles.buttonActive,
          pressed && styles.buttonPressed
        ]}
        onPress={() => onToggle('grid')}
      >
        <Text style={[
          styles.icon,
          viewMode === 'grid' && styles.iconActive
        ]}>⊞</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          viewMode === 'list' && styles.buttonActive,
          pressed && styles.buttonPressed
        ]}
        onPress={() => onToggle('list')}
      >
        <Text style={[
          styles.icon,
          viewMode === 'list' && styles.iconActive
        ]}>☰</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 20,
    color: '#666666',
  },
  iconActive: {
    color: '#FFFFFF',
  },
});
