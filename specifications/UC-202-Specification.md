# UC-202: View Favorites (Favorites Tab) - Implementation Specification

**Specification Version:** 1.1 (CORRECTED)  
**Created:** October 30, 2025  
**Revised:** October 30, 2025 (Fixed to match actual codebase patterns)  
**Target Platform:** iPad only (React Native + Expo)  
**Dependencies:** UC-100, UC-101, UC-200 (Recents Tab)  
**Status:** Ready for Implementation

---

## 🎯 Implementation Overview

This specification implements the **Favorites tab** in the COIN app's three-tab navigation structure. The Favorites tab provides **priority-based quick access** to a user's most important COIN diagrams, independent of temporal (Recents) or hierarchical (Projects) organization.

**Key Implementation Principle:** This UC **REUSES** 95% of UC-200's components and patterns. The primary additions are:
1. Star icon toggle on COIN cards for favoriting/unfavoriting
2. Filter logic: `isFavorite === true && status !== 'archived'`
3. EmptyFavoritesState component (following EmptyRecentsState pattern)
4. Favorite status persistence (in-memory for Phase 1, AsyncStorage in Phase 2)

---

## 📚 CRITICAL: Read Before Implementation

**MUST READ FIRST:**
- `/CLAUDE.md` - Contains all reusable components, patterns, and constraints
- `sessions/UC-200-Session-Summary.md` - Reference implementation for all patterns
- `src/screens/RecentsScreen.tsx` - Actual implementation patterns (sorting, loading, handlers)

**Key Sections in CLAUDE.md:**
- "Files You Must NEVER Modify" - Critical constraints
- "Implemented Use Cases → UC-200" - All reusable components documented
- "Design System" - Colors, typography, spacing, shadows
- "Testing Checklist" - Complete verification requirements

---

## 🔄 Component Reuse Strategy (CRITICAL)

### ✅ REUSE These Components (DO NOT RECREATE)

**From UC-200 Implementation:**

1. **`COINCard.tsx`** (Grid View Card)
   - Location: `src/components/COINCard.tsx`
   - Current props: `coin`, `onPress`, `onRemove`, `showCreatedDate`
   - **Action Required:** Add `onToggleFavorite` prop
   - **Action Required:** Add star icon button (top-right corner)
   - **DO NOT:** Create `FavoriteCOINCard` or duplicate component

2. **`COINListItem.tsx`** (List View Row)
   - Location: `src/components/COINListItem.tsx`
   - Current props: `coin`, `onPress`, `showCreatedDate`
   - **Note:** Does NOT have `onRemove` (only COINCard has it)
   - **Action Required:** Add `onToggleFavorite` prop
   - **Action Required:** Add star icon button (right side)
   - **DO NOT:** Create new list item component

3. **`SortSelector.tsx`** (Sort Dropdown)
   - Location: `src/components/SortSelector.tsx`
   - **REUSE EXACTLY AS-IS** (no modifications needed)
   - Same 7 sort options work perfectly for Favorites

4. **`ViewToggle.tsx`** (Grid/List Toggle)
   - Location: `src/components/ViewToggle.tsx`
   - **REUSE EXACTLY AS-IS** (no modifications needed)
   - Same grid/list toggle UI

5. **`NavigationHeader.tsx`** (Screen Header)
   - Location: `src/components/NavigationHeader.tsx`
   - **REUSE EXACTLY AS-IS** (no modifications needed)

6. **`FloatingActionButton.tsx`** (FAB for Create New)
   - Location: `src/components/FloatingActionButton.tsx`
   - **REUSE EXACTLY AS-IS** (no modifications needed)
   - Same positioning and behavior

### 🆕 CREATE These Components (New for UC-202)

7. **`EmptyFavoritesState.tsx`** (Empty State)
   - **Model after:** `EmptyRecentsState.tsx` (follow exact pattern)
   - **Location:** `src/components/EmptyFavoritesState.tsx`
   - Shows when no COINs are favorited
   - Includes guidance on how to add favorites

---

## 📝 Data Model Changes

### Modify: `src/types/index.ts`

