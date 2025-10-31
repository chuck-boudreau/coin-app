import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COIN } from '../types';
import { formatRelativeTime } from '../utils/dateFormatting';
import { getStatusColor } from '../utils/statusColors';

interface COINListItemProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  onToggleFavorite?: (coinId: string) => void;  // UC-202: Optional handler for favorite toggle
}

export function COINListItem({ coin, onPress, onToggleFavorite }: COINListItemProps) {
  const statusColor = getStatusColor(coin.status);
  const relativeTime = formatRelativeTime(coin.updatedAt);
  const dateLabel = 'Updated';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleStarPress = (e: any) => {
    e.stopPropagation();

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate star scale
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (onToggleFavorite) {
      onToggleFavorite(coin.id);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed
      ]}
      onPress={() => onPress(coin.id)}
    >
      {/* Icon/Thumbnail */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⭕</Text>
      </View>

      {/* Content - Middle */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.project} numberOfLines={1}>
          {coin.projectName || 'No Project'}
        </Text>
      </View>

      {/* Right Side - Timestamp, Status & Chevron */}
      <View style={styles.rightContent}>
        <View style={styles.timestampContainer}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.timestamp}>{relativeTime}</Text>
        </View>
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

        {/* Star Icon Button (UC-202: Only shown if handler provided) */}
        {onToggleFavorite && (
          <Pressable
            style={styles.starButton}
            onPress={handleStarPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={coin.isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={coin.isFavorite ? '#FF9500' : '#8E8E93'}
              />
            </Animated.View>
          </Pressable>
        )}

        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  project: {
    fontSize: 14,
    color: '#666666',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestampContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  dateLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 75,  // Fixed width for consistent alignment
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  chevron: {
    fontSize: 24,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  // UC-202: Star button style
  starButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
