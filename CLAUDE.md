# CLAUDE.md - Persistent Context for Claude Code

**Last Updated:** October 30, 2025 after UC-202 implementation
**Project:** COIN App - Business Process Design Tool
**Platform:** React Native + Expo (Phase 1: iPad only)
**Current Branch:** feature/uc-202

---

## 🎯 Project Mission

You are the AI developer for the COIN App. Chuck (Product Owner) provides specifications, you generate 100% of the implementation code, Chuck tests on iPad. This is a **zero-coding experiment** - no human writes code manually.

**Your role:**
- Read specifications carefully
- Generate complete, working React Native implementations
- Follow established patterns (never reinvent)
- Extend existing components rather than creating duplicates
- Ask questions when integration is unclear

---

## 📋 Critical Rules (READ FIRST)

### Files You Must NEVER Modify (unless spec explicitly says so)

**DO NOT TOUCH THESE FILES unless specification specifically instructs:**

```
src/types/index.ts          ← Core data models (only modify when spec says)
src/utils/mockData.ts       ← Test data (only add COINs/test data if spec says)
src/utils/dateFormatting.ts ← Date utilities (stable, don't touch)
src/utils/statusColors.ts   ← Status colors (stable, don't touch)
src/contexts/COINContext.tsx ← Shared state management (only modify when spec says)
App.tsx                     ← Tab navigation setup (stable)
```

**Why:** These files contain working patterns that other UCs depend on. Breaking them causes cascading failures.

**⚠️ Special Note on COINContext:**
- COINContext is now the single source of truth for COIN data
- Modifications affect ALL tabs (Recents, Favorites, Projects)
- Only add to context when data truly needs to be shared
- Local screen state is still fine for view-specific preferences (view mode, etc.)

---

### Patterns You Must Follow

#### **TypeScript**
- ✅ Strict types, no `any` unless absolutely unavoidable
- ✅ Define interfaces in `src/types/index.ts`
- ✅ Export interfaces, not inline types
- ✅ Use `interface` not `type` for object shapes

#### **React Native**
- ✅ Use `Pressable` (not `TouchableOpacity`)
- ✅ Use proper hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- ✅ Use `FlatList` for lists (not `ScrollView` with `map`)
- ✅ Use `RefreshControl` for pull-to-refresh
- ✅ Performance: `useMemo` for expensive computations, `useCallback` for handlers

#### **Data Persistence**
- ✅ Always use AsyncStorage (never hardcode data)
- ✅ Key prefix: `@design_the_what:*` (e.g., `@design_the_what:last_tab`)
- ✅ Store/load on component mount/unmount
- ✅ Handle errors gracefully (try/catch)

#### **Shared State Management**
- ✅ Use Context for data shared across multiple tabs (favorites, sort preferences)
- ✅ Keep in-memory state synchronized, AsyncStorage for persistence only
- ✅ Avoid `useFocusEffect` + AsyncStorage reads for shared state (causes flicker)
- ✅ Pattern: Update in-memory first, persist to AsyncStorage in background
- ✅ Load from AsyncStorage only on app startup

#### **User Feedback for Interactive Elements**
- ✅ Use haptic feedback for state toggles (favorites, selections)
- ✅ Combine haptic + animation for rich tactile experience
- ✅ Skip Alert confirmations for reversible actions (e.g., favoriting)
- ✅ Use `expo-haptics` with `ImpactFeedbackStyle.Light` for subtle feedback
- ✅ Animation pattern: Scale down (0.85) → Spring back (1.0) with physics

#### **iPad Optimization**
- ✅ Touch targets: 44x44px minimum
- ✅ Support portrait AND landscape orientations
- ✅ Responsive grid: 2 columns (portrait) / 3 columns (landscape) for optimal preview size
- ✅ Test with `Dimensions.get('window')` and orientation detection
- ✅ Safe area handling with `SafeAreaView`