**Add `isFavorite` field to COIN interface:**

```typescript
export interface COIN {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  thumbnailUrl?: string;
  
  // 🆕 NEW FIELD FOR UC-202
  isFavorite?: boolean;  // Default false, true when user favorites
  
  // Canvas data
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}
```

**Critical Rules:**
- Default value: `false` (or undefined, treat as false)
- When user taps star icon: Toggle between `true` and `false`
- When COIN is archived: Automatically set to `false` (auto-unfavorite)
- **Phase 1:** Stored in-memory only (MOCK_COINS array)
- **Phase 2:** Will persist in AsyncStorage with COIN data

---

## 💾 Phase 1 Data Strategy (IMPORTANT)

### How UC-200 Actually Works (Verified from Code)

**RecentsScreen pattern:**
```typescript
// Loads from mockData.ts
import { getRecentCOINs, MOCK_COINS } from '../utils/mockData';

const loadRecentCOINs = () => {
  // In real app, this would load from AsyncStorage
  // For now, using mock data
  const coins = getRecentCOINs(20);
  setRecentCOINs(coins);
};
```

**NO storage utilities exist yet:**
- ❌ No `loadCOINs()` function
- ❌ No `saveCOIN()` function  
- ❌ No storage abstraction layer
- ✅ Direct use of MOCK_COINS from `mockData.ts`

### UC-202 Phase 1 Implementation

**For Phase 1, favorites are stored IN-MEMORY:**

```typescript
import { MOCK_COINS } from '../utils/mockData';

export function FavoritesScreen() {
  const [coins, setCoins] = useState<COIN[]>([]);
  
  useEffect(() => {
    // Load mock data
    setCoins(MOCK_COINS);
  }, []);
  
  // Filter for favorites
  const favoriteCOINs = useMemo(() => {
    return coins.filter(coin => 
      coin.isFavorite === true &&
      coin.status !== 'archived'
    );
  }, [coins]);
  
  // Toggle favorite (in-memory only for Phase 1)
  const handleToggleFavorite = (coinId: string) => {
    setCoins(prevCoins =>
      prevCoins.map(coin =>
        coin.id === coinId
          ? { ...coin, isFavorite: !coin.isFavorite }
          : coin
      )
    );
    
    // Show feedback
    const updatedCOIN = coins.find(c => c.id === coinId);
    Alert.alert(
      '',
      updatedCOIN?.isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      [{ text: 'OK' }]
    );
  };
}
```

**Phase 2 Will Add:**
- AsyncStorage persistence
- CRUD operations for COINs
- Storage utilities
- Cloud sync preparation

---

## 🎨 Star Icon Implementation

### Visual Design

**Filled Star (Favorited):**
```typescript
<Ionicons name="star" size={24} color="#FF9500" />  // iOS orange
```

**Outline Star (Not Favorited):**
```typescript
<Ionicons name="star-outline" size={24} color="#8E8E93" />  // iOS gray
```

### Positioning in Components

**In COINCard (Grid View):**
- Position: Top-right corner
- Offset: 8px from top, 8px from right
- Absolute positioning over card
- Touch target: 44x44px minimum
- Background: White circle with shadow for visibility over thumbnails

**In COINListItem (List View):**
- Position: Right side, before chevron
- Vertically centered
- Touch target: 44x44px minimum
- No background needed (list rows have white background)

### Interaction Behavior

