# Suggested CLAUDE.md Updates After UC-202

**Date:** October 30, 2025
**Purpose:** Document UC-202 patterns and update CLAUDE.md for future reference

---

## 📝 Updates to Apply

### 1. Update Header Section

**Current:**
```markdown
**Last Updated:** October 30, 2025 after UC-200 implementation
**Current Branch:** wave-1-fresh-start-uc200
```

**Change to:**
```markdown
**Last Updated:** October 30, 2025 after UC-202 implementation
**Current Branch:** feature/uc-202
```

---

### 2. Update "Patterns You Must Follow" Section

**Add new subsection after "Data Persistence":**

```markdown
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
```

**Update iPad Optimization section:**

**Current:**
```markdown
- ✅ Responsive grid: 3 columns (portrait) / 4 columns (landscape)
```

**Change to:**
```markdown
- ✅ Responsive grid: 2 columns (portrait) / 3 columns (landscape) for optimal preview size
```

---

### 3. Update "Project Structure" Section

**Add to components list:**
```markdown
│   ├── components/
│   │   ├── COINCard.tsx        # [UC-200, UC-202] Grid view card with star toggle
│   │   ├── COINListItem.tsx    # [UC-200, UC-202] List view row with star toggle
│   │   ├── EmptyRecentsState.tsx # [UC-200] Empty state pattern
│   │   ├── EmptyFavoritesState.tsx # [UC-202] Empty state for favorites
│   │   ├── FloatingActionButton.tsx # [UC-200] FAB pattern
│   │   ├── NavigationHeader.tsx # [UC-200] Screen header
│   │   ├── SortSelector.tsx    # [UC-200, UC-202] Sort dropdown (6 options)
│   │   └── ViewToggle.tsx      # [UC-200] Grid/List toggle
```

**Add to contexts section:**
```markdown
│   ├── contexts/
│   │   └── COINContext.tsx     # [UC-202] Shared state for coins, favorites, sort
```

**Update screens section:**
```markdown
│   ├── screens/
│   │   ├── FavoritesScreen.tsx # [UC-202] ✔️ Complete
│   │   ├── ProjectsScreen.tsx  # [UC-201] Placeholder
│   │   └── RecentsScreen.tsx   # [UC-200] ✔️ Complete
```

---

### 4. Update "Data Model" Section

**Add to COIN interface documentation:**

```markdown
interface COIN {
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
  isFavorite?: boolean;          // [UC-202] Favorite status

  // Canvas data
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}
```

---

### 5. Add UC-202 to "Implemented Use Cases" Section

**Add after UC-200 entry:**

```markdown
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
```

---

### 6. Update "Current UC Being Implemented" Section

**Replace entire section with:**

```markdown
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
```

---

### 7. Update "Files You Must NEVER Modify" Section

**Update the list:**