#### **Design System**
- ✅ Follow iOS Human Interface Guidelines
- ✅ Use established colors (see "Design System" section below)
- ✅ Consistent spacing: 8px base unit, 16px padding, 24px section spacing
- ✅ Typography: Headline 17pt semibold, Body 17pt regular, Caption 13pt regular

---

### Integration Requirements

**Before creating ANY component:**
1. Check if similar component already exists
2. Reuse existing components when possible
3. Extend patterns rather than creating new ones
4. Ask Chuck before replacing customized files

**When specification says "implement sorting":**
- Use existing `SortSelector` component pattern
- Don't create a new sort UI from scratch

**When specification says "show COINs":**
- Use existing `COINCard` or `COINListItem` components
- Don't create new card components

---

## 📁 Current Project Structure

```
coin-app/
├── App.tsx                      # [UC-200] Tab navigation setup
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── COINCard.tsx        # [UC-200, UC-202] Grid view card with star toggle
│   │   ├── COINListItem.tsx    # [UC-200, UC-202] List view row with star toggle
│   │   ├── EmptyRecentsState.tsx # [UC-200] Empty state pattern
│   │   ├── EmptyFavoritesState.tsx # [UC-202] Empty state for favorites
│   │   ├── FloatingActionButton.tsx # [UC-200] FAB pattern
│   │   ├── NavigationHeader.tsx # [UC-200] Screen header
│   │   ├── SortSelector.tsx    # [UC-200, UC-202] Sort dropdown (6 options)
│   │   └── ViewToggle.tsx      # [UC-200] Grid/List toggle
│   │
│   ├── contexts/
│   │   └── COINContext.tsx     # [UC-202] Shared state for coins, favorites, sort
│   │
│   ├── screens/                 # Screen components
│   │   ├── FavoritesScreen.tsx # [UC-202] ✔️ Complete
│   │   ├── ProjectsScreen.tsx  # [UC-201] Placeholder
│   │   └── RecentsScreen.tsx   # [UC-200] ✔️ Complete
│   │
│   ├── types/
│   │   └── index.ts            # [UC-200, UC-202] Core data models (CRITICAL)
│   │
│   └── utils/
│       ├── dateFormatting.ts   # [UC-200] Relative time formatting
│       ├── mockData.ts         # [UC-200, UC-202] Test COINs
│       └── statusColors.ts     # [UC-200] Status badge colors
│
├── specifications/              # Before implementation (by Chuck)
│   ├── UC-200-Specification.md
│   └── UC-202-Specification.md
│
└── sessions/                    # After implementation (from Claude Code)
    ├── UC-200-Session-Summary.md
    └── UC-202-Session-Summary.md
```

---

## 🗂️ Data Model (CRITICAL - READ BEFORE CODING)

### Core COIN Interface

```typescript
// From src/types/index.ts (UC-200, UC-202)
interface COIN {
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
  isFavorite?: boolean;         // [UC-202] Favorite status

  // Canvas data (minimal for Phase 1)
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}

// Supporting interfaces also in src/types/index.ts:
- Circle
- Participant
- Interaction
- AccessHistoryEntry
- AccessHistory
- COINCardProps
- EmptyRecentsStateProps
```

### Archival Rules

**Critical for all views:**
- ✅ Archived COINs: Hidden by default from all views
- ✅ Archived COINs: Automatically unfavorited when archived
- ✅ Filter toggle "Show Archived" to make visible (future UC)
- ✅ Independent archival: COIN status vs Project status are separate

**Implementation:**
```typescript
// When displaying COINs, filter out archived by default
const visibleCOINs = allCOINs.filter(coin =>
  coin.status !== 'archived'  // Hide archived unless "Show Archived" enabled
);

// When archiving a COIN, remove from favorites
function archiveCOIN(coinId: string) {
  const coin = getCOIN(coinId);
  coin.status = 'archived';
  coin.isFavorite = false;  // Auto-unfavorite
  saveCOIN(coin);
}
```

