import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function EmptyFavoritesState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="star-outline" size={80} color="#8E8E93" />
      </View>

      <Text style={styles.title}>No Favorites Yet</Text>

      <Text style={styles.message}>
        Star your most important COINs for quick access.{'\n'}
        Tap the star on any COIN card in Recents or Projects to add it here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
