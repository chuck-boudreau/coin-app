# UC-201: View Projects (Projects Tab) - Session Summary

**Date:** October 31, 2025
**Status:** ✅ COMPLETE
**Implementation:** Full Projects Tab functionality with grid/list views, sorting, and drill-down to Project Detail screen

---

## Overview

UC-201 implemented the Projects tab with full functionality including project listing, sorting, view mode toggle, and project detail drill-down showing all COINs within a project. The implementation followed established patterns from UC-200 and UC-202, reusing components and maintaining consistency across the app.

---

## Files Modified

### Components
- `src/components/ProjectCard.tsx` - Enhanced with grid/list view modes
- `src/components/ProjectSortSelector.tsx` - Created for project-specific sorting
- `src/components/EmptyProjectListState.tsx` - Empty state for no projects
- `src/components/EmptyProjectDetailState.tsx` - Empty state for projects with no COINs
- `src/components/COINCard.tsx` - Fixed corner artifacts with `overflow: 'hidden'`
- `src/components/COINListItem.tsx` - Fixed corner artifacts with `overflow: 'hidden'`

### Screens
- `src/screens/ProjectsScreen.tsx` - Full implementation with sorting and view modes
- `src/screens/ProjectDetailScreen.tsx` - Complete drill-down screen showing project COINs
- `src/screens/RecentsScreen.tsx` - Header configuration moved to App.tsx
- `src/screens/FavoritesScreen.tsx` - Header configuration moved to App.tsx

### Navigation & Context
- `App.tsx` - Added ProjectsStack navigator, moved all header configurations, fixed title centering
- `src/contexts/COINContext.tsx` - Added projectSortOption state management

### Types
- `src/types/index.ts` - Added processState field to COIN interface

### Utilities
- `src/utils/mockData.ts` - Added processState field to mock COINs

---

## Key Features Implemented

### 1. Projects List View
- **Grid view** (default): 2 columns portrait / 3 columns landscape
- **List view**: Full-width project rows with metadata
- **Sorting**: Name (A-Z, Z-A), Status (A-Z, Z-A)
- **Responsive layout**: Adapts to orientation changes
- **Empty state**: When no projects exist

### 2. Project Detail Screen
- **Metadata bar**: Shows client/department, status badge, COIN count
- **Grid/List toggle**: Same pattern as Recents/Favorites
- **Sorting**: Reuses COIN sort options (Name, Status, Updated)
- **Empty state**: When project has no COINs with CTAs to add or create
- **COINs display**: Shows all COINs associated with the project

### 3. Group by Project Feature
- **"Group by Project" toggle**: Added to Recents and Favorites tabs
- **Section headers**: Project names become section headers
- **Smart sorting**: "No Project" always appears last
- **Sticky headers**: Sections stay visible while scrolling

### 4. Process State Support
- **"Future" badge**: Blue badge shown on future-state COINs
- **Data model**: Added `processState?: 'current' | 'future'` to COIN interface
- **Display logic**: Badge appears next to project name in metadata

---

## Navigation Structure

```
App.tsx (Tab Navigator)
├─ RecentsStack
│  └─ RecentsScreen
├─ FavoritesStack
│  └─ FavoritesScreen
└─ ProjectsStack
   ├─ ProjectsScreen (list of projects)
   └─ ProjectDetailScreen (COINs within a project)
```

---

## State Management

### Shared State (COINContext)
```typescript
// New state added for UC-201
projectSortOption: 'name-asc' | 'name-desc' | 'status-asc' | 'status-desc'
setProjectSortOption: (option: ProjectSortOption) => void

// Existing state reused
coins: COIN[]
sortOption: SortOption (for COIN sorting)
viewMode: 'grid' | 'list'
groupByProject: boolean
```

### Persistence
- Project sort preference saved to AsyncStorage: `@design_the_what:project_sort_option`
- View mode persists across tabs
- Group by Project toggle persists

---

## Technical Patterns Established

### 1. Separate Sort Components Pattern
- **COINs**: Use `SortSelector` (6 options: Name, Status, Created)
- **Projects**: Use `ProjectSortSelector` (4 options: Name, Status)
- **Rationale**: Projects don't have "Updated" field, need simpler sorting

### 2. iOS 26+ Resizable Window Support
```typescript
const { width } = useWindowDimensions();
const screenWidth = Dimensions.get('screen').width;

const isResizableWindow = Platform.OS === 'ios' &&
  parseInt(Platform.Version as string, 10) >= 26 &&
  width < screenWidth - 10;

// Apply dynamic padding only to screens with back buttons
headerLeftContainerStyle: {
  paddingLeft: isResizableWindow ? 60 : 0,
}
```