---

## 🔄 Context Management Guidelines (UC-202 Established)

### When to Use COINContext

**DO use COINContext for:**
- ✅ COIN data (single source of truth)
- ✅ Favorite status (syncs across tabs)
- ✅ Sort preferences (shared across Recents/Favorites)
- ✅ Any data that multiple tabs need to read/write

**DON'T use COINContext for:**
- ❌ View mode (per-tab preference, use local state)
- ❌ Temporary UI state (loading, refreshing, etc.)
- ❌ Screen-specific state (scroll position, expanded sections)

### Context Update Pattern

```typescript
// ✅ CORRECT: Update in-memory first, persist in background
const setSortOption = async (option: SortOption) => {
  setSortOptionState(option);  // Instant UI update
  try {
    await AsyncStorage.setItem(KEY, option);  // Background persist
  } catch (error) {
    console.log('Error persisting:', error);
  }
};

// ❌ WRONG: Async read on every focus (causes flicker)
useFocusEffect(() => {
  const loadSort = async () => {
    const saved = await AsyncStorage.getItem(KEY);
    setSortOption(saved);  // Flicker!
  };
  loadSort();
});
```

### Context Loading Pattern

```typescript
// ✅ CORRECT: Load once on app startup
useEffect(() => {
  loadInitialData();  // Loads from AsyncStorage once
}, []);

// Context provides data immediately to all screens
const { sortOption, setSortOption } = useCOINs();
```

---

## ✅ Implemented Use Cases

### UC-200: View Recent COINs (Recents Tab) ✔️ COMPLETE

**Status:** Implemented and Accepted
**Date:** October 30, 2025
**Session Summary:** `sessions/UC-200-Session-Summary.md`

**Files Created:**
- 7 components (`COINCard`, `COINListItem`, `SortSelector`, `ViewToggle`, etc.)
- 3 screens (`RecentsScreen`, `ProjectsScreen` placeholder, `FavoritesScreen` placeholder)
- 3 utilities (`mockData`, `dateFormatting`, `statusColors`)
- 1 type definition file (`types/index.ts`)

**Patterns Established:**

1. **COIN Card Display Pattern**
   - `COINCard` component for grid view
   - `COINListItem` component for list view
   - Both accept same `COIN` data, different presentations
   - **REUSE THESE** in Projects and Favorites tabs

2. **Grid/List View Toggle Pattern**
   - `ViewToggle` component with grid/list icons
   - Persists preference in AsyncStorage
   - Key: `@design_the_what:view_mode`
   - **REUSE THIS** in other list screens

3. **Sort Dropdown Pattern**
   - `SortSelector` component with 6 options
   - Shows active option with checkmark
   - Persists selection in AsyncStorage
   - Key: `@design_the_what:sort_option`
   - **REUSE THIS** in other sortable lists

4. **Empty State Pattern**
   - `EmptyRecentsState` component with icon + message + CTAs
   - Context-aware: Different messages for "no COINs" vs "no recent COINs"
   - **FOLLOW THIS PATTERN** for Favorites/Projects empty states

5. **Responsive Grid Layout**
   - 2 columns in portrait, 3 columns in landscape
   - Calculates card width: `(screenWidth - (padding * 2) - (gap * (cols - 1))) / cols`
   - Uses `height > width` for orientation detection
   - **FOLLOW THIS PATTERN** for any grid layouts

6. **AsyncStorage Persistence**
   - Key prefix: `@design_the_what:*`
   - Three keys used: `last_tab`, `sort_option`, `view_mode`
   - Load on mount, save on change
   - **FOLLOW THIS PATTERN** for all persistence

**Critical Constraints (DO NOT BREAK):**

⚠️ **Tab bar specifications:**
- Height: 65px
- Translucent: rgba(255,255,255,0.92)
- Active color: #007AFF
- FAB positioning depends on this: `bottom: 81px` (65 + 16 padding)