**On Press (Phase 1 - In-Memory Only):**
```typescript
const handleToggleFavorite = (coinId: string) => {
  // Find the COIN
  const coin = coins.find(c => c.id === coinId);
  if (!coin) return;
  
  // Toggle favorite status
  setCoins(prevCoins =>
    prevCoins.map(c =>
      c.id === coinId
        ? { ...c, isFavorite: !c.isFavorite }
        : c
    )
  );
  
  // Show feedback (using Alert, not toast)
  Alert.alert(
    '',
    coin.isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
    [{ text: 'OK' }]
  );
  
  // Optional: Haptic feedback (requires expo-haptics)
  // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

**Note on Feedback:**
- Project uses React Native's built-in `Alert.alert()` (verified from RecentsScreen)
- No toast library currently in use
- Alert is simple, native, and works well for Phase 1

---

## 🏗️ FavoritesScreen Implementation

### File: `src/screens/FavoritesScreen.tsx`

**Replace the placeholder with full implementation.**

### Complete Implementation

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COINCard } from '../components/COINCard';
import { COINListItem } from '../components/COINListItem';
import { EmptyFavoritesState } from '../components/EmptyFavoritesState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { NavigationHeader } from '../components/NavigationHeader';
import { SortSelector, SortOption } from '../components/SortSelector';
import { ViewToggle, ViewMode } from '../components/ViewToggle';
import { COIN } from '../types';
import { MOCK_COINS } from '../utils/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SORT_OPTION_KEY = '@design_the_what:sort_option_favorites';
const VIEW_MODE_KEY = '@design_the_what:view_mode_favorites';

export function FavoritesScreen() {
  const { width, height } = useWindowDimensions();
  const [coins, setCoins] = useState<COIN[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Determine if portrait or landscape
  const isPortrait = height > width;
  const numColumns = isPortrait ? 3 : 4;

  // Calculate card width for grid layout (same as RecentsScreen)
  const horizontalPadding = 16;
  const gap = 16;
  const availableWidth = width - (horizontalPadding * 2);
  const totalGaps = (numColumns - 1) * gap;
  const cardWidth = (availableWidth - totalGaps) / numColumns;

  // Load COINs and preferences on mount
  useEffect(() => {
    loadCOINs();
    loadPreferences();
  }, []);

  const loadCOINs = () => {
    // Phase 1: Load from mock data
    setCoins(MOCK_COINS);
  };

  const loadPreferences = async () => {
    try {
      const [savedSort, savedView] = await Promise.all([
        AsyncStorage.getItem(SORT_OPTION_KEY),
        AsyncStorage.getItem(VIEW_MODE_KEY)
      ]);

      if (savedSort) {
        setSortOption(savedSort as SortOption);
      }
      if (savedView) {
        setViewMode(savedView as ViewMode);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const handleSortChange = async (newSort: SortOption) => {
    setSortOption(newSort);
    try {
      await AsyncStorage.setItem(SORT_OPTION_KEY, newSort);
    } catch (error) {
      console.log('Error saving sort option:', error);
    }
  };

  const handleViewModeChange = async (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, newMode);
    } catch (error) {
      console.log('Error saving view mode:', error);
    }
  };

  // Filter for favorited, non-archived COINs
  const favoriteCOINs = useMemo(() => {
    return coins.filter(coin => 
      coin.isFavorite === true &&
      coin.status !== 'archived'
    );
  }, [coins]);

  // Sort favorites (INLINE - following RecentsScreen pattern)
  const sortedFavorites = useMemo(() => {
    const sorted = [...favoriteCOINs];

    switch (sortOption) {
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.lastAccessedAt || a.updatedAt).getTime();
          const dateB = new Date(b.lastAccessedAt || b.updatedAt).getTime();
          return dateB - dateA;
        });

      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));

      case 'status-asc':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));

      case 'status-desc':
        return sorted.sort((a, b) => b.status.localeCompare(a.status));

      case 'created-newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

      case 'created-oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });

      default:
        return sorted;
    }
  }, [favoriteCOINs, sortOption]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadCOINs();
      setIsRefreshing(false);
    }, 500);
  };

  const handleCardPress = (coinId: string) => {
    // TODO: Navigate to COIN editor (UC-101) when implemented
    Alert.alert(
      'Open COIN',
      `Would open COIN: ${coinId}\n\n(UC-101 not yet implemented)`,
      [{ text: 'OK' }]
    );
  };

  const handleToggleFavorite = (coinId: string) => {
    // Find the COIN to show correct feedback
    const coin = coins.find(c => c.id === coinId);
    if (!coin) return;
    
    const willBeFavorite = !coin.isFavorite;
    
    // Toggle favorite status (in-memory for Phase 1)
    setCoins(prevCoins =>
      prevCoins.map(c =>
        c.id === coinId
          ? { ...c, isFavorite: !c.isFavorite }
          : c
      )
    );
    
    // Show feedback
    Alert.alert(
      '',
      willBeFavorite ? 'Added to Favorites' : 'Removed from Favorites',
      [{ text: 'OK' }]
    );
  };

  const handleCreateCOIN = () => {
    Alert.alert(
      'Create COIN',
      'Would open Create COIN modal\n\n(UC-100 not yet implemented)',
      [{ text: 'OK' }]
    );
  };

  const isEmpty = sortedFavorites.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {isEmpty ? (
        <EmptyFavoritesState />
      ) : (
        <View style={styles.contentContainer}>
          <NavigationHeader
            rightAction={
              <ViewToggle viewMode={viewMode} onToggle={handleViewModeChange} />
            }
          />
          <SortSelector currentSort={sortOption} onSortChange={handleSortChange} />

          {viewMode === 'grid' ? (
            <FlatList
              data={sortedFavorites}
              renderItem={({ item }) => (
                <View style={{ width: cardWidth, marginBottom: 16 }}>
                  <COINCard
                    coin={item}
                    onPress={handleCardPress}
                    onRemove={() => {}} // Placeholder - not used in Favorites
                    onToggleFavorite={handleToggleFavorite}
                    showCreatedDate={sortOption === 'created-newest' || sortOption === 'created-oldest'}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={`grid-${numColumns}`}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#007AFF"
                />
              }
            />
          ) : (
            <FlatList
              data={sortedFavorites}
              renderItem={({ item }) => (
                <COINListItem
                  coin={item}
                  onPress={handleCardPress}
                  onToggleFavorite={handleToggleFavorite}
                  showCreatedDate={sortOption === 'created-newest' || sortOption === 'created-oldest'}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listViewContent}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#007AFF"
                />
              }
            />
          )}
        </View>
      )}
      <FloatingActionButton onPress={handleCreateCOIN} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 81,
  },
  listViewContent: {
    padding: 16,
    paddingBottom: 97,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 16,
  },
});
```

