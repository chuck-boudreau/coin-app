import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COINCardProps } from '../types';
import { formatRelativeTime } from '../utils/dateFormatting';
import { getStatusColor } from '../utils/statusColors';

export function COINCard({ coin, onPress, showCreatedDate = false }: COINCardProps) {
  const statusColor = getStatusColor(coin.status);
  const relativeTime = showCreatedDate
    ? formatRelativeTime(coin.createdAt)
    : formatRelativeTime(coin.lastAccessedAt || coin.updatedAt);
  const dateLabel = showCreatedDate ? 'Created' : 'Accessed';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(coin.id)}
    >
      {/* Thumbnail Area */}
      <View style={styles.thumbnailContainer}>
        {/* Placeholder for thumbnail - using circle icon */}
        <View style={styles.placeholderThumbnail}>
          <Text style={styles.placeholderIcon}>⭕</Text>
        </View>

        {/* COIN Name Overlay */}
        <View style={styles.nameOverlay}>
          <Text style={styles.coinName} numberOfLines={2}>
            {coin.name}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor.background }
          ]}
        >
          <Text style={styles.statusText}>
            {coin.status.charAt(0).toUpperCase() + coin.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Metadata Area */}
      <View style={styles.metadataContainer}>
        <Text style={styles.projectName} numberOfLines={1}>
          {coin.projectName || 'No Project'}
        </Text>
        <Text style={styles.timestamp}>
          <Text style={styles.dateLabel}>{dateLabel}: </Text>
          {relativeTime}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    opacity: 0.3,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  coinName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metadataContainer: {
    padding: 12,
  },
  projectName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dateLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
});
