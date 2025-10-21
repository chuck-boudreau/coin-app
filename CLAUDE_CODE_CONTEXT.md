# COIN App - React Native Development Context

**CRITICAL: Read this file completely before generating any code.**

## Project Overview

Building a native iPad application for creating COIN (Circle of Interaction) diagrams. This is a professional business process design tool for business analysts.

## Technology Stack

- **Framework:** Expo + React Native (SDK 54.0.0)
- **Language:** TypeScript (strict mode)
- **Target Platform:** iPad (iOS)
- **Bundle ID:** com.agiledesignmethods.coinapp
- **Testing:** iOS Simulator + Expo Go on physical iPad

## Key Dependencies

**Navigation:**
- @react-navigation/native
- @react-navigation/stack
- react-native-screens
- react-native-safe-area-context

**Storage:**
- @react-native-async-storage/async-storage (local data)
- expo-secure-store (sensitive data/keys)

**Media:**
- expo-camera
- expo-image-picker

## Architecture Principles

### 1. iPad-First Design
- **Orientation:** Support both portrait and landscape
- **Touch Targets:** Minimum 44x44 pixels
- **Performance:** Maintain 60fps
- **Gestures:** Use native iOS gesture patterns

### 2. Offline-First
- All operations work without network
- AsyncStorage for local persistence
- Data models are cloud-ready (for Phase 2) but Phase 1 is local-only

### 3. React Native Patterns (NOT React DOM)

**Components:**
```typescript
// ✅ USE THESE (React Native)
import { View, Text, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';

// ❌ NEVER USE THESE (React DOM/HTML)
// div, span, button, input, etc.
```

**Styling:**
```typescript
// ✅ USE THIS
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({ ... });

// ❌ NEVER USE
// Tailwind CSS, CSS modules, styled-components
```

**Touch Events:**
```typescript
// ✅ USE THIS


// ❌ NEVER USE
// onClick, onMouseDown, etc.
```

### 4. TypeScript Interfaces

All data models use TypeScript interfaces. Example:
```typescript
interface COIN {
  id: string;              // UUID
  name: string;
  version: number;
  createdAt: string;       // ISO date string
  createdBy: string;       // User ID
  lastModifiedBy: string;
  // Phase 2 fields (not used yet, but included)
  syncStatus?: 'local' | 'synced' | 'conflict';
  serverVersion?: number;
}
```

### 5. File Organization
```
src/
  components/     # Reusable React Native components
  screens/        # Screen components (one per use case)
  navigation/     # Navigation configuration
  storage/        # AsyncStorage wrappers
  types/          # TypeScript interfaces
  utils/          # Helper functions
```

## Important Constraints

### Storage
- **Use:** AsyncStorage for all local data
- **Never use:** localStorage, sessionStorage (browser APIs - don't exist in React Native)
- **Pattern:** Create repository classes that wrap AsyncStorage

### Navigation
- **Use:** React Navigation with Stack Navigator
- **Never use:** React Router, browser history API

### Styling
- **Use:** StyleSheet.create() with React Native styles
- **Never use:** CSS, Tailwind, className prop
- **Colors:** Use hex values or rgba()
- **Layout:** Use flexbox (React Native version)

### Performance
- Use FlatList for long lists (not map)
- Memoize expensive computations
- Avoid anonymous functions in render
- Use useCallback and useMemo appropriately

## iPad-Specific Requirements

### Keyboard Behavior
```typescript
import { Keyboard } from 'react-native';

// Dismiss keyboard when tapping outside

```

### Safe Areas
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Wrap screens to avoid notch/home indicator

```

### Orientation
```typescript
// Support both - test in simulator by rotating
// Hardware → Rotate Left/Right
```

## Development Workflow

### Testing
```bash
# Start development server
npm start

# Press 'i' to open iOS Simulator
# Or scan QR code with Expo Go on iPad
```

### File Creation
- All screens go in `src/screens/`
- All reusable components go in `src/components/`
- All types go in `src/types/`
- Export from index files for clean imports

### Example Component Structure
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  const [pressed, setPressed] = useState(false);
  
  return (
    
      {title}
      
        Press Me
      
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44, // iPad touch target
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Common Mistakes to Avoid

1. ❌ Using HTML elements (div, button, input)
2. ❌ Using CSS or Tailwind classes
3. ❌ Using onClick instead of onPress
4. ❌ Using localStorage/sessionStorage
5. ❌ Using React Router
6. ❌ Touch targets smaller than 44x44
7. ❌ Forgetting to handle keyboard dismissal
8. ❌ Not testing in both orientations

## Current Phase

**Phase 1:** Local iPad MVP
- Single-user only
- All data stored locally in AsyncStorage
- No backend/API integration yet
- No authentication yet

**Phase 2 (Future):** Will add cloud sync, web app, backend API
- Data models already include Phase 2 fields (don't use them yet)

## Success Criteria

Every component/screen must:
- ✅ Use React Native components only
- ✅ Use StyleSheet for styling
- ✅ Have TypeScript types for all props
- ✅ Support both portrait and landscape
- ✅ Have touch targets ≥ 44x44 pixels
- ✅ Handle keyboard properly
- ✅ Perform at 60fps
- ✅ Work offline

## Questions Before Generating Code?

If anything is unclear about:
- React Native vs React DOM differences
- iPad-specific requirements
- Storage patterns
- Navigation structure

**Ask before generating code.** Better to clarify than generate wrong patterns.