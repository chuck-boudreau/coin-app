# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a native iPad application for creating COIN (Circle of Interaction) diagrams - a professional business process design tool for business analysts. Built with Expo + React Native, targeting iPad (iOS) exclusively in Phase 1.

**Bundle ID:** com.agiledesignmethods.coinapp
**Current Phase:** Phase 1 - Local iPad MVP (offline-first, single-user)

## Commands

### Development
```bash
# Start development server (then press 'i' for iOS Simulator or scan QR with Expo Go)
npm start

# Start directly on iOS
npm run ios

# Start on Android
npm run android

# Start web version
npm run web
```

### Testing
Test in iOS Simulator or on physical iPad using Expo Go. Rotate device/simulator to test both portrait and landscape orientations (Hardware → Rotate Left/Right in simulator).

## Critical Constraints - READ THIS FIRST

### React Native vs React DOM
This is React Native, NOT React for web. The differences are critical:

**Components:**
- ✅ USE: `View`, `Text`, `TouchableOpacity`, `TextInput`, `ScrollView`, `FlatList` from `react-native`
- ❌ NEVER: `div`, `span`, `button`, `input`, or any HTML elements

**Styling:**
- ✅ USE: `StyleSheet.create()` from `react-native`
- ❌ NEVER: CSS files, Tailwind, `className`, `styled-components`

**Events:**
- ✅ USE: `onPress`, `onChangeText`
- ❌ NEVER: `onClick`, `onChange`, `onMouseDown`

**Storage:**
- ✅ USE: `@react-native-async-storage/async-storage` for data, `expo-secure-store` for sensitive data
- ❌ NEVER: `localStorage`, `sessionStorage`, `IndexedDB`

**Navigation:**
- ✅ USE: `@react-navigation/native` with Stack Navigator
- ❌ NEVER: React Router, browser history API

### iPad-Specific Requirements
- **Touch Targets:** Minimum 44x44 pixels for all interactive elements
- **Orientation:** Support both portrait and landscape
- **Performance:** Maintain 60fps animations and scrolling
- **Safe Areas:** Use `SafeAreaView` from `react-native-safe-area-context` to avoid notch/home indicator
- **Keyboard:** Handle keyboard appearance with dismissal on tap-outside pattern

## Architecture

### File Organization
```
src/
  components/     # Reusable React Native components (buttons, cards, modals)
  screens/        # Screen components (one per use case: HomeScreen, etc.)
  navigation/     # Navigation configuration (React Navigation)
  storage/        # AsyncStorage wrappers (COINRepository pattern)
  types/          # TypeScript interfaces (COIN, etc.)
  utils/          # Helper functions (date formatting, UUID generation)
```

### Data Persistence Pattern
Use repository classes that wrap AsyncStorage:

```typescript
// Storage key pattern
await AsyncStorage.setItem(`coin_${coin.id}`, JSON.stringify(coin));

// Maintain index for listings
await AsyncStorage.setItem('coin_list', JSON.stringify(coinIds));
```

### TypeScript
All code uses TypeScript with strict mode enabled (`tsconfig.json` extends `expo/tsconfig.base`). All data models use interfaces, all components have typed props.

### Core Data Model
```typescript
interface COIN {
  id: string;              // UUID
  name: string;
  version: number;
  createdAt: string;       // ISO date string
  createdBy: string;       // Device ID in Phase 1
  lastModifiedBy: string;
  lastModifiedAt: string;  // ISO date string
  // Phase 2 fields (included but unused)
  syncStatus?: 'local' | 'synced' | 'conflict';
  serverVersion?: number;
}
```

## Component Patterns

### Standard Component Structure
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Press Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    minHeight: 44, // iPad touch target minimum
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### List Rendering
Use `FlatList` for lists, never `ScrollView` with `.map()`:
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  ListEmptyComponent={<EmptyState />}
/>
```

### Modal Pattern
```typescript
<Modal
  visible={isVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={onClose}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.modalContent}>
      {/* modal content */}
    </View>
  </TouchableWithoutFeedback>
</Modal>
```

## Use Case Specifications

Detailed use case specifications are in `/specifications/`:
- **UC-201:** View/List My COINs (Home Screen) - implements first
- **UC-100:** Create New COIN - modal triggered from home screen

Implementation order for Wave 1:
1. UC-201 (home screen with empty state)
2. UC-100 (new COIN modal)
3. Integration testing

When implementing features, reference the specific UC file for acceptance criteria, iPad requirements, test scenarios, and implementation guidance.

## Context Files

**IMPORTANT:** The file `CLAUDE_CODE_CONTEXT.md` contains comprehensive React Native development patterns, common mistakes to avoid, and iPad-specific requirements. Read this file before generating any code.

## Development Principles

### Offline-First
All operations work without network. AsyncStorage for local persistence. Data models are cloud-ready (Phase 2 fields exist) but Phase 1 is local-only.

### iPad-First Design
Every component must work in both portrait and landscape orientations. Test rotation in simulator. Use flexbox layouts that adapt to screen dimensions.

### Performance
- Maintain 60fps for all animations and scrolling
- Use `FlatList` for efficient list rendering
- Memoize expensive computations with `useMemo` and `useCallback`
- Avoid anonymous functions in render methods

### Type Safety
- All props interfaces defined
- No `any` types
- Strict TypeScript mode enabled

## Common Gotchas

1. **Not using React Native components** - Check imports are from `react-native`, not React DOM
2. **CSS syntax in StyleSheet** - No units (16 not "16px"), camelCase properties (backgroundColor not background-color)
3. **Touch targets too small** - All interactive elements minimum 44x44px
4. **Forgetting keyboard handling** - Wrap scrollable content, implement keyboard dismissal
5. **Not testing both orientations** - Layout must work in portrait and landscape
6. **Using web storage APIs** - Use AsyncStorage, not localStorage
7. **Using .map() for long lists** - Use FlatList for performance

## Phase 1 vs Phase 2

**Phase 1 (Current):** Local-only iPad app
- No authentication
- No backend/API
- Single user
- AsyncStorage only
- Offline only

**Phase 2 (Future):** Will add cloud sync, multi-user, web app
- Data models already include Phase 2 fields (syncStatus, serverVersion)
- Don't use or implement Phase 2 fields yet
- Design patterns should be cloud-ready but not cloud-dependent