⚠️ **Grid calculation constants:**
- Padding: 16px
- Gap: 16px
- Portrait: 2 columns
- Landscape: 3 columns

⚠️ **Touch target minimum:**
- All interactive elements: 44x44px minimum

⚠️ **Type definitions:**
- All in `src/types/index.ts`
- Don't create duplicate interfaces elsewhere

---

### UC-202: View Favorites (Favorites Tab) ✔️ COMPLETE

**Status:** Implemented and Accepted
**Date:** October 30, 2025
**Session Summary:** `sessions/UC-202-Session-Summary.md`

**Files Created:**
- 1 component (`EmptyFavoritesState`)
- 1 context (`COINContext` - created for shared state management)

**Files Modified:**
- 2 components (`COINCard`, `COINListItem` - added star toggle with haptic feedback)
- 2 screens (`FavoritesScreen` full implementation, `RecentsScreen` added star support)
- 1 type file (`types/index.ts` - added `isFavorite` field)
- 1 mock data file (`mockData.ts` - added favorite flags and long test names)

**Patterns Established:**

1. **Shared State via Context Pattern**
   - `COINContext` manages shared state (coins, favorites, sort preferences)
   - Updates propagate instantly to all tabs (no flicker)
   - AsyncStorage persists for app restarts only
   - **REUSE THIS** for any data shared across tabs
   ```typescript
   // In Context
   const [sortOption, setSortOption] = useState<SortOption>('created-newest');

   // In Screens
   const { sortOption, setSortOption } = useCOINs();
   ```

2. **Haptic Feedback + Animation Pattern**
   - Light haptic feedback (`Haptics.ImpactFeedbackStyle.Light`)
   - Scale animation: squeeze (0.85) → bounce back (1.0)
   - No Alert confirmations for reversible actions
   - **REUSE THIS** for interactive toggles (likes, bookmarks, selections)
   ```typescript
   const handlePress = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     Animated.sequence([
       Animated.spring(scaleAnim, { toValue: 0.85, ... }),
       Animated.spring(scaleAnim, { toValue: 1, friction: 3, ... })
     ]).start();
     toggleState();
   };
   ```

3. **Optional Handler Pattern for Component Flexibility**
   - Components accept optional handlers to enable/disable features
   - Same component works in different contexts
   - **FOLLOW THIS PATTERN** for reusable components
   ```typescript
   interface Props {
     onToggleFavorite?: (id: string) => void;  // Optional!
   }

   {onToggleFavorite && (
     <Pressable onPress={() => onToggleFavorite(id)}>
       {/* Feature UI */}
     </Pressable>
   )}
   ```

4. **Card Title Below Preview Pattern**
   - Title moved from overlay to below preview area
   - Maximizes preview visibility for diagram recognition
   - 2-line truncation with ellipsis for long names
   - **FOLLOW THIS PATTERN** for any card with visual preview

5. **Simplified Responsive Layout**
   - Portrait: 2 columns max
   - Landscape: 3 columns max
   - Prioritizes preview size over quantity
   - **FOLLOW THIS PATTERN** for optimal preview recognition
   ```typescript
   const isLandscape = width > height;
   const maxColumns = isLandscape ? 3 : 2;
   const cardWidth = (availableWidth - totalGaps) / maxColumns;
   ```

**Integration Points for Future UCs:**

✅ **UC-201 (Projects Tab) can reuse:**
- All UC-200 components (exactly as-is)
- Star toggle pattern if projects support favorites
- Shared COINContext for state management
- Same 2/3 column responsive layout
- Same sort/view persistence patterns

✅ **UC-101 (COIN Editor) integration ready:**
- `handleCardPress` calls already in place
- COIN data available via COINContext
- Navigation hooks ready

**Critical Constraints (DO NOT BREAK):**

