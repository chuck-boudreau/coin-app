# CLAUDE.md - Persistent Context for Claude Code

**Last Updated:** October 31, 2025 after UC-100 implementation
**Project:** COIN App - Business Process Design Tool
**Platform:** React Native + Expo (Phase 1: iPad only)
**Current Branch:** main (UC-100 complete)

**⚠️ Prerequisites:** Read `CLAUDE_CODE_CONTEXT.md` first for React Native fundamentals

---

## 🎯 Project Mission

You are the AI developer for the COIN App. Chuck (Product Owner) provides specifications, you generate 100% of the implementation code, Chuck tests on iPad. This is a **zero-coding experiment** - no human writes code manually.

**Your role:**
- Read specifications carefully
- Generate complete, working React Native implementations
- Follow established patterns (never reinvent)
- Extend existing components rather than creating duplicates
- Ask questions when integration is unclear

### Before You Start: Specification Quality Check

**📋 Full Checklist:** See `process-docs/SPECIFICATION-QUALITY-CHECKLIST.md` for detailed guidance.

**Quick Check - Every specification should have:**

✅ **Essential Elements (Must Have):**
- Context setting (links to prior UC summaries, CLAUDE.md references)
- Component reuse instructions (explicit list of what to reuse)
- Step-by-step implementation guide
- Data model changes (if any, with TypeScript definitions)
- Filter/sort logic (exact conditions provided)
- Mock data strategy (what test data to create)
- Testing checklist (scenarios to verify)

✅ **Quality Enhancements (Should Have 70%+):**
- State management strategy (context vs local, persistence needs)
- Default behaviors (sort, view mode, initial values)
- User feedback patterns (haptics, animations, confirmations)
- Performance considerations (memoization, list optimization)
- Integration impact analysis (potential regressions)

**Target Spec Quality:** 8-9/10 range (leaves room for healthy refinement)

**If specification is missing key elements:**
- Ask targeted questions before starting implementation
- Reference checklist to identify gaps
- Don't guess - clarify with Chuck

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
├── App.tsx                      # [UC-100, UC-201] RootStack + Tab navigation
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── COINCard.tsx        # [UC-200, UC-202] Grid view card with star toggle
│   │   ├── COINListItem.tsx    # [UC-200, UC-202] List view row with star toggle
│   │   ├── COINEditorHeader.tsx # [UC-100] Canvas header with project display + name input
│   │   ├── COINEditorToolbar.tsx # [UC-100] Bottom toolbar with Save button
│   │   ├── EmptyRecentsState.tsx # [UC-200] Empty state pattern
│   │   ├── EmptyFavoritesState.tsx # [UC-202] Empty state for favorites
│   │   ├── FloatingActionButton.tsx # [UC-200] FAB pattern
│   │   ├── NavigationHeader.tsx # [UC-200] Screen header
│   │   ├── SortSelector.tsx    # [UC-200, UC-202] Sort dropdown (6 options)
│   │   └── ViewToggle.tsx      # [UC-200] Grid/List toggle
│   │
│   ├── contexts/
│   │   └── COINContext.tsx     # [UC-100, UC-202] Shared state for coins, favorites, sort
│   │
│   ├── screens/                 # Screen components
│   │   ├── COINEditorScreen.tsx # [UC-100] ✔️ Complete - Create/Edit COIN
│   │   ├── FavoritesScreen.tsx # [UC-202] ✔️ Complete
│   │   ├── ProjectDetailScreen.tsx # [UC-201] ✔️ Complete
│   │   ├── ProjectsScreen.tsx  # [UC-201] ✔️ Complete
│   │   └── RecentsScreen.tsx   # [UC-200] ✔️ Complete
│   │
│   ├── types/
│   │   └── index.ts            # [UC-100, UC-200, UC-202] Core data models (CRITICAL)
│   │
│   └── utils/
│       ├── dateFormatting.ts   # [UC-200] Relative time formatting
│       ├── mockData.ts         # [UC-200, UC-202] Test COINs
│       └── statusColors.ts     # [UC-200] Status badge colors
│
├── specifications/              # Before implementation (by Chuck)
│   ├── UC-100-Specification.md
│   ├── UC-200-Specification.md
│   └── UC-202-Specification.md
│
└── sessions/                    # After implementation (from Claude Code)
    ├── UC-100-Session-Summary.md
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

