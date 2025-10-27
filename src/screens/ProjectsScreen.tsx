import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '../components/NavigationHeader';

export function ProjectsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <NavigationHeader />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📁</Text>
        </View>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          Organize your COINs into projects for better management
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 65,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 21,
  },
});
