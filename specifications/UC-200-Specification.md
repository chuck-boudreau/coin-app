# UC-200: View Recent COINs - Implementation Prompt for Claude Code

**IMPORTANT CONTEXT:** This is the **FIRST** use case being implemented in a clean project. No other use cases exist yet. We're using **MOCK DATA** for COINs since UC-100 (Create COIN) hasn't been built yet.

---

## Project Overview

**Application:** COIN (Circle of Interaction) Diagram App for iPad  
**Platform:** React Native + Expo SDK 54  
**Current Status:** Clean slate, `src/` folders empty except `.gitkeep` files  
**Implementation Goal:** Build UC-200 (View Recent COINs) as home screen with mock data

**Project Location:** `~/Projects/coin-app`  
**Branch:** `wave-1-fresh-start-uc200`

---

## What You're Building

**UC-200: View Recent COINs** - The default home screen that displays recently accessed COIN diagrams as a visual grid, following iOS "Recents-first" patterns (like Files app, Notes, Pages).

**Key Pattern:** Grid of COIN cards sorted by last accessed timestamp, enabling visual recognition for users returning after gaps of days/weeks.

**Core Components Needed:**
1. `RecentsScreen.tsx` - Main screen with FlatList grid
2. `COINCard.tsx` - Individual card with thumbnail and metadata
3. `FloatingActionButton.tsx` - "+" button for future create action
4. `EmptyRecentsState.tsx` - Empty state when no COINs accessed
5. `AccessHistoryRepository.ts` - Data layer managing access history

**Mock Data:** 8 realistic test COINs with varying metadata, status, and timestamps

---

## Step 1: Create TypeScript Interfaces

Create `src/types/index.ts`:

```typescript
/**
 * Core COIN data model
 * Represents a single Circle of Interaction diagram
 */
export interface COIN {
  id: string;                    // UUID
  name: string;                  // Display name
  description?: string;          // Optional description
  projectId?: string;            // Optional: which project this belongs to
  projectName?: string;          // Denormalized for display
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  lastAccessedAt?: string;      // ISO 8601 - when user last opened it
  thumbnailUrl?: string;        // Optional: path to thumbnail image
  
  // Canvas data (minimal for Phase 1)
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}

export interface Circle {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
}

export interface Participant {
  id: string;
  name: string;
  role?: string;
  x: number;
  y: number;
}

export interface Interaction {
  id: string;
  number: number;              // The numbered arrow
  fromParticipantId: string;
  toParticipantId: string;
  description: string;
  products?: string[];         // Deliverables produced
}

/**
 * Tracks when user accessed each COIN
 * Stored separately in AsyncStorage
 */
export interface AccessHistoryEntry {
  coinId: string;              // Foreign key to COIN.id
  accessedAt: string;          // ISO 8601 timestamp
  thumbnailUrl?: string;       // Cached thumbnail path
}

export interface AccessHistory {
  userId: string;              // "local_user" for Phase 1
  entries: AccessHistoryEntry[];
  maxEntries: number;          // Default: 50
  lastUpdated: string;         // ISO 8601
}

/**
 * Props for COINCard component
 */
export interface COINCardProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  onRemove: (coinId: string) => void;
}

/**
 * Props for EmptyRecentsState component
 */
export interface EmptyRecentsStateProps {
  hasAnyCOINs: boolean;        // Determines which message variant
  onCreateCOIN: () => void;
  onBrowseProjects: () => void;
}
```

---

## Step 2: Create Mock Data

Create `src/utils/mockData.ts`:

```typescript
import { COIN, AccessHistoryEntry } from '../types';

/**
 * Mock COIN data for UC-200 testing
 * These represent realistic business process diagrams
 */
export const MOCK_COINS: COIN[] = [
  {
    id: 'coin-001',
    name: 'Employee Onboarding',
    description: 'New hire onboarding process for all departments',
    projectId: 'proj-001',
    projectName: 'HR Transformation',
    status: 'approved',
    createdAt: '2025-09-15T10:30:00.000Z',
    updatedAt: '2025-10-20T14:22:00.000Z',
    lastAccessedAt: '2025-10-24T09:15:00.000Z',
    circles: [
      { id: 'c1', name: 'Onboarding', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'HR Manager', role: 'Manager', x: 300, y: 250 },
      { id: 'p2', name: 'New Hire', role: 'Employee', x: 500, y: 250 },
      { id: 'p3', name: 'IT Support', role: 'Support', x: 400, y: 550 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Send welcome email',
        products: ['Welcome package', 'First day schedule']
      },
      {
        id: 'i2',
        number: 2,
        fromParticipantId: 'p2',
        toParticipantId: 'p3',
        description: 'Request equipment',
        products: ['Equipment list']
      }
    ]
  },
  {
    id: 'coin-002',
    name: 'Purchase Order Approval',
    description: 'Standard approval workflow for purchase orders under $10K',
    projectId: 'proj-002',
    projectName: 'Finance Process Redesign',
    status: 'review',
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2025-10-23T16:45:00.000Z',
    lastAccessedAt: '2025-10-23T16:45:00.000Z',
    circles: [
      { id: 'c1', name: 'Approval Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Requestor', role: 'Employee', x: 300, y: 250 },
      { id: 'p2', name: 'Manager', role: 'Manager', x: 500, y: 250 },
      { id: 'p3', name: 'Finance', role: 'Approver', x: 400, y: 550 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Submit PO request',
        products: ['Purchase order form']
      }
    ]
  },
  {
    id: 'coin-003',
    name: 'Customer Support Escalation',
    description: 'How support tickets get escalated to engineering',
    projectId: 'proj-003',
    projectName: 'Support Process Improvement',
    status: 'draft',
    createdAt: '2025-10-18T11:20:00.000Z',
    updatedAt: '2025-10-22T10:30:00.000Z',
    lastAccessedAt: '2025-10-22T10:30:00.000Z',
    circles: [
      { id: 'c1', name: 'Escalation', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Support Agent', role: 'Tier 1', x: 300, y: 250 },
      { id: 'p2', name: 'Engineering', role: 'Technical', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-004',
    name: 'Quarterly Planning',
    description: 'Process for setting quarterly OKRs',
    projectId: 'proj-004',
    projectName: 'Leadership Workshop 2025',
    status: 'draft',
    createdAt: '2025-10-10T09:00:00.000Z',
    updatedAt: '2025-10-21T15:20:00.000Z',
    lastAccessedAt: '2025-10-21T15:20:00.000Z',
    circles: [
      { id: 'c1', name: 'Planning Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Leadership Team', role: 'Executives', x: 400, y: 300 }
    ],
    interactions: []
  },
  {
    id: 'coin-005',
    name: 'Security Incident Response',
    description: 'Steps for responding to security incidents',
    projectId: 'proj-003',
    projectName: 'Support Process Improvement',
    status: 'approved',
    createdAt: '2025-09-20T13:45:00.000Z',
    updatedAt: '2025-10-19T11:00:00.000Z',
    lastAccessedAt: '2025-10-19T11:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Incident Response', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Security Team', role: 'Responder', x: 300, y: 250 },
      { id: 'p2', name: 'IT Operations', role: 'Support', x: 500, y: 250 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Alert of incident',
        products: ['Incident report']
      }
    ]
  },
  {
    id: 'coin-006',
    name: 'Product Launch Checklist',
    description: 'Coordinating go-to-market activities',
    projectId: 'proj-005',
    projectName: 'Product Launch Process',
    status: 'review',
    createdAt: '2025-10-05T14:00:00.000Z',
    updatedAt: '2025-10-18T09:30:00.000Z',
    lastAccessedAt: '2025-10-18T09:30:00.000Z',
    circles: [
      { id: 'c1', name: 'Launch Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Product Manager', role: 'Owner', x: 300, y: 250 },
      { id: 'p2', name: 'Marketing', role: 'Promoter', x: 500, y: 250 },
      { id: 'p3', name: 'Sales', role: 'Seller', x: 400, y: 550 }
    ],
    interactions: []
  },
  {
    id: 'coin-007',
    name: 'Invoice Processing',
    description: 'AP workflow for vendor invoices',
    projectId: 'proj-002',
    projectName: 'Finance Process Redesign',
    status: 'draft',
    createdAt: '2025-10-12T10:15:00.000Z',
    updatedAt: '2025-10-15T14:20:00.000Z',
    lastAccessedAt: '2025-10-15T14:20:00.000Z',
    circles: [
      { id: 'c1', name: 'AP Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Vendor', role: 'Supplier', x: 300, y: 250 },
      { id: 'p2', name: 'AP Clerk', role: 'Processor', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-008',
    name: 'Performance Review Process',
    description: 'Annual performance review workflow',
    projectId: 'proj-001',
    projectName: 'HR Transformation',
    status: 'approved',
    createdAt: '2025-09-01T08:30:00.000Z',
    updatedAt: '2025-10-14T16:00:00.000Z',
    lastAccessedAt: '2025-10-14T16:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Review Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Manager', role: 'Reviewer', x: 300, y: 250 },
      { id: 'p2', name: 'Employee', role: 'Reviewee', x: 500, y: 250 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Schedule review meeting',
        products: ['Meeting invite']
      }
    ]
  }
];

/**
 * Mock access history - determines order in Recents view
 * Sorted by accessedAt (newest first)
 */
export const MOCK_ACCESS_HISTORY: AccessHistoryEntry[] = [
  { coinId: 'coin-001', accessedAt: '2025-10-24T09:15:00.000Z' },
  { coinId: 'coin-002', accessedAt: '2025-10-23T16:45:00.000Z' },
  { coinId: 'coin-003', accessedAt: '2025-10-22T10:30:00.000Z' },
  { coinId: 'coin-004', accessedAt: '2025-10-21T15:20:00.000Z' },
  { coinId: 'coin-005', accessedAt: '2025-10-19T11:00:00.000Z' },
  { coinId: 'coin-006', accessedAt: '2025-10-18T09:30:00.000Z' },
  { coinId: 'coin-007', accessedAt: '2025-10-15T14:20:00.000Z' },
  { coinId: 'coin-008', accessedAt: '2025-10-14T16:00:00.000Z' }
];

/**
 * Get COINs sorted by recent access
 * This is the core data for RecentsScreen
 */
export function getRecentCOINs(limit: number = 20): COIN[] {
  // Sort access history by timestamp (newest first)
  const sortedHistory = [...MOCK_ACCESS_HISTORY].sort(
    (a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
  );
  
  // Map to COINs and take limit
  return sortedHistory
    .slice(0, limit)
    .map(entry => MOCK_COINS.find(coin => coin.id === entry.coinId))
    .filter((coin): coin is COIN => coin !== undefined);
}
```

