import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { COINCardProps } from '../types';
import { formatRelativeTime } from '../utils/dateFormatting';
import { getStatusColor } from '../utils/statusColors';

export function COINCard({ coin, onPress, onToggleFavorite, onDuplicate, onShare, onRemove }: COINCardProps) {
  const { showActionSheetWithOptions } = useActionSheet();
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

  // Long-press context menu
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const options = ['Open', 'Duplicate'];
    let destructiveButtonIndex = -1;

    // Add favorite toggle option
    if (onToggleFavorite) {
      options.push(coin.isFavorite ? 'Remove from Favorites' : 'Add to Favorites');
    }

    // Add share option
    if (onShare) {
      options.push('Share');
    }

    // Add delete option
    if (onRemove) {
      destructiveButtonIndex = options.length;
      options.push('Delete');
    }

    options.push('Cancel');
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
        title: coin.name,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // Open
          onPress(coin.id);
        } else if (buttonIndex === 1 && onDuplicate) {
          // Duplicate
          onDuplicate(coin.id);
        } else if (buttonIndex === 2 && onToggleFavorite) {
          // Toggle favorite
          onToggleFavorite(coin.id);
        } else if (buttonIndex === 3 && onShare) {
          // Share
          onShare(coin.id);
        } else if (buttonIndex === destructiveButtonIndex && onRemove) {
          // Delete
          onRemove(coin.id);
        }
      }
    );
  };

  // Render swipe actions (left swipe reveals actions on right)
  const renderRightActions = () => {
    if (!onDuplicate && !onShare && !onRemove) return null;

    return (
      <View style={styles.swipeActionsContainer}>
        {onDuplicate && (
          <Pressable
            style={[styles.swipeAction, styles.duplicateAction]}
            onPress={() => onDuplicate(coin.id)}
          >
            <Ionicons name="copy-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Duplicate</Text>
          </Pressable>
        )}
        {onShare && (
          <Pressable
            style={[styles.swipeAction, styles.shareAction]}
            onPress={() => onShare(coin.id)}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Share</Text>
          </Pressable>
        )}
        {onRemove && (
          <Pressable
            style={[styles.swipeAction, styles.deleteAction]}
            onPress={() => onRemove(coin.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const cardContent = (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(coin.id)}
      onLongPress={handleLongPress}
    >
      {/* Thumbnail Area - Full preview without overlay */}
      <View style={styles.thumbnailContainer}>
        {/* Placeholder for thumbnail - using circle icon */}
        <View style={styles.placeholderThumbnail}>
          <Text style={styles.placeholderIcon}>⭕</Text>
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

        {/* Star Icon Button (UC-202: Only shown if handler provided) */}
        {onToggleFavorite && (
          <Pressable
            style={styles.starButton}
            onPress={handleStarPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Animated.View
              style={[
                styles.starBackground,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Ionicons
                name={coin.isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={coin.isFavorite ? '#FF9500' : '#8E8E93'}
              />
            </Animated.View>
          </Pressable>
        )}
      </View>

      {/* Metadata Area - Title moved below preview */}
      <View style={styles.metadataContainer}>
        <Text style={styles.coinName} numberOfLines={2}>
          {coin.name}
        </Text>
        <View style={styles.metadataRow}>
          <Text style={styles.projectName} numberOfLines={1}>
            {coin.projectName || 'No Project'}
          </Text>
          {coin.processState === 'future' && (
            <View style={styles.processStateBadge}>
              <Text style={styles.processStateText}>Future</Text>
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>
          <Text style={styles.dateLabel}>{dateLabel}: </Text>
          {relativeTime}
        </Text>
      </View>
    </Pressable>
  );

  // Only wrap with Swipeable if any swipe actions are provided
  if (onDuplicate || onShare || onRemove) {
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        {cardContent}
      </Swipeable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
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
  coinName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  projectName: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  processStateBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  processStateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
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
  // UC-202: Star button styles
  starButton: {
    position: 'absolute',
    top: 8,
    left: 8,  // Top-left to avoid status badge
    zIndex: 10,
  },
  starBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // UC-201: Swipe action styles
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  duplicateAction: {
    backgroundColor: '#007AFF', // iOS blue
  },
  shareAction: {
    backgroundColor: '#007AFF', // iOS blue
  },
  deleteAction: {
    backgroundColor: '#FF3B30', // iOS red
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