---

## 🆕 EmptyFavoritesState Component

### File: `src/components/EmptyFavoritesState.tsx`

**Follow EmptyRecentsState.tsx pattern exactly.**

### Component Implementation

```typescript
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
```

---

## 📊 Archival Behavior (CRITICAL)

### Rule: Archived COINs Never Show in Favorites

**Implementation Requirements:**

1. **Filter Logic:**
```typescript
const visibleFavorites = coins.filter(coin =>
  coin.isFavorite === true &&           // User favorited it
  coin.status !== 'archived'            // NOT archived
);
```

2. **Auto-Unfavorite on Archive (Future UC):**
```typescript
function archiveCOIN(coinId: string) {
  setCoins(prevCoins =>
    prevCoins.map(coin =>
      coin.id === coinId
        ? {
            ...coin,
            status: 'archived',
            isFavorite: false,      // 🚨 CRITICAL: Auto-unfavorite
          }
        : coin
    )
  );
}
```

---

## 🎨 Component Modifications Required

### 1. Modify COINCard.tsx

**Add star icon button and onToggleFavorite prop:**

```typescript
import { Ionicons } from '@expo/vector-icons';

// UPDATE interface (ADD onToggleFavorite)
export interface COINCardProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  onRemove: (coinId: string) => void;
  showCreatedDate?: boolean;
  onToggleFavorite?: (coinId: string) => void;  // 🆕 NEW OPTIONAL PROP
}

export function COINCard({ 
  coin, 
  onPress, 
  onRemove, 
  showCreatedDate = false,
  onToggleFavorite  // 🆕 NEW
}: COINCardProps) {
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
      {/* Existing card content */}
      <View style={styles.thumbnailContainer}>
        <View style={styles.placeholderThumbnail}>
          <Text style={styles.placeholderIcon}>⭕</Text>
        </View>

        <View style={styles.nameOverlay}>
          <Text style={styles.coinName} numberOfLines={2}>
            {coin.name}
          </Text>
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
        
        {/* 🆕 NEW: Star icon button (only if handler provided) */}
        {onToggleFavorite && (
          <Pressable
            style={styles.starButton}
            onPress={(e) => {
              e.stopPropagation();  // Prevent card press
              onToggleFavorite(coin.id);
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <View style={styles.starBackground}>
              <Ionicons
                name={coin.isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={coin.isFavorite ? '#FF9500' : '#8E8E93'}
              />
            </View>
          </Pressable>
        )}
      </View>

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
  // ... existing styles
  
  // 🆕 NEW STYLES
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
});
```