---

## Step 3: Create Utility Functions

Create `src/utils/dateFormatting.ts`:

```typescript
/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * or absolute date for older items (e.g., "Oct 15")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Less than 1 minute
  if (diffMins < 1) return 'Just now';
  
  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }
  
  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  
  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  // More than 1 week - show absolute date
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}
```

Create `src/utils/statusColors.ts`:

```typescript
/**
 * Color mapping for COIN status badges
 */
export const STATUS_COLORS = {
  draft: {
    background: '#007AFF',  // iOS Blue
    text: '#FFFFFF'
  },
  review: {
    background: '#FF9500',  // iOS Orange
    text: '#FFFFFF'
  },
  approved: {
    background: '#34C759',  // iOS Green
    text: '#FFFFFF'
  },
  archived: {
    background: '#8E8E93',  // iOS Gray
    text: '#FFFFFF'
  }
} as const;

export function getStatusColor(status: 'draft' | 'review' | 'approved' | 'archived') {
  return STATUS_COLORS[status];
}
```

---

## Step 4: Create EmptyRecentsState Component

Create `src/components/EmptyRecentsState.tsx`:

```typescript
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
```

---

## Step 5: Create FloatingActionButton Component

Create `src/components/FloatingActionButton.tsx`:

```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed
      ]}
      onPress={onPress}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  icon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
```