```markdown
**DO NOT TOUCH THESE FILES unless specification specifically instructs:**

```
src/types/index.ts          ← Core data models (only modify when spec says)
src/utils/mockData.ts       ← Test data (only add COINs/test data if spec says)
src/utils/dateFormatting.ts ← Date utilities (stable, don't touch)
src/utils/statusColors.ts   ← Status colors (stable, don't touch)
src/contexts/COINContext.tsx ← Shared state management (only modify when spec says)
App.tsx                     ← Tab navigation setup (stable)
```

**Add new note:**
```markdown
**⚠️ Special Note on COINContext:**
- COINContext is now the single source of truth for COIN data
- Modifications affect ALL tabs (Recents, Favorites, Projects)
- Only add to context when data truly needs to be shared
- Local screen state is still fine for view-specific preferences (view mode, etc.)
```
```

---

### 8. Add New Section: "Common Pitfalls to Avoid" Updates

**Add these new items:**

```markdown
### ❌ DON'T

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

8. **Use COINContext for shared data**
9. **Combine haptic + animation for rich feedback**
10. **Test with extremely long names to verify truncation**
11. **Prioritize preview visibility over metadata in cards**
```

---

### 9. Update "Design System" Section

**Add to Touch Targets:**

```markdown
### Touch Targets & Interactive Elements

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
```

---

### 10. Update "Testing Checklist" Section

**Add new items:**

```markdown
### State Management Testing
- [ ] Shared state updates immediately across all tabs
- [ ] No flicker when switching tabs
- [ ] AsyncStorage persistence works after app restart
- [ ] Context provides are correctly nested

### Haptic & Animation Testing
- [ ] Haptic feedback fires on interactive elements
- [ ] Animations complete smoothly (no jank)
- [ ] Native driver used for transform animations
- [ ] Works on physical iPad (not just simulator)

### Component Reuse Testing
- [ ] Optional handlers work (feature enabled/disabled correctly)
- [ ] Component works in all contexts it's used
- [ ] No duplicate components created when reuse was possible
```

---

### 11. Add to "Reference Materials" Section

**Add UC-202 session summary:**

```markdown
### Session Summaries to Read Before Coding

**Always read these before implementing new UC:**
- `sessions/UC-200-Session-Summary.md` - Recents tab, all reusable components
- `sessions/UC-202-Session-Summary.md` - Favorites tab, shared state patterns, haptics

**Read relevant summaries:**
- When working on Projects: Read UC-201 summary (when exists)
- When working on state management: Read UC-202 patterns
- When adding interactive feedback: Read UC-202 haptic patterns
```

---

### 12. Update "Success Metrics" Section

**Add to "You know you're doing well when:"**

```markdown
- ✅ Tab switching is instant with no flicker
- ✅ Haptic feedback feels natural and iOS-like
- ✅ Components reused instead of duplicated
- ✅ Shared state properly managed in Context
```

**Add to "You need to improve if:"**

```markdown
- ❌ Users report flicker when switching tabs
- ❌ Multiple components do the same thing
- ❌ Shared data loaded from AsyncStorage on every focus
- ❌ Alert confirmations interrupt flow for reversible actions
```

---

### 13. Update Footer

**Current:**
```markdown
**Last UC Completed:** UC-200 (Recents Tab) ✔️
**Next UC:** UC-202 (Favorites Tab) 🚧
**Updated:** October 30, 2025
```

**Change to:**
```markdown
**Last UC Completed:** UC-202 (Favorites Tab) ✔️
**Next UC:** UC-201 (Projects Tab) 🚧
**Updated:** October 30, 2025
```

---

## 📋 New Section to Add: "Context Management Guidelines"

**Add this entirely new section after "Data Model":**

```markdown
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

### Adding New Context Data

**Checklist before adding to context:**
1. Is this data shared across multiple tabs? → Add to context
2. Is this data tab-specific? → Keep in local state
3. Does this data need instant updates? → Add to context
4. Does this data only matter on mount? → Load in local useEffect

**Example: Adding a new shared preference**

```typescript
// 1. Add to context interface
interface COINContextType {
  // ... existing
  newPreference: string;
  setNewPreference: (value: string) => void;
}

// 2. Add state in provider
const [newPreference, setNewPreferenceState] = useState<string>('default');

// 3. Load from AsyncStorage on mount
useEffect(() => {
  loadNewPreference();
}, []);

// 4. Create setter that persists
const setNewPreference = async (value: string) => {
  setNewPreferenceState(value);
  await AsyncStorage.setItem(KEY, value);
};

// 5. Provide in context value
<COINContext.Provider value={{ ..., newPreference, setNewPreference }}>
```

---
```

---

## 🎯 Summary of Changes

### Sections to Update
1. ✅ Header (date, branch)
2. ✅ Patterns You Must Follow (add shared state, haptics, update responsive grid)
3. ✅ Project Structure (add EmptyFavoritesState, COINContext, update screens)
4. ✅ Data Model (add `isFavorite` field)
5. ✅ Implemented Use Cases (add complete UC-202 entry)
6. ✅ Current UC (change to UC-201)
7. ✅ Files You Must NEVER Modify (add COINContext)
8. ✅ Common Pitfalls (add new don'ts and dos)
9. ✅ Design System (add haptic feedback constants)
10. ✅ Testing Checklist (add state management, haptics sections)
11. ✅ Reference Materials (add UC-202 session summary)
12. ✅ Success Metrics (update indicators)
13. ✅ Footer (update last completed UC)

### New Sections to Add
1. ✅ Context Management Guidelines (entirely new)

---

## 📝 Implementation Note for Chuck

**How to apply these updates:**

1. Open `CLAUDE.md` in your editor
2. Find each section listed above
3. Apply the changes as shown
4. Review for consistency
5. Commit with message: `docs: Update CLAUDE.md after UC-202 completion`

**Alternatively:**
- Copy relevant sections from this document
- Paste into CLAUDE.md at appropriate locations
- Adjust formatting as needed

---

**End of Suggested CLAUDE.md Updates**

**Author:** Claude Code
**Date:** October 30, 2025
**For:** UC-202 Completion