⚠️ **COINContext is source of truth for:**
- All COIN data (`coins` array)
- Favorite status (`toggleFavorite` function)
- Sort preference (`sortOption` state)
- Any future shared state

⚠️ **Card layout specifications:**
- Title: 2 lines max with ellipsis (`numberOfLines={2}`)
- Preview: Full square above metadata
- Star button: 44x44px touch target, top-left
- Status badge: Top-right

⚠️ **Sort synchronization:**
- MUST use shared `sortOption` from COINContext
- DO NOT load from AsyncStorage on tab focus (causes flicker)
- Context handles persistence automatically

**Dependencies Added:**
```json
{
  "expo-haptics": "~13.0.0"  // For tactile feedback
}
```

---

## 🚧 Current UC Being Implemented

### UC-201: View Projects (Projects Tab) ← NEXT

**Specification:** `specifications/UC-201-Specification.md` (to be created by Chuck)

**What this UC needs to do:**
- Implement `ProjectsScreen.tsx` (currently placeholder)
- Display COINs grouped by project
- Project-level actions (view all COINs in project, project metadata)
- Potentially allow favoriting entire projects

**Integration Requirements:**

✅ **REUSE these components (DO NOT recreate):**
- `COINCard` - Already has star toggle, use as-is
- `COINListItem` - Already has star toggle, use as-is
- `SortSelector` - Use exactly as-is (6 sort options)
- `ViewToggle` - Use exactly as-is
- `EmptyRecentsState` - Follow pattern for empty project state

✅ **REUSE this context:**
- `COINContext` - For shared state management
- Use `coins` array, filter by `projectId`
- Use `sortOption` for shared sort preference
- Use `toggleFavorite` if projects support favorites

✅ **DO NOT MODIFY these files:**
- `src/utils/mockData.ts` - Unless spec says to add projects
- `src/utils/dateFormatting.ts` - Not needed
- `src/utils/statusColors.ts` - Not needed
- `RecentsScreen.tsx` - Must continue to work
- `FavoritesScreen.tsx` - Must continue to work

✅ **FOLLOW these patterns:**
- Same responsive grid (2 cols portrait / 3 cols landscape)
- Same AsyncStorage pattern for view mode persistence (per-tab key)
- Shared sort option from COINContext (no local state)
- Same empty state pattern (icon + message + CTAs)

**New patterns UC-201 may establish:**
- Project grouping/hierarchy display
- Expandable sections for projects
- Project-level metadata display

---

## 🎨 Design System

### Colors (iOS Standard)

```typescript
// Use these exact values
const Colors = {
  primary: '#007AFF',      // iOS blue (buttons, links, active states)
  success: '#34C759',      // iOS green (approved status)
  warning: '#FF9500',      // iOS orange (review status)
  danger: '#FF3B30',       // iOS red (delete, archive)

  // Status badges (from statusColors.ts)
  draft: '#007AFF',        // Blue
  review: '#FF9500',       // Orange
  approved: '#34C759',     // Green
  archived: '#8E8E93',     // Gray

  // Backgrounds
  background: '#E5E5EA',   // Darker than default iOS gray (UC-200 enhancement)
  card: '#FFFFFF',         // White cards
  tabBar: 'rgba(255,255,255,0.92)',  // Translucent tab bar

  // Text
  text: '#000000',         // Primary text
  textSecondary: '#666666', // Secondary text, inactive icons
  textTertiary: '#999999', // Tertiary text
};
```

### Typography

```typescript
const Typography = {
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,  // semibold
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,  // regular
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600' as const,  // iPad-optimized (UC-200)
  },
};
```

### Spacing

```typescript
const Spacing = {
  unit: 8,        // Base unit
  xs: 4,          // 0.5 units
  sm: 8,          // 1 unit
  md: 16,         // 2 units (card padding, grid gap)
  lg: 24,         // 3 units (section spacing)
  xl: 32,         // 4 units

  // Specific use cases (UC-200 established)
  cardPadding: 16,
  gridGap: 16,
  tabBarHeight: 65,
  fabBottom: 81,  // tabBarHeight + md
  touchTarget: 44,
};
```