### 3. Static Header Configuration (Eliminates Flicker)
```typescript
// ✅ CORRECT: Configure headers in Stack.Screen options
<Stack.Screen
  name="ProjectsList"
  component={ProjectsScreen}
  options={{
    title: 'Projects',
    headerLeft: () => null,  // Centers title
    headerRight: () => (
      <TouchableOpacity onPress={handleCreate}>
        <Text>+</Text>
      </TouchableOpacity>
    ),
  }}
/>

// ❌ WRONG: Using useLayoutEffect (causes flicker)
// navigation.setOptions({ headerRight: ... })
```

### 4. Card Corner Artifact Fix
```typescript
// Problem: borderWidth + borderRadius + borderColor caused dark corner artifacts
// Solution: Remove borders, rely on shadows only + overflow: 'hidden'

card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  overflow: 'hidden',  // ← Key fix
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 3,
  // NO borderWidth or borderColor
}
```

---

## Design Decisions

### Visual Hierarchy (Final)
After multiple iterations, settled on:
- **Headers**: White (#FFFFFF)
- **Toolbars**: White (#FFFFFF)
- **Section headers**: Match body background (#E5E5EA)
- **Metadata bars**: White (#FFFFFF)
- **Body background**: #E5E5EA (original UC-200 color)
- **Cards**: White with 0.15 shadow opacity, no borders

### Why This Works
- Strong contrast between white surfaces and gray background
- Clear separation of UI layers
- Cards "float" above background
- Clean, iOS-native appearance
- No visual ambiguity

---

## Challenges & Solutions

### Challenge 1: Title Centering Issue
**Problem**: "Projects" title shifted right compared to "Recents" and "Favorites"

**Root Cause**: React Navigation automatically leaves space for back button on stack screens

**Solution**: Added `headerLeft: () => null` to all main tab screens
```typescript
// Forces title to center by removing back button space
headerLeft: () => null,
```

### Challenge 2: Screen Flicker on Tab Switch
**Problem**: Visible layout shift when switching tabs

**Root Cause**: `useLayoutEffect` in screens was adding header buttons after initial render:
1. Screen renders with default header (no button)
2. useLayoutEffect runs and adds button
3. Header layout shifts
4. User sees flicker

**Solution**: Moved ALL header configuration from screen components to Stack.Screen options in App.tsx
```typescript
// Headers fully configured before rendering
<Stack.Screen
  name="RecentsList"
  options={{
    headerRight: () => <Button />
  }}
/>
```

### Challenge 3: Back Button Obscured by Window Controls (iOS 26+)
**Problem**: On iPad with resizable windows, macOS-style window controls overlap back button

**Solution**: Dynamic padding based on window state
```typescript
const isResizableWindow = width < screenWidth - 10;

headerLeftContainerStyle: {
  paddingLeft: isResizableWindow ? 60 : 0,  // Only when not maximized
}
```

Applied only to ProjectDetail screen (which has back button), not to main tab screens.

### Challenge 4: Card Corner Artifacts
**Problem**: Dark gray pixels visible at rounded corners

**Root Cause**: iOS rendering quirk with `borderRadius` + `borderWidth` + semi-transparent `borderColor`

**Solution**:
1. Removed `borderWidth` and `borderColor` entirely
2. Added `overflow: 'hidden'` to clip content at rounded corners
3. Rely solely on shadows for card definition

### Challenge 5: Gray-on-Gray Visual Hierarchy Loss
**Problem**: Early attempts at colored headers (#F5F5F5, #FAFAFA) created flat, monochromatic appearance

**Solution**: Return to original UC-200 approach with strong contrast:
- White surfaces (headers, toolbars, section headers, cards)
- Gray background (#E5E5EA)
- Clear visual separation

---

## Component Reuse

### From UC-200 (Recents Tab)
✅ `COINCard` - Reused exactly as-is
✅ `COINListItem` - Reused exactly as-is
✅ `SortSelector` - Reused for COIN sorting
✅ `ViewToggle` - Reused for grid/list toggle
✅ `EmptyState pattern` - Followed for empty project states

### From UC-202 (Favorites Tab)
✅ `GroupToggle` - Added to Recents screen
✅ Section header pattern - Used for grouped views
✅ Sticky header behavior - Applied to project groups

### New Components Created
- `ProjectCard` - Grid and list view modes for projects
- `ProjectSortSelector` - Simplified sorting for projects (no "Updated" option)
- `EmptyProjectListState` - When no projects exist
- `EmptyProjectDetailState` - When project has no COINs

---

## Testing Completed

### Orientation Testing
✅ Portrait mode (2 columns)
✅ Landscape mode (3 columns)
✅ Rotation transitions smooth
✅ Touch targets remain 44x44px minimum

### Navigation Testing
✅ All three tabs work correctly
✅ Tab switching has no flicker
✅ Drill-down to Project Detail works
✅ Back button returns to Projects list
✅ Tab memory preserved (returns to last tab on restart)

### iOS 26+ Window Testing
✅ Maximized window: No extra padding
✅ Resized window: 60px padding on back button
✅ Window resize: Padding updates dynamically
✅ Title remains centered in all states

### Sort & Filter Testing
✅ Project sorting works (Name, Status, both directions)
✅ COIN sorting works within projects
✅ Group by Project works on Recents
✅ Group by Project works on Favorites
✅ Preferences persist across app restarts

### Visual Testing
✅ Card corners clean (no artifacts)
✅ Shadows visible on #E5E5EA background
✅ White surfaces clearly separated
✅ Status badges render correctly
✅ Process State "Future" badge displays properly

---

## Performance Notes

- Grid layout calculations optimized with `useMemo`
- Section grouping memoized to prevent recalculation
- FlatList used for efficient rendering of large lists
- `keyExtractor` ensures stable list items
- No performance regressions observed

---

## Code Quality

✅ No TypeScript errors
✅ No `any` types used
✅ Consistent with established patterns
✅ Proper React hooks usage
✅ Clean code (no commented-out code, no console.logs)
✅ All files properly formatted

---

## Known Limitations / Future Work

1. **Project Creation**: Not yet implemented (placeholder Alert shown)
2. **COIN Editor (UC-101)**: Tapping COINs shows placeholder Alert
3. **Add COINs to Project**: Empty state CTAs show placeholders
4. **Project Editing**: No edit functionality yet
5. **Project Deletion**: Not implemented
6. **Project Colors**: Color bar exists but colors not editable yet

---

## Integration with Other UCs

### UC-200 (Recents Tab)
- ✅ Added "Group by Project" toggle
- ✅ Section headers for project groups
- ✅ All existing functionality preserved

### UC-202 (Favorites Tab)
- ✅ "Group by Project" already existed
- ✅ All existing functionality preserved

### Future UCs
- **UC-101 (COIN Editor)**: Navigation ready, just needs screen implementation
- **UC-100 (Create COIN)**: Header buttons in place, needs modal implementation
- **UC-210 (Add COINs to Project)**: Navigation structure ready

---

## Lessons Learned

### What Worked Well
1. **Following established patterns** - Reusing UC-200/UC-202 components saved significant time
2. **Static header configuration** - Eliminated flicker issues immediately
3. **Component separation** - ProjectSortSelector vs SortSelector made sense
4. **Early testing** - Caught window control overlap issue quickly

### What Could Be Improved
1. **Color experimentation** - Wasted time on gray backgrounds that didn't work
2. **Border removal** - Should have tried this first for corner artifacts
3. **Specification clarity** - Some decisions made during implementation vs upfront

### Key Takeaways
1. **White surfaces + gray background = clear hierarchy** (the UC-200 formula works)
2. **Borders on rounded corners = artifacts** (shadows only is cleaner)
3. **Static config > Dynamic config** (for headers and navigation)
4. **Test iOS edge cases early** (resizable windows, orientation)

---

## Final File Count

**New Files:** 4
- `src/components/ProjectCard.tsx`
- `src/components/ProjectSortSelector.tsx`
- `src/components/EmptyProjectListState.tsx`
- `src/components/EmptyProjectDetailState.tsx`

**Modified Files:** 10
- `App.tsx`
- `src/contexts/COINContext.tsx`
- `src/types/index.ts`
- `src/utils/mockData.ts`
- `src/screens/ProjectsScreen.tsx`
- `src/screens/ProjectDetailScreen.tsx`
- `src/screens/RecentsScreen.tsx`
- `src/screens/FavoritesScreen.tsx`
- `src/components/COINCard.tsx`
- `src/components/COINListItem.tsx`

**Total Changes:** 14 files touched

---

## Success Criteria Met

✅ Projects list displays all non-archived projects
✅ Grid view (2/3 columns) and List view working
✅ Project sorting (Name, Status) working
✅ Project detail screen shows project metadata
✅ Project detail shows all COINs in project
✅ COIN sorting works within project detail
✅ Empty states provide clear CTAs
✅ Group by Project works on Recents/Favorites
✅ No regressions in UC-200 or UC-202
✅ Visual hierarchy clear and professional
✅ No screen flicker or rendering artifacts
✅ iOS 26+ window controls handled correctly
✅ All functionality works in both orientations

---

**UC-201 Complete** ✅
**Next UC:** UC-100 (Create COIN Modal) or UC-101 (COIN Editor Screen)
