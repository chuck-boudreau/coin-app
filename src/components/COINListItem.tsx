import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { COIN } from '../types';
import { formatRelativeTime } from '../utils/dateFormatting';
import { getStatusColor } from '../utils/statusColors';

interface COINListItemProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  onToggleFavorite?: (coinId: string) => void;  // UC-202: Optional handler for favorite toggle
  onDuplicate?: (coinId: string) => void;       // UC-201: Optional handler for duplicate action
  onShare?: (coinId: string) => void;           // UC-201: Optional handler for share action
  onRemove?: (coinId: string) => void;          // UC-201: Optional handler for delete action
}

export function COINListItem({ coin, onPress, onToggleFavorite, onDuplicate, onShare, onRemove }: COINListItemProps) {
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

  const listContent = (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed
      ]}
      onPress={() => onPress(coin.id)}
      onLongPress={handleLongPress}
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
        <View style={styles.projectRow}>
          <Text style={styles.project} numberOfLines={1}>
            {coin.projectName || 'No Project'}
          </Text>
          {coin.processState === 'future' && (
            <View style={styles.processStateBadge}>
              <Text style={styles.processStateText}>Future</Text>
            </View>
          )}
        </View>
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

  // Only wrap with Swipeable if any swipe actions are provided
  if (onDuplicate || onShare || onRemove) {
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        {listContent}
      </Swipeable>
    );
  }

  return listContent;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
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
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  project: {
    fontSize: 14,
    color: '#666666',
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
    minWidth: 75,
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