### UC-201: View Projects (Projects Tab) ✔️ COMPLETE

**Status:** Implemented and Accepted
**Date:** October 31, 2025
**Session Summary:** `sessions/UC-201-Session-Summary.md`

**Files Created:**
- 4 components (`ProjectCard`, `ProjectSortSelector`, `EmptyProjectListState`, `EmptyProjectDetailState`)

**Files Modified:**
- Navigation (`App.tsx` - added ProjectsStack, moved all header configs, fixed title centering)
- Context (`COINContext.tsx` - added projectSortOption state)
- Screens (`ProjectsScreen.tsx` full implementation, `ProjectDetailScreen.tsx` full implementation, `RecentsScreen.tsx`, `FavoritesScreen.tsx` - header cleanup)
- Components (`COINCard.tsx`, `COINListItem.tsx` - fixed corner artifacts)
- Types (`types/index.ts` - added processState field)
- Mock data (`mockData.ts` - added processState field)

**Patterns Established:**

1. **Separate Sort Components Pattern**
   - `ProjectSortSelector` for projects (4 options: Name, Status)
   - `SortSelector` for COINs (6 options: Name, Status, Updated)
   - Different entities need different sorting options
   - **FOLLOW THIS PATTERN** when entities have different sortable fields

2. **Static Header Configuration Pattern**
   - ALL header buttons configured in `Stack.Screen options` (not useLayoutEffect)
   - Eliminates screen flicker on tab switch
   - Headers fully configured before rendering
   - **MUST FOLLOW THIS** for all navigation screens
   ```typescript
   <Stack.Screen
     name="Screen"
     options={{
       headerLeft: () => null,  // Centers title on main tabs
       headerRight: () => <Button />  // Configured statically
     }}
   />
   ```

3. **iOS 26+ Resizable Window Support**
   - Dynamic back button padding for windowed mode
   - Only applies to screens WITH back buttons
   - Main tab screens use `headerLeft: () => null` for centering
   - **FOLLOW THIS PATTERN** for iOS iPad window control compatibility
   ```typescript
   const isResizableWindow = Platform.OS === 'ios' &&
     parseInt(Platform.Version, 10) >= 26 &&
     width < screenWidth - 10;

   headerLeftContainerStyle: {
     paddingLeft: isResizableWindow ? 60 : 0,
   }
   ```

4. **Card Corner Artifact Fix Pattern**
   - Remove `borderWidth` and `borderColor` from cards
   - Add `overflow: 'hidden'` to clip at rounded corners
   - Rely on shadows only for card definition
   - **APPLY THIS** to all cards with rounded corners
   ```typescript
   card: {
     backgroundColor: '#FFFFFF',
     borderRadius: 12,
     overflow: 'hidden',  // ← Critical for clean corners
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     // NO borderWidth or borderColor
   }
   ```

5. **Group by Project Pattern**
   - Added to Recents and Favorites tabs
   - Section headers with project names
   - "No Project" always appears last
   - Sticky headers for easy scanning
   - **REUSE THIS** for any grouped list views

6. **Project Detail Pattern**
   - Metadata bar showing project info
   - Drill-down from list to detail screen
   - Shows all COINs within project
   - Empty state with CTAs when no COINs
   - **FOLLOW THIS PATTERN** for other detail screens

**Integration Points:**

✅ **All three tabs complete:**
- Recents: View recent COINs, group by project
- Favorites: View favorited COINs, group by project
- Projects: View projects list, drill down to see project COINs

✅ **UC-100 (Create COIN) ready:**
- Header "+" buttons in place on all tabs
- Just needs modal implementation

✅ **UC-101 (COIN Editor) ready:**
- Card press handlers in place
- Navigation structure ready

