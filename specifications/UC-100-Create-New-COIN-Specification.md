# UC-100: Create New COIN Diagram - Specification

**Platform:** iPad (React Native)  
**Wave:** Wave 1  
**Priority:** HIGH  
**Dependencies:** None (first feature)

---

## Source Use Case

**UC-100: Create a new COIN diagram**

**Actor:** Business Analyst

**Pre-conditions:**
- User is logged into the Design the What app

**Post-conditions:**
- A new COIN canvas and diagram is created

**Main Success Scenario:**
1. Business Analyst clicks on "New COIN" button
2. System displays empty COIN diagram editing canvas
3. Business Analyst enters a name for the COIN
4. Business Analyst clicks "Save"
5. System persists new COIN with given name

**Alternate Scenarios:**
1. **Cancel COIN creation:** At any point, Business Analyst clicks "Cancel" and no new COIN is created
2. **Empty name:** If Business Analyst clicks "Save" without entering a name, system shows error to enter name
3. **Duplicate name:** If entered name already exists for another COIN, system shows error to enter a unique name

---

## iPad-Specific Requirements

### Touch Interactions
- **"New COIN" button:** Minimum 44x44px touch target, prominent placement
- **Modal presentation:** Slides up from bottom (native iOS pattern)
- **Name input:** Auto-focus when modal opens, keyboard appears automatically
- **Keyboard handling:**
  - Dismiss keyboard when tapping outside input
  - "Done" button in keyboard toolbar
  - "Save" button remains accessible above keyboard
- **Gestures:**
  - Swipe down on modal to dismiss (same as Cancel)
  - Tap outside modal background to dismiss (same as Cancel)

### Responsive Behavior
- **Portrait mode:** Modal takes 60% of screen height
- **Landscape mode:** Modal takes 50% of screen height, centered
- **Keyboard visible:** Modal adjusts to stay above keyboard
- **Animation:** Smooth 300ms slide-up/down animation

### Performance
- **Modal animation:** 60fps
- **Keyboard show/hide:** Smooth transition, no jank
- **Input responsiveness:** No lag when typing

---

## Data Model
```typescript
interface COIN {
  id: string;              // UUID generated on creation
  name: string;            // User-entered name
  version: number;         // Always 1 for new COIN
  createdAt: string;       // ISO date string
  createdBy: string;       // User ID (for now, device ID)
  lastModifiedBy: string;  // User ID (same as createdBy initially)
  // Phase 2 fields (include but don't use yet)
  syncStatus?: 'local';    // Always 'local' in Phase 1
  serverVersion?: number;  // Not used in Phase 1
}
```

---

## Implementation Guidance for Claude Code

### Component Structure

Create these components:

**1. HomeScreen.tsx** (Main screen with COIN list)
- Header with app title
- Large "New COIN" button (TouchableOpacity)
- Placeholder for COIN list (comes in UC-201)
- Manages modal visibility state

**2. CreateCOINModal.tsx** (Modal for creating new COIN)
- React Native Modal component
- Slides from bottom
- Contains TextInput for name
- Save and Cancel buttons
- Handles keyboard
- Validates input

**3. COINRepository.ts** (Storage abstraction)
- `createCOIN(name: string): Promise<COIN>` - Creates new COIN
- `getAllCOINs(): Promise<COIN[]>` - Returns all COINs (for duplicate check)
- Uses AsyncStorage for persistence
- Generates UUIDs
- Handles errors

### Key Technical Decisions

**Storage:**
```typescript
// Store COINs as JSON in AsyncStorage
// Key pattern: "coin_<uuid>"
// Also maintain index: "coin_list" with array of IDs

await AsyncStorage.setItem(`coin_${coin.id}`, JSON.stringify(coin));
```

**UUID Generation:**
```typescript
// Use crypto.randomUUID() or uuid library
import { v4 as uuidv4 } from 'uuid'; // if needed
const id = uuidv4();
```

**User Context:**
```typescript
// For Phase 1, use device ID as user ID
import * as Application from 'expo-application';
const userId = Application.androidId || 'device-user';
```

**Duplicate Name Check:**
```typescript
// Load all COINs, check if name exists (case-insensitive)
const existing = await COINRepository.getAllCOINs();
const duplicate = existing.find(c => c.name.toLowerCase() === name.toLowerCase());
```

### React Native Patterns to Use

**Modal:**
```typescript
<Modal
  visible={isVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={onCancel}
>
```

**TextInput with keyboard:**
```typescript
<TextInput
  ref={inputRef}
  autoFocus={true}
  placeholder="Enter COIN name"
  onChangeText={setName}
  onSubmitEditing={handleSave}
  returnKeyType="done"
  style={styles.input}
/>
```

**Keyboard dismissal:**
```typescript
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View>{/* content */}</View>
</TouchableWithoutFeedback>
```

**Touch targets:**
```typescript
const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    padding: 12,
  },
});
```

---

## Acceptance Criteria