---

## Step 6: Create COINCard Component

Create `src/components/COINCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COINCardProps } from '../types';
import { formatRelativeTime } from '../utils/dateFormatting';
import { getStatusColor } from '../utils/statusColors';

export function COINCard({ coin, onPress }: COINCardProps) {
  const statusColor = getStatusColor(coin.status);
  const relativeTime = formatRelativeTime(coin.lastAccessedAt || coin.updatedAt);
  
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
        <Text style={styles.timestamp}>{relativeTime}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
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
});
```

---

## Step 7: Create RecentsScreen Component

Create `src/screens/RecentsScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
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
import { EmptyRecentsState } from '../components/EmptyRecentsState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { COIN } from '../types';
import { getRecentCOINs, MOCK_COINS } from '../utils/mockData';

export function RecentsScreen() {
  const { width } = useWindowDimensions();
  const [recentCOINs, setRecentCOINs] = useState<COIN[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Determine if portrait or landscape
  const isPortrait = width < 1000;
  const numColumns = isPortrait ? 3 : 4;
  
  // Load recent COINs on mount
  useEffect(() => {
    loadRecentCOINs();
  }, []);
  
  const loadRecentCOINs = () => {
    // In real app, this would load from AsyncStorage
    // For now, using mock data
    const coins = getRecentCOINs(20);
    setRecentCOINs(coins);
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      loadRecentCOINs();
      setIsRefreshing(false);
    }, 500);
  };
  
  const handleCardPress = (coinId: string) => {
    // TODO: Navigate to COIN editor (UC-101) when implemented
    Alert.alert(
      'Open COIN',
      `Would open COIN: ${coinId}\n\n(UC-101 not yet implemented - this is UC-200 only)`,
      [{ text: 'OK' }]
    );
  };
  
  const handleRemoveFromRecents = (coinId: string) => {
    // TODO: Remove from recents (keep in storage)
    Alert.alert(
      'Remove from Recents',
      'This will remove the COIN from your recent list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setRecentCOINs(prev => prev.filter(coin => coin.id !== coinId));
          }
        }
      ]
    );
  };
  
  const handleCreateCOIN = () => {
    // TODO: Navigate to UC-100 (Create COIN) when implemented
    Alert.alert(
      'Create COIN',
      'Would open Create COIN modal\n\n(UC-100 not yet implemented - this is UC-200 only)',
      [{ text: 'OK' }]
    );
  };
  
  const handleBrowseProjects = () => {
    // TODO: Navigate to Projects tab (UC-201) when implemented
    Alert.alert(
      'Browse Projects',
      'Would switch to Projects tab\n\n(UC-201 not yet implemented - this is UC-200 only)',
      [{ text: 'OK' }]
    );
  };
  
  const isEmpty = recentCOINs.length === 0;
  const hasAnyCOINs = MOCK_COINS.length > 0;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isEmpty ? (
        <EmptyRecentsState
          hasAnyCOINs={hasAnyCOINs}
          onCreateCOIN={handleCreateCOIN}
          onBrowseProjects={handleBrowseProjects}
        />
      ) : (
        <FlatList
          data={recentCOINs}
          renderItem={({ item }) => (
            <COINCard
              coin={item}
              onPress={handleCardPress}
              onRemove={handleRemoveFromRecents}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={`grid-${numColumns}`} // Force re-render on column change
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
      )}
      
      <FloatingActionButton onPress={handleCreateCOIN} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 16,
  },
});
```

---

## Step 8: Update App.tsx

