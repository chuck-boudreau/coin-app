import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroupToggleProps {
  groupByProject: boolean;
  onToggle: (enabled: boolean) => void;
}

export function GroupToggle({ groupByProject, onToggle }: GroupToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Group:</Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          groupByProject && styles.buttonActive,
          pressed && styles.buttonPressed
        ]}
        onPress={() => onToggle(!groupByProject)}
      >
        <Ionicons
          name="folder-outline"
          size={16}
          color={groupByProject ? '#FFFFFF' : '#000000'}
        />
        <Text style={[styles.buttonText, groupByProject && styles.buttonTextActive]}>
          Project
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minHeight: 32,
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