### Main Scenario Success
- [ ] "New COIN" button is visible on home screen
- [ ] Tapping button opens modal from bottom
- [ ] Modal animates smoothly at 60fps
- [ ] Name input is auto-focused, keyboard appears
- [ ] Can type COIN name without lag
- [ ] Tapping "Save" with valid name:
  - [ ] Creates new COIN
  - [ ] Saves to AsyncStorage
  - [ ] Closes modal
  - [ ] Returns to home screen
- [ ] New COIN has unique ID, correct name, timestamps

### Alternate Scenario 1: Cancel
- [ ] "Cancel" button is visible and properly sized (44x44)
- [ ] Tapping "Cancel" closes modal without creating COIN
- [ ] Swipe down gesture closes modal (iOS pattern)
- [ ] Tap outside modal closes modal
- [ ] No COIN saved to AsyncStorage

### Alternate Scenario 2: Empty Name
- [ ] Tapping "Save" with empty input shows error
- [ ] Error message is clear: "Please enter a COIN name"
- [ ] Error disappears when user starts typing
- [ ] Modal stays open
- [ ] Can still cancel or enter valid name

### Alternate Scenario 3: Duplicate Name
- [ ] Tapping "Save" with existing name shows error
- [ ] Error message is clear: "A COIN with this name already exists"
- [ ] Error disappears when user modifies name
- [ ] Modal stays open
- [ ] Can still cancel or enter unique name

### iPad-Specific Requirements
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] Modal adjusts when keyboard appears
- [ ] All touch targets are minimum 44x44px
- [ ] Animations are smooth (60fps)
- [ ] Keyboard "Done" button works
- [ ] Safe area respected (no overlap with notch/home indicator)

### Performance
- [ ] Modal opens within 300ms
- [ ] No frame drops during animation
- [ ] Input feels responsive
- [ ] No delays when keyboard appears

---

## Testing Scenarios

### Test 1: Happy Path
1. Launch app on iPad simulator
2. Verify "New COIN" button is visible
3. Tap "New COIN" button
4. Verify modal slides up smoothly
5. Verify keyboard appears automatically
6. Type "Employee Onboarding" as name
7. Tap "Save"
8. Verify modal closes
9. Verify no errors
10. (UC-201 will show the COIN in list)

### Test 2: Cancel
1. Launch app
2. Tap "New COIN"
3. Type "Test COIN"
4. Tap "Cancel"
5. Verify modal closes
6. Verify no COIN was created (check AsyncStorage if needed)

### Test 3: Empty Name
1. Launch app
2. Tap "New COIN"
3. Leave name field empty
4. Tap "Save"
5. Verify error message appears
6. Verify modal stays open
7. Type "Valid Name"
8. Verify error disappears
9. Tap "Save"
10. Verify COIN is created

### Test 4: Duplicate Name
1. Create a COIN named "Test COIN"
2. Tap "New COIN" again
3. Type "Test COIN" (exact same)
4. Tap "Save"
5. Verify duplicate error appears
6. Try "test coin" (different case)
7. Verify still shows duplicate error
8. Change to "Test COIN 2"
9. Tap "Save"
10. Verify COIN is created

### Test 5: Landscape Orientation
1. Launch app in portrait
2. Tap "New COIN"
3. Rotate iPad to landscape
4. Verify modal adjusts properly
5. Verify can still type and save
6. Rotate back to portrait
7. Verify still works correctly

### Test 6: Keyboard Interaction
1. Tap "New COIN"
2. Verify keyboard appears
3. Tap outside text input but inside modal
4. Verify keyboard dismisses
5. Tap input again
6. Verify keyboard reappears
7. Type name and press "Done" on keyboard
8. Verify keyboard dismisses but modal stays open
9. Tap "Save"
10. Verify COIN is created

---

## Integration Notes

### What Comes Next (UC-201)
- UC-201 will display the list of COINs on home screen
- The "New COIN" button will remain in header
- COINRepository will be reused by UC-201
- Home screen structure should accommodate list below button

### Future Considerations
- UC-130 will use similar modal pattern for editing
- COINRepository will be extended with update/delete methods
- Modal component could be made reusable for other use cases

---

## File Structure
```
src/
  screens/
    HomeScreen.tsx          # Main screen with New COIN button
  components/
    CreateCOINModal.tsx     # Modal for COIN creation
  storage/
    COINRepository.ts       # AsyncStorage wrapper
  types/
    COIN.ts                 # TypeScript interfaces
```

---

## Success Definition

**This use case is complete when:**
1. All acceptance criteria pass
2. All test scenarios work on iPad simulator
3. Chuck approves on physical iPad (if available)
4. Collin approves UX and touch interactions
5. Code is committed to Git
6. Ready to proceed to UC-201

---

## Notes for Claude Code

- This is the first feature - establish patterns others will follow
- Focus on smooth animations and responsive feel
- Error handling should be user-friendly, not technical
- Remember: This is React Native, not React DOM
- Use StyleSheet, not CSS/Tailwind
- Use TouchableOpacity, not button elements
- Test on actual iPad simulator before considering complete