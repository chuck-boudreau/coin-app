# UC-201: View/List My COINs - Specification

**Platform:** iPad (React Native)  
**Wave:** Wave 1  
**Priority:** HIGH  
**Dependencies:** None (this is the home screen - comes BEFORE UC-100)

---

## Source Use Case

**UC-201: View/List My COINs**

**Actor:** Business Analyst

**Pre-conditions:**
- User is logged into the Design the What app

**Post-conditions:**
- User can see all their COIN diagrams
- User can access COIN management functions

**Main Success Scenario:**
1. Business Analyst launches the app
2. System displays list of all COIN diagrams
3. For each COIN, system shows:
   - COIN name
   - Date created
   - Date last modified
   - Visual preview/thumbnail (if available)
4. Business Analyst can scroll through the list
5. Business Analyst can tap on a COIN to open it (future UC)
6. Business Analyst can access "New COIN" button to create new diagram (UC-100)

**Alternate Scenarios:**
1. **Empty state:** If no COINs exist yet, system displays welcoming empty state with:
   - Message: "No COINs yet"
   - Explanation: "Tap 'New COIN' to create your first diagram"
   - Visual indicator pointing to "New COIN" button
2. **Many COINs:** If user has many COINs, list scrolls smoothly
3. **Search available:** User can search for specific COIN (UC-220, future wave)

---

## iPad-Specific Requirements

### Layout
- **Header:** Fixed at top
  - App title: "COIN App" or "Design the What"
  - "New COIN" button (prominent, right side)
  - Settings/menu button (left side, for future)
- **COIN List:** Scrollable area below header
  - Card-based layout
  - Each card shows COIN info
  - Touch-optimized spacing
- **Safe areas:** Respect iPad notch and home indicator

### Touch Interactions
- **"New COIN" button:** 44x44px minimum, prominent
- **COIN cards:** Full card is tappable (44px minimum height)
- **Scroll:** Smooth momentum scrolling
- **Pull to refresh:** Future enhancement (not Wave 1)

### Responsive Behavior
- **Portrait mode:** Single column of COIN cards
- **Landscape mode:** Two columns of COIN cards (if space allows)
- **Card layout:** Adapts to available width
- **Rotation:** Smooth transition between orientations

### Performance
- **Initial load:** Display within 500ms
- **Scroll:** 60fps smooth scrolling
- **List rendering:** Use FlatList for efficient rendering
- **Empty state:** Instant display (no loading delay)

---

## Data Model
```typescript
// COIN interface already defined in UC-100
interface COIN {
  id: string;
  name: string;
  version: number;
  createdAt: string;       // ISO date string
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedAt: string;  // ISO date string
}

// For display in list
interface COINListItem {
  id: string;
  name: string;
  createdAt: Date;         // Parsed for display
  lastModifiedAt: Date;    // Parsed for display
  // Future: thumbnailUri?: string;
}
```

---

## Implementation Guidance for Claude Code

### Component Structure

**HomeScreen.tsx** (Main screen - this IS UC-201)
- Header with app title and "New COIN" button
- COIN list (FlatList)
- Empty state view (when no COINs)
- Uses COINRepository to load COINs
- Manages CreateCOINModal visibility (UC-100)

**COINListItem.tsx** (Reusable component)
- Displays single COIN card
- Shows name, dates
- Touch feedback (activeOpacity)
- onPress handler (will navigate to COIN editor in future)

**EmptyState.tsx** (Reusable component)
- Friendly "no COINs yet" message
- Visual indicator
- Encourages user to create first COIN

### Key Technical Decisions

**List Rendering:**
```typescript
import { FlatList } from 'react-native';

<FlatList
  data={coins}
  renderItem={({ item }) => <COINListItem coin={item} onPress={handleOpenCOIN} />}
  keyExtractor={(item) => item.id}
  contentContainerStyle={coins.length === 0 ? styles.emptyContainer : undefined}
  ListEmptyComponent={<EmptyState />}
/>
```

**Loading COINs on Mount:**
```typescript
useEffect(() => {
  loadCOINs();
}, []);

const loadCOINs = async () => {
  const allCoins = await COINRepository.getAllCOINs();
  // Sort by last modified (newest first)
  const sorted = allCoins.sort((a, b) => 
    new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime()
  );
  setCoins(sorted);
};
```

**Date Formatting:**
```typescript
import { formatDistanceToNow, format } from 'date-fns';

// "2 days ago" or "Oct 15, 2024"
const formattedDate = formatDistanceToNow(new Date(coin.lastModifiedAt), { addSuffix: true });
```

**Responsive Columns:**
```typescript
import { useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();
const numColumns = width > 768 ? 2 : 1; // 2 columns in landscape on iPad
```

### React Native Patterns to Use

**FlatList (efficient):**
```typescript
// Use FlatList, not ScrollView with map
// FlatList only renders visible items
<FlatList
  data={coins}
  renderItem={renderCOINCard}
  keyExtractor={(item) => item.id}
/>
```

**Safe Area:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
  {/* content */}
</SafeAreaView>
```

**Touch feedback:**
```typescript
<TouchableOpacity
  style={styles.card}
  onPress={() => handleOpenCOIN(coin.id)}
  activeOpacity={0.7}
>
  {/* card content */}
</TouchableOpacity>
```

### Integration with UC-100

**UC-100's CreateCOINModal is managed by this screen:**
```typescript
const [showCreateModal, setShowCreateModal] = useState(false);

const handleCOINCreated = (newCOIN: COIN) => {
  setCoins([newCOIN, ...coins]); // Add to top of list
  setShowCreateModal(false);
};