**Critical Constraints:**

⚠️ **Header configuration:**
- MUST use static `Stack.Screen options` (not useLayoutEffect)
- Main tab screens MUST have `headerLeft: () => null` for centered titles
- Detail screens with back buttons need dynamic padding for iOS 26+

⚠️ **Card styling:**
- NO borders on cards (causes corner artifacts)
- MUST use `overflow: 'hidden'` with borderRadius
- Shadows provide card definition

⚠️ **Visual hierarchy:**
- Headers: White (#FFFFFF)
- Toolbars: White (#FFFFFF)
- Metadata bars: White (#FFFFFF)
- Section headers: Match body (#E5E5EA)
- Body background: #E5E5EA
- Cards: White with 0.15 shadow opacity

---

### UC-100: Create New COIN (COIN Editor Canvas) ✔️ COMPLETE

**Status:** Implemented and Accepted
**Date:** October 31, 2025
**Session Summary:** `sessions/UC-100-Session-Summary.md`

**Files Created:**
- 2 components (`COINEditorHeader`, `COINEditorToolbar`)
- 1 screen (`COINEditorScreen`)

**Files Modified:**
- Navigation (`App.tsx` - added RootStack wrapper, COINEditor modal, default project logic, iOS 26 padding)
- Context (`COINContext.tsx` - changed `createCOIN` to return ID for stay-in-editor workflow)
- Types (`types/index.ts` - added `projectId` and `sourceTab` to COINEditorParams)

**Patterns Established:**

1. **Document Editor Pattern (Not Form Modal)**
   - Back button navigation (not Cancel button)
   - Stay in editor after save (create → edit mode transition)
   - Follows Word, Notes, Pages, Google Docs conventions
   - **CRITICAL**: Document editors don't have Cancel buttons
   - Save button stays visible, always saves to existing COIN after first save
   ```typescript
   if (latestMode === 'create') {
     const newCoinId = await createCOIN(latestCoinName.trim(), latestProjectId);
     // Switch to edit mode and stay in editor
     setCurrentMode('edit');
     setCurrentCoinId(newCoinId);
     setHasUnsavedChanges(false);
   }
   ```

2. **Context-Aware Project Assignment Pattern**
   - Project assigned based on creation context, NOT user selection
   - Immutable at creation (no inline project picker/editor)
   - From ProjectDetail → auto-assigned to that project
   - From Recents/Favorites → uses default project logic
   - **CRITICAL**: Eliminates entire class of sync bugs
   ```typescript
   // Default project: "My COINs" or first active alphabetically
   const myCOINsProject = projects.find(p => p.name === 'My COINs' && p.status === 'active');
   const defaultProject = myCOINsProject || projects
     .filter(p => p.status === 'active')
     .sort((a, b) => a.name.localeCompare(b.name))[0];
   ```

3. **Project Display Read-Only Pattern**
   - Project shown for orientation (user needs to know context in modal)
   - Not editable inline (prevents sync bugs and cognitive friction)
   - Single source of truth: Name derived from `projects.find()` reference
   - Future UC for "Move COIN to Project" operation
   - **FOLLOW THIS**: Display project info, but no inline editing
   ```typescript
   <View style={styles.projectDisplay}>
     <Ionicons name="folder" size={20} color="#007AFF" />
     <Text style={styles.projectName}>{projectName}</Text>
   </View>
   ```

4. **State Closure Fix with Refs Pattern**
   - Event handlers capture state at listener setup time
   - Use refs + useEffect to always access latest values
   - **CRITICAL** for handlers in navigation listeners
   - **MUST USE** when `beforeRemove` or similar handlers access state
   ```typescript
   // Refs to hold latest values
   const coinNameRef = useRef(coinName);
   const currentProjectIdRef = useRef(currentProjectId);

   // Keep refs in sync
   useEffect(() => { coinNameRef.current = coinName; }, [coinName]);
   useEffect(() => { currentProjectIdRef.current = currentProjectId; }, [currentProjectId]);

   // Handler uses refs (always current)
   const handleSave = useCallback(async () => {
     const latestCoinName = coinNameRef.current;
     const latestProjectId = currentProjectIdRef.current;
     // ... save logic with latest values
   }, [coins, projects, createCOIN, updateCOIN]);
   ```

5. **Back Button with Unsaved Changes Pattern**
   - `beforeRemove` listener intercepts back navigation
   - Alert with 3 options: Keep Editing, Save, Discard
   - Save option calls `handleSave()` then navigates
   - Discard has haptic feedback for destructive action
   - **REUSE THIS** for any editor with unsaved changes
   ```typescript
   navigation.addListener('beforeRemove', (e) => {
     if (!hasUnsavedChanges) return;
     e.preventDefault();
     Alert.alert('Discard changes?', 'You have unsaved changes...', [
       { text: 'Keep Editing', style: 'cancel' },
       { text: 'Save', onPress: async () => {
         await handleSave();
         navigation.dispatch(e.data.action);
       }},
       { text: 'Discard', style: 'destructive', onPress: () => {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
         navigation.dispatch(e.data.action);
       }},
     ]);
   });
   ```

6. **Name Uniqueness Validation Pattern**
   - Enforce unique names within project scope
   - Professional tool expectation (single source of truth)
   - Prevents confusion when referencing COINs in meetings/docs
   - Helpful error messages suggest alternatives
   - **FOLLOW THIS**: Uniqueness appropriate for business process design tools
   ```typescript
   const duplicateExists = coins.some(
     c => c.projectIds[0] === latestProjectId &&
       c.name.toLowerCase() === latestCoinName.trim().toLowerCase() &&
       c.id !== latestCoinId
   );
   if (duplicateExists) {
     setValidationError(
       `A COIN with this name already exists in ${project?.name}. Please choose a unique name.`
     );
     return;
   }
   ```

7. **iOS 26+ Modal Window Controls Pattern**
   - Detect windowed vs maximized mode
   - Header needs padding to avoid window control buttons
   - Toolbar needs padding to avoid resize handle
   - **CRITICAL**: Different padding for header (top-left controls) vs toolbar (bottom-right handle)
   ```typescript
   const isResizableWindow = Platform.OS === 'ios' &&
     parseInt(Platform.Version as string, 10) >= 26;

   // Header: Avoid window controls (top-left)
   headerResizable: {
     paddingTop: 44,
   }

   // Toolbar: Avoid resize handle (bottom-right)
   toolbarResizable: {
     paddingRight: 36,
   }
   ```

8. **Source Tab Back Button Label Pattern**
   - Back button shows which tab opened the editor
   - Pass `sourceTab` param in navigation
   - Provides clear navigation context for users
   - **REUSE THIS** for any modal opened from multiple contexts
   ```typescript
   navigation.navigate('COINEditor', {
     mode: 'create',
     projectId: project.id,
     sourceTab: 'Project'  // Shows "< Project" back button
   });

   // In screen options:
   headerBackTitle: sourceTab,
   headerBackTitleVisible: true,
   ```

**Integration Points:**

✅ **COIN creation flow complete:**
- Recents/Favorites: Default project logic
- Project Detail: Context-aware assignment
- Editor: Create → Edit mode transition
- Navigation: Back button with unsaved changes handling

✅ **Ready for UC-101 (Edit existing COIN):**
- Editor already supports edit mode
- Just needs card press navigation hookup
- Same validation and save patterns apply

**Critical Constraints:**

⚠️ **Document Editor Pattern Requirements:**
- NO Cancel button (use Back button only)
- Save stays visible, doesn't close editor
- Create mode transitions to Edit mode after first save
- Unsaved changes warning on back navigation

⚠️ **Project Assignment Rules:**
- Context-aware assignment at creation ONLY
- No inline project picker/editor in canvas
- Project name derived by reference (single source of truth)
- Future "Move COIN" UC for reassignment

⚠️ **State Closure in Event Handlers:**
- MUST use refs for handlers in navigation listeners
- useEffect to keep refs in sync with state
- Access ref.current in handler (not state directly)
- Prevents stale state bugs in async callbacks

⚠️ **iOS 26 Modal Padding:**
- Header: `paddingTop: 44` for window controls
- Toolbar: `paddingRight: 36` for resize handle
- Apply only when `isResizableWindow` is true

**Design Decisions Made:**

1. **Name Uniqueness:** Enforced within project scope (professional tool standard)
2. **Project Context:** Read-only display for orientation, not inline editing
3. **Editor Pattern:** Document editor (Word/Notes) not form modal
4. **Stay in Editor:** Create mode transitions to Edit after save (user intent to edit)
5. **Default Project:** "My COINs" preferred, else alphabetically first active project

---

## 🚧 Current UC Being Implemented

### Next UC: To Be Determined

**Possible next UCs:**
- **UC-101**: Edit COIN - Hook up card press to open editor in edit mode
- **UC-102**: Delete COIN - Add delete action to card long-press menu
- **UC-210**: Move COIN to Project - Reassignment UI (now that inline editing removed)

COIN creation workflow is now complete. Next focus: Editing existing COINs and management operations.

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

### Specification Quality Reference

**Location:** `process-docs/SPECIFICATION-QUALITY-CHECKLIST.md`

**Use this to:**
- Assess if specification has all essential elements before starting
- Identify gaps and ask targeted questions
- Understand target quality range (8-9/10)
- Reference examples from UC-202 (what worked, what could improve)

**For Chuck:** This checklist helps when working with Claude Chat to create specifications. It ensures completeness and sets Claude Code up for success.

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

11. **Don't access state directly in navigation listeners**
    - ❌ `navigation.addListener('beforeRemove', () => { saveCOIN(coinName); })`
    - ✅ Use refs + useEffect pattern to access latest state (see UC-100 pattern #4)

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
12. **Use refs for state accessed in event handlers** (especially navigation listeners)

---

## 🎯 Design Decision Framework

**MANDATORY: All UX/UI design decisions MUST reference this research**

### Core Design Research Document

**Location:** `process-docs/Design-Research-IA-Patterns.md`

**CRITICAL:** This research document is the authoritative source for all information architecture, navigation patterns, and user experience decisions in the COIN app. It synthesizes:
- Business analyst work patterns and cognitive load research
- iOS Human Interface Guidelines and conventions
- Document management best practices
- Academic research on information architecture

**Before making ANY design decision, consult this document.**

### Key Principles from Research

**1. Browse-First, Search-Second (80-90% rule)**
- Users browse 80-90% of the time, search only 10-20%
- Prioritize visual recognition over recall
- Navigation must support visual scanning with strong information scent
- Search complements browsing, doesn't replace it

**2. Recents-First Home Screen**
- Default to Recents tab showing recently accessed COINs
- Supports episodic BA work patterns (return after gaps)
- Matches iOS Files app, iWork apps, GoodNotes patterns
- Provides immediate context for "what was I working on?"

**3. Shallow Hierarchy (1-3 levels maximum)**
- Projects → COINs (2 levels, that's it)
- NO deeper nesting (no Projects → Phases → COINs)
- Use faceted filtering instead of deep folders
- Flat structures beat deep hierarchies for speed and discoverability

**4. Three-Tab Navigation (Temporal, Organizational, Personal)**
- **Recents**: Chronological access (temporal mental model)
- **Projects**: Hierarchical organization (project-centric mental model)
- **Favorites**: User-curated access (personal mental model)
- Each tab is an independent entry point, maintains own state

**5. Universal iOS Patterns**
- Bottom tab bar (NEVER hamburger menu on iOS)
- Push transitions for hierarchy (right-to-left)
- Modal presentations for self-contained tasks (bottom-up)
- Swipe-right-from-left-edge to go back
- Pull-down to refresh

**6. Visual Organization**
- Large thumbnails for visual content recognition
- Grid view default (3 columns portrait, 4 landscape)
- List view toggle available (iOS Notes pattern)
- Color coding + status badges (never color alone)
- Card-based layout with 8pt corner radius

**7. Prominent Creation Action**
- "+" button for COIN creation available in ALL contexts
- Universal action (not context-limited)
- Follows Procreate/GoodNotes pattern
- Project selection built into creation flow (UC-100)

**8. Rich Metadata + Faceted Filtering**
- Essential metadata only (5-8 properties)
- Multi-select faceted filters (OR within facet, AND between facets)
- Show active filters as dismissible chips
- Display result counts for feedback

**9. Context Switching Minimization**
- Topic switching + depth switching = 40% productivity loss
- Design must minimize these transitions
- Each tab maintains independent state
- Don't force users to "home" between related actions

**10. Episodic Work Pattern Support**
- BAs work on projects episodically with gaps
- Strong visual cues for recognition (not recall)
- Status badges, color tags, thumbnails essential
- Recent items show "what was I doing?" instantly

### When to Consult Design Research

**MUST consult before:**
- ✅ Adding new navigation elements
- ✅ Creating new organizational structures
- ✅ Designing list/grid layouts
- ✅ Implementing search functionality
- ✅ Adding filters or sorting options
- ✅ Creating empty states
- ✅ Designing card layouts
- ✅ Planning multi-screen flows

**Ask yourself:**
1. What does the research say about this pattern?
2. What iOS convention applies here?
3. How does this support BA episodic work patterns?
4. Does this minimize or increase cognitive load?
5. Is this browse-first or search-first thinking?

### Design Review Checklist

Before declaring any UI/UX work complete:

- [ ] Consulted `Design-Research-IA-Patterns.md` for relevant patterns
- [ ] Follows iOS Human Interface Guidelines conventions
- [ ] Supports browse-first user behavior (80-90% use case)
- [ ] Maintains shallow hierarchy (1-3 levels max)
- [ ] Uses universal iOS patterns (tab bar, push, modal, swipe-back)
- [ ] Provides strong information scent (clear, descriptive labels)
- [ ] Includes visual recognition cues (thumbnails, colors, badges)
- [ ] Minimizes context switching and cognitive load
- [ ] Touch targets meet 44x44px minimum
- [ ] Works in both portrait and landscape orientations

### Phase Alignment

**Current Phase: Phase 1 MVP (Essential)**

From research document priorities:
- ✅ Bottom tab navigation: Recents, Projects, Favorites
- ✅ Recents tab with card thumbnails
- ✅ Projects tab with colored cards
- ✅ Drill-down: Project → COINs grid
- ✅ Essential metadata (name, status, dates, color)
- ⏳ Basic search (defer advanced features)
- ✅ Create COIN (+ button on all tabs - UC-100)
- ✅ Create Project
- ✅ Grid view (list view Phase 2)
- ⏳ Status filtering (Active/Archived toggle)

**Defer to Phase 2:**
- Full faceted filtering (status, client, date range, owner, tags)
- List view toggle
- Manual sorting in Favorites
- Advanced search (content search, not just names)
- Smart collections
- Export features

**Defer to Phase 3:**
- Collaboration features
- AI suggestions
- Portfolio analytics

### Anti-Patterns to Absolutely Avoid

From research (these are proven failures):

❌ **Hamburger menu** for primary navigation
❌ **Deep hierarchies** beyond 3 levels
❌ **Generic labels** ("More", "Stuff", "Miscellaneous")
❌ **Auto-switching tabs** programmatically
❌ **Custom back gestures** that conflict with iOS swipe-from-left
❌ **Hidden search** (must be discoverable)
❌ **Color-only indicators** (always pair with icon/text)
❌ **Context buried below fold** (critical info must be visible)
❌ **Home tab** that duplicates other functionality

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

**Last UC Completed:** UC-100 (Create New COIN) ✔️
**Next UC:** To Be Determined (UC-101 Edit COIN, UC-102 Delete COIN, or UC-210 Move COIN)
**Updated:** October 31, 2025