### Touch Targets & Interactive Elements (UC-202)

```typescript
const TouchTargets = {
  minimum: 44,        // iOS minimum for all interactive elements
  starButton: 44,     // Star toggle (UC-202)
  fabButton: 60,      // Floating action button
  listRow: 60,        // Minimum row height for list items
};

// Haptic Feedback (UC-202)
import * as Haptics from 'expo-haptics';

// Light feedback for toggles
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium feedback for selections
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy feedback for important actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
```

### Shadows & Borders (UC-200 established)

```typescript
const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,  // Android
  },
};

const Border = {
  card: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,  // iOS standard for cards
  },
};
```

---

## 🧪 Testing Checklist

**Before saying "implementation complete", verify ALL of these:**

### Orientation Testing
- [ ] Tested in portrait orientation (2 column grid if applicable)
- [ ] Tested in landscape orientation (3 column grid if applicable)
- [ ] Layout doesn't break when rotating
- [ ] Touch targets remain 44x44px minimum in both orientations

### Functionality Testing
- [ ] All use case scenarios work (main + alternates)
- [ ] Sorting works (if applicable)
- [ ] View toggle works (if applicable)
- [ ] Empty state shows correctly
- [ ] Pull-to-refresh works (if applicable)

### Data Persistence Testing
- [ ] Data persists across app restarts
- [ ] AsyncStorage keys use `@design_the_what:*` prefix
- [ ] Preferences save immediately on change
- [ ] Preferences load correctly on mount

### State Management Testing
- [ ] Shared state updates immediately across all tabs
- [ ] No flicker when switching tabs
- [ ] AsyncStorage persistence works after app restart
- [ ] Context providers are correctly nested

### Haptic & Animation Testing
- [ ] Haptic feedback fires on interactive elements
- [ ] Animations complete smoothly (no jank)
- [ ] Native driver used for transform animations
- [ ] Works on physical iPad (not just simulator)

### Integration Testing
- [ ] Previous UC features still work (no regression)
- [ ] Reused components work correctly
- [ ] Tab navigation works
- [ ] FAB doesn't overlap tab bar

### Component Reuse Testing
- [ ] Optional handlers work (feature enabled/disabled correctly)
- [ ] Component works in all contexts it's used
- [ ] No duplicate components created when reuse was possible

### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types used (unless absolutely necessary)
- [ ] Proper use of React Native APIs (no web APIs)
- [ ] Performance optimized (useMemo, useCallback, FlatList)
- [ ] Clean code (no commented-out code, no console.logs)

### Design Compliance
- [ ] Follows iOS Human Interface Guidelines
- [ ] Uses correct colors from design system
- [ ] Consistent spacing (8px base unit)
- [ ] Touch targets minimum 44x44px
- [ ] Text is readable (proper contrast)

---

## 📚 Reference Materials

### Session Summaries to Read Before Coding

**Always read these before implementing new UC:**
- `sessions/UC-200-Session-Summary.md` - Recents tab, all reusable components
- `sessions/UC-202-Session-Summary.md` - Favorites tab, shared state patterns, haptics

**Read relevant summaries:**
- When working on Projects: Read UC-201 summary (when exists)
- When working on state management: Read UC-202 patterns
- When adding interactive feedback: Read UC-202 haptic patterns

### Specifications Chuck Creates

**Location:** `specifications/UC-XXX-Specification.md`

**What Chuck provides:**
- Complete requirements for the UC
- Integration notes (what to reuse, what not to touch)
- Step-by-step implementation guide
- Testing checklist
- Acceptance criteria

**Your job:** Follow the specification exactly, ask questions when unclear.

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T

1. **Don't hardcode data**
   - ❌ `const coins = [...]` directly in component
   - ✅ Use `mockData.ts` or AsyncStorage