// In render:
<CreateCOINModal
  visible={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCOINCreated={handleCOINCreated}
/>
```

---

## Acceptance Criteria

### Main Scenario Success
- [ ] App launches and displays home screen (UC-201)
- [ ] Header shows app title
- [ ] "New COIN" button is visible and properly sized (44x44)
- [ ] If COINs exist, they display in a list
- [ ] Each COIN card shows:
  - [ ] COIN name
  - [ ] Created date (formatted)
  - [ ] Last modified date (formatted)
- [ ] List scrolls smoothly at 60fps
- [ ] Can tap "New COIN" to open creation modal (UC-100)
- [ ] After creating COIN, new COIN appears at top of list

### Alternate Scenario 1: Empty State
- [ ] If no COINs exist, empty state displays
- [ ] Empty state shows friendly message
- [ ] Empty state explains what to do next
- [ ] "New COIN" button still visible and accessible
- [ ] After creating first COIN, empty state disappears and list shows

### Alternate Scenario 2: Many COINs
- [ ] List with 20+ COINs scrolls smoothly
- [ ] No lag or frame drops during scroll
- [ ] FlatList efficiently renders only visible items
- [ ] Memory usage stays reasonable

### iPad-Specific Requirements
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] In landscape, considers two-column layout if space allows
- [ ] Header stays fixed at top during scroll
- [ ] Safe areas respected (no overlap with notch/home indicator)
- [ ] All touch targets minimum 44x44px
- [ ] Card touch feedback feels responsive

### Performance
- [ ] Initial load displays within 500ms
- [ ] Scrolling maintains 60fps
- [ ] No jank when loading list
- [ ] Smooth orientation changes

### Integration with UC-100
- [ ] Tapping "New COIN" opens modal (UC-100)
- [ ] After creating COIN in modal, COIN appears in list
- [ ] Newly created COIN appears at top (sorted by most recent)
- [ ] List updates without flicker

---

## Testing Scenarios

### Test 1: First Launch (Empty State)
1. Launch app for first time
2. Verify empty state displays
3. Verify "No COINs yet" message
4. Verify "New COIN" button visible
5. Tap "New COIN"
6. Create a COIN
7. Verify empty state disappears
8. Verify COIN appears in list

### Test 2: With Existing COINs
1. Create 3-5 COINs (using UC-100)
2. Close and relaunch app
3. Verify all COINs display
4. Verify sorted by most recent first
5. Verify dates formatted correctly
6. Scroll through list
7. Verify smooth scrolling

### Test 3: Create from List
1. Launch app with existing COINs
2. Tap "New COIN" button
3. Create new COIN
4. Verify modal closes
5. Verify new COIN appears at top of list
6. Verify previous COINs still visible below

### Test 4: Landscape Orientation
1. Launch app in portrait
2. Verify list displays correctly
3. Rotate to landscape
4. Verify layout adjusts (consider 2 columns)
5. Verify all content still visible
6. Verify scrolling still works
7. Rotate back to portrait
8. Verify returns to single column

### Test 5: Performance with Many COINs
1. Create 20+ COINs
2. Scroll rapidly through list
3. Verify no lag or stuttering
4. Verify FlatList loads items efficiently
5. Scroll to bottom and back to top
6. Verify smooth performance throughout

### Test 6: Date Display
1. Create COIN "COIN A" (will show "just now")
2. Wait or manually adjust device time
3. Create COIN "COIN B"
4. Verify COIN B shows "just now"
5. Verify COIN A shows appropriate time difference
6. Verify dates are readable and formatted well

---

## Integration Notes

### What Comes Next
- **UC-100:** Triggered from "New COIN" button on this screen
- **UC-130:** Will allow editing COIN from this list (future)
- **UC-220:** Will add search functionality to filter this list
- **Future:** Tapping a COIN card will open COIN editor

### Repository Methods Needed
```typescript
// COINRepository must support:
- getAllCOINs(): Promise<COIN[]>  // Returns all COINs sorted by date
- getCOIN(id: string): Promise<COIN | null>  // Get single COIN (future)
```

### State Management
This screen is the "source of truth" for the COIN list in Wave 1:
- Loads COINs on mount
- Updates list when new COIN created
- Will need to refresh when returning from editor (future)

---

## File Structure
```
src/
  screens/
    HomeScreen.tsx          # This IS UC-201 - the main list view
  components/
    COINListItem.tsx        # Individual COIN card
    EmptyState.tsx          # No COINs message
    CreateCOINModal.tsx     # UC-100 modal (managed by HomeScreen)
  storage/
    COINRepository.ts       # getAllCOINs() method
  types/
    COIN.ts                 # TypeScript interfaces
  utils/
    dateFormatting.ts       # Date display helpers
```

---

## Success Definition

**This use case is complete when:**
1. All acceptance criteria pass
2. All test scenarios work on iPad simulator
3. Empty state displays correctly
4. List displays correctly with COINs
5. "New COIN" button works (integrates with UC-100)
6. Chuck approves on physical iPad
7. Collin approves UX and list display
8. Code is committed to Git
9. Ready to proceed with Wave 2

---

## Notes for Claude Code

- This is the HOME SCREEN - the first thing users see
- Must feel professional and polished
- Empty state is important - first impression
- List performance critical - use FlatList
- This screen hosts UC-100's modal
- Think of this as the "COIN Library" or "My COINs" view
- Simple and clean - don't over-complicate
- Focus on smooth scrolling and responsive feel

---

## Implementation Order

**For Wave 1, implement in this order:**
1. **UC-201 FIRST** - Create home screen with empty state
2. **UC-100 SECOND** - Add "New COIN" modal to home screen
3. **Test Together** - Verify full create → display flow works

This ensures we have a place to see created COINs.