Update `App.tsx` to use RecentsScreen:

```typescript
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecentsScreen } from './src/screens/RecentsScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RecentsScreen />
    </SafeAreaProvider>
  );
}
```

---

## Implementation Checklist

After generating all files:

### File Structure Verification
- [ ] `src/types/index.ts` created with all interfaces
- [ ] `src/utils/mockData.ts` created with 8 mock COINs
- [ ] `src/utils/dateFormatting.ts` created
- [ ] `src/utils/statusColors.ts` created
- [ ] `src/components/EmptyRecentsState.tsx` created
- [ ] `src/components/FloatingActionButton.tsx` created
- [ ] `src/components/COINCard.tsx` created
- [ ] `src/screens/RecentsScreen.tsx` created
- [ ] `App.tsx` updated

### Build & Run
```bash
# Install any missing dependencies if needed
npm install

# Start Metro bundler
npm start

# Press 'i' for iOS simulator
```

### Visual Verification
- [ ] App launches without errors
- [ ] Grid displays 8 COIN cards (3 columns portrait, 4 landscape)
- [ ] Each card shows: thumbnail placeholder, COIN name, project, time, status
- [ ] Status badges colored correctly (blue/orange/green/gray)
- [ ] Cards sorted by most recent first ("Employee Onboarding" at top)
- [ ] "+" button visible in bottom-right
- [ ] Tapping card shows alert (UC-101 placeholder)
- [ ] Tapping "+" shows alert (UC-100 placeholder)
- [ ] Pull-to-refresh works
- [ ] Rotating device changes columns (3→4 or 4→3)

### Empty State Testing
```typescript
// Temporarily modify RecentsScreen to test empty state
// Change line: const coins = getRecentCOINs(20);
// To: const coins = [];
```
- [ ] Empty state displays
- [ ] Icon and text centered
- [ ] "Create Your First COIN" button visible
- [ ] Tapping button shows alert

---

## Success Criteria

**UC-200 is successfully implemented when:**

1. ✅ App displays Recents screen as home view
2. ✅ Grid shows 8 mock COINs in chronological order
3. ✅ Portrait shows 3 columns, landscape shows 4 columns
4. ✅ Each card displays complete metadata
5. ✅ Status badges use correct colors
6. ✅ Relative time formatting works ("2 hours ago", etc.)
7. ✅ Pull-to-refresh functional
8. ✅ Empty state displays when no COINs
9. ✅ "+" button visible and responsive
10. ✅ All interactions show appropriate alerts (placeholders for future UCs)
11. ✅ 60fps performance maintained
12. ✅ No TypeScript errors
13. ✅ No runtime errors or crashes

---

## Important Notes

**For Claude Code:**

1. **This is UC-200 ONLY** - Other use cases (UC-100, UC-101, UC-201) don't exist yet. Use Alert placeholders for their actions.

2. **Mock Data is Temporary** - When UC-100 is implemented, we'll replace `getRecentCOINs()` with real AsyncStorage reads.

3. **Thumbnails are Placeholders** - Using emoji circles for now. Real thumbnail generation comes later.

4. **No Navigation Stack Yet** - App.tsx directly renders RecentsScreen. Tab navigation will come with UC-201.

5. **TypeScript Strict Mode** - Keep all type definitions complete and accurate.

6. **iPad Focus** - Optimize for iPad screen sizes (3/4 column grid).

7. **iOS Design Language** - Use iOS conventions (colors, shadows, animations).

---

## After Implementation

When this is working:

1. **Test thoroughly** on iPad simulator (portrait and landscape)
2. **Commit to git:**
   ```bash
   git add .
   git commit -m "feat: UC-200 View Recent COINs - First implementation with mock data"
   git push origin wave-1-fresh-start-uc200
   ```

3. **Next steps:** Implement UC-100 (Create COIN), then UC-101 (Edit COIN), then connect everything

---

**Ready to generate? Create all the files above in the correct locations!**