2. **Don't use `any` type**
   - ❌ `const handlePress = (data: any) => ...`
   - ✅ `const handlePress = (data: COIN) => ...`

3. **Don't create duplicate components**
   - ❌ Create new `FavoriteCOINCard` when `COINCard` exists
   - ✅ Reuse `COINCard` with additional props if needed

4. **Don't modify core files without spec**
   - ❌ Change `src/types/index.ts` on your own
   - ✅ Only modify when spec explicitly says to

5. **Don't use web APIs**
   - ❌ `localStorage`, `document`, `window.innerWidth`
   - ✅ `AsyncStorage`, React Native APIs, `Dimensions.get('window')`

6. **Don't break established patterns**
   - ❌ Create new AsyncStorage key format
   - ✅ Use `@design_the_what:*` prefix

7. **Don't skip testing checklist**
   - ❌ Say "done" without testing both orientations
   - ✅ Complete full testing checklist before declaring done

8. **Don't load shared state on focus**
   - ❌ `useFocusEffect(() => loadSortFromAsyncStorage())`
   - ✅ Use shared state from COINContext (instant, no flicker)

9. **Don't use Alert for reversible actions**
   - ❌ `Alert.alert('', 'Added to Favorites')`
   - ✅ Use haptic + animation + visual feedback (star icon change)

10. **Don't create local sort state when shared**
    - ❌ `const [sortOption, setSortOption] = useState(...)`
    - ✅ `const { sortOption, setSortOption } = useCOINs()`

### ✅ DO

1. **Read session summaries first**
2. **Reuse existing components**
3. **Follow established patterns**
4. **Ask questions when unclear**
5. **Test thoroughly before declaring complete**
6. **Use proper TypeScript types**
7. **Performance optimize with useMemo/useCallback**
8. **Use COINContext for shared data**
9. **Combine haptic + animation for rich feedback**
10. **Test with extremely long names to verify truncation**
11. **Prioritize preview visibility over metadata in cards**

---

## 🔄 When This File Gets Updated

**Update CLAUDE.md after each UC acceptance:**

1. **Add to "Implemented Use Cases" section:**
   - UC number, name, status, date
   - Files created
   - Patterns established
   - Integration points

2. **Update "Current UC Being Implemented":**
   - Move to next UC
   - Add integration requirements for that UC

3. **Update "Files You Must NEVER Modify":**
   - Add any new critical files

4. **Update "Project Structure":**
   - Add new files/directories

5. **Commit with UC implementation:**
   ```bash
   git add CLAUDE.md
   git commit --amend  # Add to UC commit
   ```

**DON'T update for:**
- Minor bug fixes
- Documentation-only changes
- Refactoring that doesn't change patterns

---

## 🎯 Success Metrics

**You know you're doing well when:**
- ✅ Chuck says "Perfect, approved!"
- ✅ All tests pass on first try
- ✅ No regression in previous UCs
- ✅ Code follows all established patterns
- ✅ No questions from Chuck about "why did you change X?"
- ✅ Tab switching is instant with no flicker
- ✅ Haptic feedback feels natural and iOS-like
- ✅ Components reused instead of duplicated
- ✅ Shared state properly managed in Context

**You need to improve if:**
- ❌ Chuck says "This broke UC-200"
- ❌ Multiple iterations needed for same UC
- ❌ TypeScript errors in generated code
- ❌ Hardcoded data instead of using proper storage
- ❌ Users report flicker when switching tabs
- ❌ Multiple components do the same thing
- ❌ Shared data loaded from AsyncStorage on every focus
- ❌ Alert confirmations interrupt flow for reversible actions

---

**This file is your persistent memory. Read it every time before coding.**

**Last UC Completed:** UC-202 (Favorites Tab) ✔️
**Next UC:** UC-201 (Projects Tab) 🚧
**Updated:** October 30, 2025