**Note:** Positioned top-left to avoid status badge (top-right)

### 2. Modify COINListItem.tsx

**Add star icon button and onToggleFavorite prop:**

```typescript
import { Ionicons } from '@expo/vector-icons';

// UPDATE interface
interface COINListItemProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  showCreatedDate?: boolean;
  onToggleFavorite?: (coinId: string) => void;  // 🆕 NEW OPTIONAL PROP
}

export function COINListItem({ 
  coin, 
  onPress, 
  showCreatedDate = false,
  onToggleFavorite  // 🆕 NEW
}: COINListItemProps) {
  const statusColor = getStatusColor(coin.status);
  const relativeTime = showCreatedDate
    ? formatRelativeTime(coin.createdAt)
    : formatRelativeTime(coin.lastAccessedAt || coin.updatedAt);
  const dateLabel = showCreatedDate ? 'Created' : 'Accessed';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed
      ]}
      onPress={() => onPress(coin.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⭕</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.project} numberOfLines={1}>
          {coin.projectName || 'No Project'}
        </Text>
      </View>

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
        
        {/* 🆕 NEW: Star icon button (only if handler provided) */}
        {onToggleFavorite && (
          <Pressable
            style={styles.starButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(coin.id);
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={coin.isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={coin.isFavorite ? '#FF9500' : '#8E8E93'}
            />
          </Pressable>
        )}
        
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ... existing styles
  
  // 🆕 NEW STYLE
  starButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## 🗄️ Mock Data Setup (Phase 1)

### Modify: `src/utils/mockData.ts`

**Add `isFavorite` to some test COINs:**

```typescript
export const MOCK_COINS: COIN[] = [
  {
    id: 'coin-001',
    name: 'Employee Onboarding',
    // ... existing fields
    isFavorite: true,  // 🆕 Pre-favorited for testing
    // ... rest of fields
  },
  {
    id: 'coin-002',
    name: 'Purchase Order Approval',
    // ... existing fields
    isFavorite: true,  // 🆕 Pre-favorited for testing
    // ... rest of fields
  },
  {
    id: 'coin-003',
    name: 'Customer Support Escalation',
    // ... existing fields
    isFavorite: false,  // Not favorited
    // ... rest of fields
  },
  // ... rest of COINs (all default to undefined/false)
];
```

**This gives you 2 pre-favorited COINs to test with immediately.**

---

## 🧪 Testing Checklist

### Functional Testing

- [ ] **Empty State**
  - [ ] Empty state shows when no COINs favorited
  - [ ] Icon, title, and message display correctly
  - [ ] Can exit empty state by favoriting a COIN

- [ ] **Adding Favorites**
  - [ ] Tap star outline on COIN card → fills star
  - [ ] Alert shows "Added to Favorites"
  - [ ] COIN appears in Favorites tab immediately
  - [ ] Can favorite from Recents tab
  - [ ] Star fills on BOTH Recents and Favorites

- [ ] **Removing Favorites**
  - [ ] Tap filled star → unfills star
  - [ ] Alert shows "Removed from Favorites"
  - [ ] COIN disappears from Favorites tab
  - [ ] Removal happens immediately
  - [ ] Removing last favorite returns to empty state

- [ ] **Archival Behavior (CRITICAL)**
  - [ ] Archived COINs do NOT show in Favorites
  - [ ] Filter works: `isFavorite === true && status !== 'archived'`

- [ ] **Sorting**
  - [ ] All 7 sort options work correctly
  - [ ] Sort preference persists across sessions
  - [ ] Sort applies to favorites only

- [ ] **View Toggle**
  - [ ] Grid view: 3 columns portrait, 4 columns landscape
  - [ ] List view: Single column
  - [ ] View preference persists
  - [ ] Star icons visible in both views

- [ ] **Navigation**
  - [ ] Tapping COIN card shows alert (UC-101 placeholder)
  - [ ] Tapping star toggles favorite (doesn't open COIN)
  - [ ] FAB shows alert (UC-100 placeholder)
  - [ ] Tab switching works smoothly

### Orientation Testing

- [ ] **Portrait:** 3 columns, star icons visible and tappable
- [ ] **Landscape:** 4 columns, star icons visible and tappable
- [ ] **Rotation:** Grid recalculates, no broken layouts

### Touch Target Testing

- [ ] Star icons: 44x44px minimum (verify with hitSlop)
- [ ] COIN cards: Tappable area clearly defined
- [ ] Sort buttons: Easy to tap
- [ ] View toggle: Easy to tap

### Data Persistence Testing

- [ ] Sort preference persists after:
  - [ ] App restart
  - [ ] Tab switching
- [ ] View mode preference persists
- [ ] **Favorite status does NOT persist in Phase 1** (by design - in-memory only)

### Performance Testing

- [ ] Smooth scrolling with 8 favorited COINs
- [ ] Star toggle responds instantly
- [ ] Grid recalculation on rotation is fast
- [ ] Pull-to-refresh doesn't lag

### Integration Testing (Regression)

- [ ] **UC-200 (Recents) still works:**
  - [ ] Recents screen unchanged
  - [ ] No visual glitches
- [ ] **Tab Navigation:**
  - [ ] All three tabs switch smoothly
  - [ ] Tab bar doesn't break

### Edge Cases

- [ ] Favoriting then immediately unfavoriting
- [ ] Favoriting all COINs
- [ ] Removing last favorite returns to empty state
- [ ] Star icon stops propagation (doesn't open COIN)

---

## ✅ Acceptance Criteria

### Must Have (Phase 1)

1. ✅ Favorites tab shows only favorited, non-archived COINs
2. ✅ Star icon on COIN cards toggles favorite status
3. ✅ Filled star (orange) when favorited, outline (gray) when not
4. ✅ Empty state shows when no favorites exist
5. ✅ Grid view: 3 columns portrait, 4 columns landscape
6. ✅ List view: Full-width rows
7. ✅ Sort options: All 7 work
8. ✅ View toggle: Grid/List persists
9. ✅ Archived COINs never show in Favorites
10. ✅ Alert feedback on favorite/unfavorite
11. ✅ No regression in UC-200 (Recents)
12. ✅ 44x44px touch targets for star icons
13. ✅ Performance: 60fps scrolling, instant star toggle
14. ✅ **Favorite status stored in-memory (Phase 1 design)**

### Explicitly Out of Scope (Phase 1)

- ❌ AsyncStorage persistence of favorite status (Phase 2)
- ❌ Cloud sync (Phase 2)
- ❌ Web app favorites (Phase 2)
- ❌ Batch operations (Phase 3)
- ❌ Drag-to-reorder (Phase 3)

---

## 🚀 Implementation Steps (Recommended Order)

### Step 1: Data Model Update (5 minutes)
1. Open `src/types/index.ts`
2. Add `isFavorite?: boolean` to COIN interface
3. Open `src/utils/mockData.ts`
4. Add `isFavorite: true` to coin-001 and coin-002 for testing
5. Commit: `git commit -m "UC-202: Add isFavorite field to COIN model"`

### Step 2: Create EmptyFavoritesState Component (15 minutes)
1. Create `src/components/EmptyFavoritesState.tsx`
2. Follow EmptyRecentsState pattern
3. Test empty state display
4. Commit: `git commit -m "UC-202: Create EmptyFavoritesState component"`

### Step 3: Modify COINCard Component (20 minutes)
1. Open `src/components/COINCard.tsx`
2. Add `onToggleFavorite` optional prop to interface
3. Add star icon button (top-left corner)
4. Test star toggle without breaking existing functionality
5. Verify in RecentsScreen (should still work, star won't show)
6. Commit: `git commit -m "UC-202: Add star toggle to COINCard"`

### Step 4: Modify COINListItem Component (15 minutes)
1. Open `src/components/COINListItem.tsx`
2. Add `onToggleFavorite` optional prop to interface
3. Add star icon button before chevron
4. Test star toggle
5. Verify in RecentsScreen (list view should still work)
6. Commit: `git commit -m "UC-202: Add star toggle to COINListItem"`

### Step 5: Implement FavoritesScreen (30 minutes)
1. Open `src/screens/FavoritesScreen.tsx`
2. Replace placeholder with full implementation
3. Follow RecentsScreen pattern for sorting
4. Test empty state, grid view, list view
5. Test favoriting/unfavoriting
6. Commit: `git commit -m "UC-202: Implement FavoritesScreen"`

### Step 6: Integration Testing (20 minutes)
1. Test favoriting from Recents tab (when star added in future)
2. Verify favorites appear in Favorites tab
3. Test unfavoriting from Favorites tab
4. Test orientation changes
5. Verify Recents still works (regression)
6. Commit: `git commit -m "UC-202: Final testing and polish"`

### Step 7: Update CLAUDE.md (10 minutes)
1. Add UC-202 to "Implemented Use Cases" section
2. Update "Current UC Being Implemented" to next UC
3. Document Phase 1 in-memory pattern
4. Commit with UC-202: `git commit --amend`

**Total Estimated Time:** ~2 hours

---

## 📚 Reference Files

**Must Read:**
- `CLAUDE.md` - All component patterns
- `src/screens/RecentsScreen.tsx` - Exact pattern to follow
- `src/components/COINCard.tsx` - Component to modify
- `src/components/COINListItem.tsx` - Component to modify
- `src/components/EmptyRecentsState.tsx` - Pattern to follow
- `src/types/index.ts` - Data model to extend
- `src/utils/mockData.ts` - Test data to update

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T

1. **Don't create storage utilities** (they don't exist yet, use inline pattern)
2. **Don't use `onPress: (coin: COIN) => void`** (actual signature is `(coinId: string) => void`)
3. **Don't create duplicate components** (modify existing with optional props)
4. **Don't forget `e.stopPropagation()`** (prevents card press when tapping star)
5. **Don't forget archival filter** (`status !== 'archived'`)
6. **Don't use toast libraries** (project uses `Alert.alert()`)
7. **Don't copy sorting utility** (it doesn't exist, copy inline pattern)
8. **Don't add onRemove to COINListItem** (only COINCard has it)

### ✅ DO

1. ✅ Follow RecentsScreen pattern exactly
2. ✅ Use `Alert.alert()` for feedback
3. ✅ Copy inline sorting from RecentsScreen
4. ✅ Use correct handler signatures (`coinId: string`)
5. ✅ Make `onToggleFavorite` optional (doesn't break Recents)
6. ✅ Test both grid and list views
7. ✅ Verify Recents still works after modifications
8. ✅ Use MOCK_COINS for Phase 1 data
9. ✅ Document that favorites are in-memory for Phase 1

---

## 🎉 Final Notes

**This is a straightforward implementation** following UC-200 patterns exactly. Key differences from original spec:

1. ✅ **Handler signatures corrected** (`coinId` not `coin`)
2. ✅ **No storage utilities** (inline pattern like RecentsScreen)
3. ✅ **No sorting utilities** (inline pattern like RecentsScreen)
4. ✅ **Alert.alert() for feedback** (not toast)
5. ✅ **Phase 1 in-memory only** (no AsyncStorage persistence yet)
6. ✅ **Test data included** (coin-001 and coin-002 pre-favorited)

**Follow the patterns, test thoroughly, and this should be approved on first try!**

---

**Specification Complete - Ready for Implementation**  
**Last Updated:** October 30, 2025  
**Version:** 1.1 (Corrected to match actual codebase)
