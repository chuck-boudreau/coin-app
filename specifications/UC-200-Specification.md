# UC-200 Specification: View Recent COINs
**For Claude Code Implementation**

**Specification Version:** 1.0  
**Created:** October 22, 2025  
**Platform:** React Native (iPad - Phase 1)  
**Wave:** Wave 1  
**Target:** Expo + React Native + TypeScript  

---

## Source Use Case

**UC-200: View Recent COINs**  
Location: `UC-200-View-Recent-COINs-Elaboration.md`

**Summary:** Default home screen showing 15-20 most recently accessed COINs in grid layout. Supports episodic BA work patterns with visual browsing, quick resume of recent work, and native iOS interactions.

---

## Implementation Overview

Create the default home screen for the COIN iPad app following the validated "Recents-first" pattern. This screen displays recently accessed COINs as large cards with thumbnails, enabling quick visual recognition and single-tap resume of work. The implementation must feel native to iOS with smooth 60fps performance and standard iPad gestures.

**Key Requirements:**
- Grid of COIN cards (auto-adjusts for portrait/landscape)
- Large thumbnails for visual recognition
- Last accessed time display
- Status badges
- Swipe-to-remove gesture
- Pull-to-refresh
- Bottom tab bar navigation (Recents/Projects/Favorites)
- Floating "+" button for new COIN creation

---

## Technical Architecture

### Screen Component
**`RecentsScreen.tsx`** - Main screen component
- Uses React Navigation's Tab.Screen
- Manages access history state
- Handles refresh logic
- Coordinates with AccessHistoryService

### Key Components

**`COINCardGrid`** - Responsive grid container
- FlatList with numColumns based on orientation
- Lazy loading of thumbnails
- Pull-to-refresh support
- Maintains 60fps scrolling

**`COINCard`** - Reusable card component (shared with UC-201)
- Props: `coin`, `onPress`, `onRemove`
- Displays thumbnail, name, project, time, status
- Swipe-to-remove gesture
- Touch feedback (opacity change on press)

**`EmptyRecentsState`** - Zero state component
- Shown when no recent COINs
- Clear message and call-to-action
- Conditional CTA based on whether user has any COINs

**`StatusBadge`** - Status indicator overlay
- Props: `status` (Draft | Review | Approved | Archived)
- Color-coded with icon
- Positioned on card corner

### Services

**`AccessHistoryService`**
- `getRecentCOINs(limit: number): Promise<COIN[]>`
- `recordAccess(coinId: string): Promise<void>`
- `removeFromRecents(coinId: string): Promise<void>`
- Manages AsyncStorage persistence

**`COINRepository`** (existing)
- Used to fetch full COIN data for cards
- Provides thumbnails (or generates from canvas data)

### Data Models

```typescript
import { COIN } from '@shared/types';

interface AccessHistoryEntry {
  coinId: string;
  accessedAt: Date;
}

interface AccessHistory {
  entries: AccessHistoryEntry[];
  maxEntries: number; // 100
}
```

---

## Detailed Requirements

### Layout & Responsive Behavior

**Portrait Orientation:**
- 3 columns of cards
- 16pt spacing between cards
- 24pt margins from screen edges
- Cards maintain 2:3 aspect ratio

**Landscape Orientation:**
- 4 columns of cards
- Same spacing and margins
- Cards maintain same aspect ratio

**Card Sizing:**
- Cards fill available width divided by columns
- Height calculated from aspect ratio
- Minimum card width: 200pt
- Maximum card width: 400pt

**Implementation Note:** Use FlatList with `numColumns` prop that updates based on screen width. Listen to Dimensions change event for orientation detection.

### COIN Card Content

Each card displays:

**Thumbnail (Primary):**
- Generated from COIN canvas data
- Fallback: Placeholder with COIN icon if canvas empty
- Aspect ratio: 2:3 (portrait)
- Background color: Light gray (#F5F5F5) for empty state

**Text Overlay (on thumbnail):**
- COIN name: 18pt SFProText-Semibold, white with dark shadow
- Position: Bottom-left, 12pt from edges
- Max 2 lines, truncate with ellipsis

**Below Thumbnail:**
- Project name: 14pt SFProText-Regular, gray (#666666)
- Last accessed: 12pt SFProText-Regular, light gray (#999999)
- Format: "2 hours ago", "3 days ago", "Oct 15", etc.

**Status Badge:**
- 32x32pt circle, positioned top-right corner (8pt inset)
- Background: Status color with 80% opacity
- Icon: SF Symbol, 18pt, white
- Types:
  - Draft: Clock icon, gray background
  - Review: Dot icon, amber background
  - Approved: Checkmark icon, green background
  - Archived: Archive box icon, light gray background

### Interaction Behaviors

**Tap Card:**
- Visual feedback: Opacity 0.6 during press
- Haptic: Light impact on press
- Action: Navigate to COIN editor (UC-110)
- Records access time
- Card animates back to position when returning

**Swipe Left on Card:**
- Reveals red "Remove" button (80pt wide)
- Button text: "Remove" in white
- Requires 30pt swipe distance to trigger reveal
- Animation: Smooth 200ms ease-out
- Swipe back closes action

**Tap Remove Button:**
- Removes COIN from recents (not from storage)
- Card animates out (fade + slide right, 300ms)
- Brief toast: "Removed from Recents" (2 seconds)
- Light haptic feedback
- Updates access history immediately

**Pull Down to Refresh:**
- Standard iOS refresh control
- Spinner appears when pulled past threshold
- Refreshes access history from storage
- Updates card list with new timestamps
- Animation completes smoothly

**Tap + Button:**
- Button: 56x56pt circle, bottom-right corner (24pt from edges)
- Background: App primary color (blue)
- Icon: Plus symbol, white, 28pt
- Shadow: Standard iOS button shadow
- Haptic: Medium impact on tap
- Action: Present UC-100 flow (Create New COIN)

### Empty State

**Shown when:**
- User has never accessed any COINs
- User removed all items from recents

**Content:**
- SF Symbol: doc.text.magnifyingglass, 80pt, light gray
- Headline: "No Recent COINs" (24pt, Semibold)
- Subtext: "COINs you access will appear here for quick access" (16pt, Regular, gray)
- CTA Button: "Create Your First COIN" (if user has zero COINs total)
- Alternative CTA: "Browse Projects" button (if user has COINs but none recently accessed)

**Layout:**
- Centered vertically and horizontally
- Content max width: 400pt
- 16pt spacing between elements

### Bottom Tab Bar

**Tab Configuration:**
- Three tabs: Recents (default), Projects, Favorites
- Icons: SF Symbols
  - Recents: clock.fill
  - Projects: folder.fill
  - Favorites: star.fill
- Active tab: Primary color, filled icon
- Inactive tabs: Gray, outline icon
- Tab labels: 11pt SFProText-Medium

**Tab Behavior:**
- Tapping active tab scrolls to top (iOS standard)
- Each tab maintains independent scroll position
- Tab switch animation: Cross-dissolve (standard iOS)
- Recents tab is initial/default

### Performance Requirements

**Scrolling:**
- Maintain 60fps during scroll
- No jank or frame drops
- Smooth deceleration

**Thumbnail Loading:**
- Load thumbnails lazily (as scrolled into view)
- Show placeholder immediately
- Swap in thumbnail when loaded (fade transition)
- Cache loaded thumbnails in memory
- Maximum 20 items limits memory pressure

**Animations:**
- Card press: <100ms response time
- Swipe reveal: 200ms ease-out
- Card removal: 300ms ease-out
- All animations use native driver (60fps guarantee)

**Memory:**
- Keep max 20 COIN cards in memory
- Release thumbnails when scrolled far off-screen
- No memory leaks from listeners

---

## Implementation Scenarios

### Main Success Scenario (from UC-200)

**User Flow:**
1. App launches → RecentsScreen displays automatically
2. Grid of recently accessed COINs shown (3 wide in portrait)
3. Each card shows thumbnail, name, project, time, status
4. User taps a card → Opens COIN in editor
5. User returns from editor → Recents view shows updated access time for that COIN

**Test:** Launch app, verify grid appears, tap card, verify navigation, return, verify time updated

### AS-1: Empty State

**Scenario:** User has never accessed COINs

**Implementation:**
- Check access history length
- If length === 0, render EmptyRecentsState component
- Show "No Recent COINs" message
- Show "Create Your First COIN" button if totalCOINs === 0
- Show "Browse Projects" button if totalCOINs > 0

**Test:** Clear access history, launch app, verify empty state appears

### AS-2: Remove from Recents

**Scenario:** User swipes left on card

**Implementation:**
- Detect swipe gesture (PanResponder or react-native-gesture-handler)
- Reveal remove button when swipe > 30pt
- On tap remove button:
  - Call AccessHistoryService.removeFromRecents(coinId)
  - Animate card out (fade + slide right, 300ms)
  - Show toast "Removed from Recents"
  - Update FlatList data source
- COIN remains in storage (not deleted)

**Test:** Swipe card left, tap remove, verify card disappears, verify COIN still in Projects tab

### AS-3: Pull to Refresh

**Scenario:** User pulls down on recents list

**Implementation:**
- Use FlatList's RefreshControl
- onRefresh callback:
  - Set refreshing state to true
  - Call AccessHistoryService.getRecentCOINs(20)
  - Update state with fresh data
  - Set refreshing to false
- Animation handles automatically

**Test:** Pull down, verify spinner appears, verify list refreshes

### AS-4: Navigate to Projects or Favorites

**Scenario:** User taps Projects or Favorites tab

**Implementation:**
- React Navigation Bottom Tabs handles this automatically
- Recents maintains scroll position and state when inactive
- When Recents tab tapped again, restores exact scroll position

**Test:** Scroll down recents, tap Projects, tap Recents again, verify scroll position preserved

### AS-5: Create New COIN

**Scenario:** User taps + button

**Implementation:**
- Floating action button in bottom-right
- onPress: Navigate to UC-100 flow (Create New COIN screen)
- After COIN created, new COIN appears at top of Recents automatically (most recent access)

**Test:** Tap + button, create COIN, return to Recents, verify new COIN at top

### AS-6: Orientation Change

**Scenario:** User rotates iPad

**Implementation:**
- Listen to Dimensions.addEventListener('change')
- Update numColumns: width >= 1024 ? 4 : 3
- FlatList re-renders with new column count
- Maintain scroll position (as much as possible)
- Transition smoothly

**Test:** View recents in portrait, rotate to landscape, verify 4 columns, rotate back, verify 3 columns

### AS-7: Open COIN from Deep Link

**Scenario:** App opened via deep link to specific COIN

**Implementation:**
- Deep link bypasses Recents screen
- Opens directly to specified COIN editor
- When user closes COIN editor, navigate to Recents (not back to wherever app was)
- This is iOS standard behavior

**Test:** Open app via deep link, verify COIN opens, close COIN, verify Recents screen appears

---

## Data Management

### Access History Storage

**Storage Strategy:**
- AsyncStorage key: `@coin-app:access-history`
- Format: JSON array of AccessHistoryEntry objects
- Maximum 100 entries (prune oldest when adding 101st)
- Update on every COIN access (read or write)

**AccessHistoryService Implementation:**

```typescript
// Get recent COINs sorted by access time
async getRecentCOINs(limit: number = 20): Promise<COIN[]> {
  // Load access history from AsyncStorage
  // Get top `limit` entries sorted by accessedAt desc
  // Fetch full COIN data from COINRepository for each
  // Return array of COINs
}

// Record that a COIN was accessed
async recordAccess(coinId: string): Promise<void> {
  // Load current history
  // Remove existing entry for this coinId (if present)
  // Add new entry with current timestamp at front
  // Keep max 100 entries (prune oldest if needed)
  // Save to AsyncStorage
}

// Remove COIN from recents (UI action)
async removeFromRecents(coinId: string): Promise<void> {
  // Load current history
  // Filter out entry for this coinId
  // Save updated history to AsyncStorage
  // Note: COIN itself is NOT deleted
}
```

### State Management

**RecentsScreen State:**
```typescript
const [recentCOINs, setRecentCOINs] = useState<COIN[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [isEmpty, setIsEmpty] = useState(false);
```

**Effects:**
```typescript
// On mount: Load recent COINs
useEffect(() => {
  loadRecents();
}, []);

// On navigation focus: Refresh if coming back from editor
useFocusEffect(
  useCallback(() => {
    loadRecents();
  }, [])
);
```

---

## Integration Points

### With UC-100 (Create New COIN)
- + button navigates to create flow
- After creation, new COIN automatically at top of Recents (recent access recorded)

### With UC-110 (Open Existing COIN)
- Tapping card opens COIN in editor
- Returns to Recents when editor closed
- Access time updated automatically

### With UC-201 (View COIN List)
- Projects tab shows full organizational view
- Separate tab, independent state
- COINCard component shared between both screens

### With COINRepository (Existing)
- Fetches full COIN data including thumbnails
- Generates thumbnails if not yet cached
- Handles COIN storage

### With iOS State Restoration
- If app backgrounded <1 hour, iOS restores exact state (editor open, scroll position)
- If app quit or restarted, opens to Recents home screen
- Standard iOS behavior, automatically handled

---

## Phase 2 Considerations

**Current Phase 1 Implementation:**
- Local storage only (AsyncStorage)
- No cloud sync
- Single device

**Phase 2 Changes (for reference, not implementation now):**
- Access history syncs to MongoDB Atlas
- Pull-to-refresh fetches from cloud
- Team activity indicators on cards
- Suggested COINs section
- Works across iPad and Web

**For Now:**
- Architect with sync in mind (AccessHistoryService is abstraction)
- Keep access history data simple (ready for JSON serialization)
- Don't hard-code AsyncStorage into components (use service)

---

## Technical Constraints

### Expo SDK
- Use Expo 51+ APIs
- Use expo-router for navigation (or React Navigation if not using expo-router)
- Use expo-haptics for haptic feedback

### React Native
- Functional components with hooks (no class components)
- TypeScript throughout
- Use FlatList for list (better performance than ScrollView)

### Styling
- React Native StyleSheet
- No inline styles
- Responsive to Dimensions
- Use Platform-specific code where needed (Platform.OS)

### Gestures
- Use react-native-gesture-handler for swipe gesture
- Or PanResponder if simpler
- Native driver for all animations

### Performance
- Lazy load thumbnails
- Use React.memo for COINCard component
- Avoid unnecessary re-renders
- Use FlatList optimization props (windowSize, maxToRenderPerBatch, etc.)

---

## Acceptance Criteria Checklist

### Functional Requirements
- [ ] Recents screen displays as default home screen on app launch
- [ ] Shows 15-20 most recently accessed COINs
- [ ] COINs sorted chronologically (most recent first)
- [ ] Each card displays: thumbnail, name, project name, last accessed time, status badge
- [ ] Tap card navigates to COIN editor
- [ ] Swipe left reveals "Remove from Recents" action
- [ ] Tap remove button removes COIN from recents (not from storage)
- [ ] Empty state displays when no recent COINs
- [ ] Pull-to-refresh updates recents list
- [ ] Bottom tab bar shows Recents (active), Projects, Favorites
- [ ] Tap + button opens Create New COIN flow
- [ ] After creating COIN, it appears at top of Recents

### User Experience
- [ ] Grid layout: 3 columns in portrait, 4 columns in landscape
- [ ] Orientation changes handled smoothly
- [ ] Scroll position maintained on tab switch
- [ ] Tapping active Recents tab scrolls to top
- [ ] Touch feedback on all interactions (opacity, haptics)
- [ ] Swipe gesture feels natural (30pt threshold)
- [ ] Card removal animates smoothly
- [ ] Empty state is clear and helpful

### Visual Design
- [ ] Cards have 2:3 aspect ratio
- [ ] Proper spacing (16pt between cards, 24pt margins)
- [ ] Thumbnails load with placeholder
- [ ] Status badges color-coded correctly
- [ ] SF Symbols used for icons
- [ ] Typography follows iOS standards (SF Pro Text)
- [ ] Time format is human-friendly relative time

### Performance
- [ ] Grid scrolling maintains 60fps
- [ ] No frame drops during interactions
- [ ] Thumbnails load asynchronously without blocking
- [ ] Animations use native driver
- [ ] Memory usage stays reasonable (<100MB for 20 items)
- [ ] App launch to Recents screen <1 second

### iPad-Specific
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] Touch targets meet iOS standards (44x44pt minimum)
- [ ] Gestures follow iOS conventions
- [ ] Haptic feedback on appropriate actions
- [ ] Respects safe area insets
- [ ] Supports Split View / Slide Over (if applicable)

### Integration
- [ ] AccessHistoryService persists to AsyncStorage
- [ ] COINRepository provides COIN data
- [ ] Navigation to editor (UC-110) works
- [ ] Navigation to create flow (UC-100) works
- [ ] Tab navigation to Projects (UC-201) works
- [ ] State restoration works correctly

---

## Testing Guidance

### Manual Testing Scenarios

**Test 1: Fresh Install**
1. Install app (no prior data)
2. Launch app
3. Verify empty state appears
4. Verify "Create Your First COIN" button present
5. Tap button, create COIN
6. Return to Recents
7. Verify COIN appears in grid

**Test 2: Multiple COINs**
1. Create 5 COINs
2. Access each COIN (open and close)
3. Return to Recents after each
4. Verify COINs appear in reverse chronological order
5. Access an older COIN
6. Verify it moves to top of list

**Test 3: Remove from Recents**
1. Swipe left on middle card
2. Verify remove button appears
3. Tap remove
4. Verify card animates out
5. Verify toast appears
6. Go to Projects tab
7. Verify COIN still exists

**Test 4: Orientation Change**
1. View Recents in portrait (3 columns)
2. Rotate to landscape
3. Verify 4 columns
4. Verify layout reflows smoothly
5. Rotate back to portrait
6. Verify 3 columns

**Test 5: Performance**
1. Create 20 COINs with large thumbnails
2. Scroll rapidly through list
3. Verify smooth 60fps scrolling
4. Monitor memory usage
5. No leaks or excessive memory

**Test 6: Pull to Refresh**
1. View Recents
2. Pull down
3. Verify refresh spinner
4. Verify list updates
5. Verify animation completes smoothly

### Automated Testing

**Unit Tests:**
- AccessHistoryService methods
- Time formatting utility
- Card removal logic

**Integration Tests:**
- Full flow: Launch → View Recents → Tap Card → Edit → Return
- Create COIN flow → Appears in Recents
- Remove from Recents → Still in storage

**E2E Tests:**
- Complete user journey through Recents screen
- Tab navigation flow
- Orientation changes

---

## Common Pitfalls to Avoid

1. **Don't load all thumbnails at once** - Use lazy loading
2. **Don't block UI while loading** - Show placeholders immediately
3. **Don't forget to update access time** - Record on every COIN open
4. **Don't hard-code AsyncStorage** - Use AccessHistoryService abstraction
5. **Don't skip haptic feedback** - iOS users expect it
6. **Don't use inline styles** - Use StyleSheet for performance
7. **Don't forget orientation handling** - Test both portrait and landscape
8. **Don't skip empty state** - Critical for new users
9. **Don't forget safe area insets** - Especially for + button and tab bar
10. **Don't use enableLayoutAnimations** - Causes Android crashes, use native driver

---

## Implementation Notes

### Suggested Component Structure

```
src/screens/RecentsScreen.tsx          (Main screen)
src/components/recents/COINCardGrid.tsx  (Grid container)
src/components/shared/COINCard.tsx      (Reusable card - shared with Projects)
src/components/recents/EmptyRecentsState.tsx
src/components/shared/StatusBadge.tsx
src/services/AccessHistoryService.ts
src/utils/timeFormatting.ts            (Relative time utility)
```

### Suggested Navigation Setup

```typescript
// Bottom tabs navigator
<Tab.Navigator>
  <Tab.Screen 
    name="Recents" 
    component={RecentsScreen}
    options={{
      tabBarIcon: ({color}) => <Icon name="clock.fill" color={color} />,
    }}
  />
  <Tab.Screen 
    name="Projects" 
    component={ProjectsScreen}
    options={{
      tabBarIcon: ({color}) => <Icon name="folder.fill" color={color} />,
    }}
  />
  <Tab.Screen 
    name="Favorites" 
    component={FavoritesScreen}
    options={{
      tabBarIcon: ({color}) => <Icon name="star.fill" color={color} />,
    }}
  />
</Tab.Navigator>
```

### Suggested FlatList Optimization

```typescript
<FlatList
  data={recentCOINs}
  renderItem={({item}) => <COINCard coin={item} onPress={...} onRemove={...} />}
  keyExtractor={item => item.id}
  numColumns={isLandscape ? 4 : 3}
  key={isLandscape ? 'landscape' : 'portrait'} // Force re-render on orientation
  contentContainerStyle={styles.gridContainer}
  columnWrapperStyle={styles.row}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  ListEmptyComponent={<EmptyRecentsState />}
  windowSize={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

---

## Success Metrics

**Implementation Complete When:**
- All acceptance criteria pass
- Manual testing scenarios pass
- Performance meets 60fps target
- Visual design matches specification
- Chuck approves on actual iPad

**Quality Indicators:**
- Zero crashes during testing
- Smooth animations throughout
- Intuitive without explanation
- Feels native to iOS
- Works in both orientations

---

## Summary for Claude Code

**What to Build:**
Default home screen showing recent COINs in responsive grid with thumbnails, swipe-to-remove, pull-to-refresh, and bottom tab navigation.

**Key Technologies:**
- React Native FlatList (responsive grid)
- react-native-gesture-handler (swipe gesture)
- expo-haptics (touch feedback)
- AsyncStorage (access history)
- React Navigation Bottom Tabs

**Critical Requirements:**
- 60fps scrolling performance
- Lazy thumbnail loading
- 3 columns portrait, 4 landscape
- Swipe left to remove
- Empty state for new users
- Tab bar navigation

**Test Focus:**
- Orientation handling
- Performance under load (20 COINs)
- Gesture naturalness
- Tab state preservation

---

**This specification provides everything needed to implement UC-200: View Recent COINs for iPad. Follow iOS conventions, maintain 60fps, and focus on visual browsing experience that supports episodic BA work patterns.**
