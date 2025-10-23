# UC-100: Create New COIN - Technical Specification for Claude Code

**Version:** 1.1  
**Platform:** iPad (React Native + Expo)  
**Created:** October 23, 2025  
**Revised:** October 22, 2025  
**Target:** Claude Code Implementation  
**Use Case Source:** UC-100 Elaboration v1.0 (October 22, 2025)

---

## Overview

This specification transforms the UC-100 elaboration into implementable technical guidance for Claude Code to generate a React Native modal component that enables Business Analysts to create new COIN diagrams with essential metadata on iPad.

**Core Functionality:** Modal creation form that captures Name (required), Project (optional), and Description (optional) fields, then creates COIN and transitions to editor canvas.

**Key Principle:** Minimize friction. BAs facilitate live workshops where every second matters. The modal must appear instantly, keyboard must auto-show, and creation must feel seamless.

---

## Source Use Case Reference

**Full Use Case:** UC-100: Create New COIN (Elaboration v1.0)  
**Location:** `COIN App Vibe Coding/01 - Use Cases/Elaborations/UC-100-Create-New-COIN.md`

**Use Case Summary:**
- **Actor:** Business Analyst
- **Priority:** HIGH (Wave 1)
- **Entry Point:** "+" button in UC-200 (Recents screen) navigation bar
- **Exit Point:** UC-110 (COIN Editor) with empty canvas
- **Purpose:** Create new COIN with minimal required data, immediate transition to editing

**Key Requirements from Elaboration:**
- Modal presentation (iOS form sheet pattern per Navigation Architecture)
- Auto-focus Name field with keyboard
- Three fields: Name (required), Project (optional dropdown), Description (optional textarea)
- Inline validation with clear error states
- Cancellation with confirmation
- Works in portrait and landscape
- Smooth 60fps animations
- Touch targets ≥44×44pt

---

## Navigation Architecture Integration

**CRITICAL:** This component is part of the **Global Modal Stack** as defined in the Navigation Architecture Specification.

### Modal Presentation Pattern

**Type:** Form Sheet Modal (NOT bottom sheet)  
**Rationale:** Per Navigation Architecture Section 4.1, creation forms use Form Sheet pattern:
- Presentation: Centered card on iPad, respects safe areas
- Transition: Zoom + fade in (NOT vertical slide)
- Dismissal: Cancel/Done buttons OR tap outside backdrop
- Navigation: Single screen, no internal stack
- Use case: Self-contained forms like "Create Project", "Create COIN"

**Implementation:**
```typescript
// In root navigator (App.tsx or RootNavigator.tsx)
<Stack.Navigator mode="modal">
  {/* Tab Navigator */}
  <Stack.Screen name="MainTabs" component={TabNavigator} />
  
  {/* Global Modal Stack */}
  <Stack.Screen 
    name="CreateCOIN" 
    component={CreateCOINModal}
    options={{
      presentation: 'formSheet',           // ← Form sheet, not fullScreenModal
      headerShown: false,                  // Custom header inside modal
      gestureEnabled: true,                // Allow swipe down to dismiss
      cardOverlayEnabled: true,            // Semi-transparent backdrop
    }}
  />
  <Stack.Screen 
    name="COINEditor" 
    component={COINEditorScreen}
    options={{
      presentation: 'fullScreenModal',     // Full screen for editor
      headerShown: true,
      gestureEnabled: true,
    }}
  />
</Stack.Navigator>
```

### Entry Point Integration

**Navigation Trigger:**
```typescript
// In RecentsScreen.tsx header right component
const RecentsScreen = ({ navigation }) => {
  const handleCreateCOIN = () => {
    navigation.navigate('CreateCOIN', {
      returnTo: 'Recents',                 // For analytics/breadcrumb
    });
  };

  return (
    <Screen>
      {/* Content */}
    </Screen>
  );
};

// Set navigation options
RecentsScreen.navigationOptions = {
  headerLargeTitle: true,
  headerTitle: 'Recents',
  headerRight: () => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('CreateCOIN')}
      accessibilityLabel="Create new COIN"
      accessibilityRole="button"
    >
      <Icon name="plus" size={24} color="systemBlue" />
    </TouchableOpacity>
  ),
};
```

### Exit Point Integration

**Navigation to Editor:**
```typescript
// After successful COIN creation
const handleCreateSuccess = async (newCOIN: COIN) => {
  // 1. Save to storage
  await COINRepository.save(newCOIN);
  
  // 2. Close create modal
  navigation.goBack();
  
  // 3. Open editor as new modal (NOT push)
  // Per Navigation Architecture: Editor is separate full-screen modal
  navigation.navigate('COINEditor', {
    coinId: newCOIN.id,
    mode: 'create',                        // Signal this is new COIN
  });
};
```

**IMPORTANT:** The transition is:
1. CreateCOIN modal closes (form sheet dismisses)
2. COINEditor modal opens (full-screen presents)
3. Both are modals in Global Modal Stack, NOT hierarchical push

### Modal Dismissal Rules

**Per Navigation Architecture Section 4.2:**

**Dismiss WITHOUT Confirmation:**
- Form is pristine (no data entered)
- Only whitespace entered
- Tap backdrop with empty form

**Dismiss WITH Confirmation:**
- Name field has non-whitespace content
- Project selected
- Description has content
- ANY unsaved changes

**Confirmation Sheet:**
```typescript
// Use iOS Action Sheet (NOT custom modal-on-modal)
import { ActionSheetIOS } from 'react-native';

const handleCancelPress = () => {
  const hasChanges = name.trim() || selectedProjectId || description.trim();
  
  if (!hasChanges) {
    navigation.goBack();  // Dismiss immediately
    return;
  }
  
  // Show iOS native action sheet
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: 'Discard New COIN?',
      message: 'Your changes will be lost.',
      options: ['Discard', 'Keep Editing', 'Cancel'],
      destructiveButtonIndex: 0,
      cancelButtonIndex: 2,
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        navigation.goBack();  // Discard and close
      }
      // buttonIndex 1 or 2: Stay in modal
    }
  );
};
```

---

## Technical Architecture

### Component Structure

```
CreateCOINModal (Form Sheet Modal)
├── SafeAreaView (respects iPad safe areas)
│   ├── ModalCard (centered, rounded, shadowed)
│   │   ├── ModalHeader
│   │   │   ├── CancelButton (top-left, "Cancel" text)
│   │   │   ├── Title ("New COIN", centered)
│   │   │   └── Spacer (top-right, balances layout)
│   │   ├── KeyboardAvoidingView
│   │   │   ├── ScrollView (allows scroll if keyboard obstructs)
│   │   │   │   ├── ModalBody
│   │   │   │   │   ├── NameField (TextInput, auto-focus, required)
│   │   │   │   │   │   ├── Label ("Name *")
│   │   │   │   │   │   ├── Input (accessibilityLabel="COIN name")
│   │   │   │   │   │   └── ErrorMessage (conditional, accessibilityRole="alert")
│   │   │   │   │   ├── ProjectField (Picker/Dropdown, optional)
│   │   │   │   │   │   ├── Label ("Project")
│   │   │   │   │   │   ├── Dropdown (accessibilityLabel="Select project")
│   │   │   │   │   │   └── InfoBanner (if duplicate name, conditional)
│   │   │   │   │   └── DescriptionField (TextInput multiline, optional)
│   │   │   │   │       ├── Label ("Description")
│   │   │   │   │       └── TextArea (accessibilityLabel="COIN description")
│   │   │   │   └── ModalFooter
│   │   │   │       ├── CreateButton (full-width primary action)
│   │   │   │       │   └── accessibilityLabel="Create COIN and open editor"
│   │   │   │       └── accessibilityHint="Creates new COIN with entered details"
└── Backdrop (semi-transparent, dismissable with confirmation)
```

### State Management

**Local Component State (useState):**
```typescript
const [name, setName] = useState<string>('');
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
const [description, setDescription] = useState<string>('');
const [nameError, setNameError] = useState<string>('');
const [showDuplicateWarning, setShowDuplicateWarning] = useState<boolean>(false);
const [isCreating, setIsCreating] = useState<boolean>(false);
```

**Refs for Focus Control:**
```typescript
const nameInputRef = useRef<TextInput>(null);
const descriptionInputRef = useRef<TextInput>(null);
```

**Navigation Hook:**
```typescript
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation<RootStackNavigationProp>();
```

### Data Models

**Primary Interface (from Data Models Specification v2.0):**
```typescript
import { COIN, COINStatus, Project } from '@shared/types';

// Complete COIN interface (cloud-ready, Phase 1 uses local-only fields)
interface COIN {
  // ===== IDENTITY =====
  id: string;                          // UUID v4 (system-generated)
  name: string;                        // Max 100 chars, required
  description?: string;                // Max 500 chars, optional
  dataModelVersion: string;            // "2.0" (for future migrations)
  
  // ===== ORGANIZATIONAL METADATA =====
  projectIds: string[];                // Array of Project IDs (Phase 1: single or empty)
  status: COINStatus;                  // Draft | Review | Approved | Archived
  colorTag?: ColorTag;                 // Optional visual categorization
  tags: string[];                      // User-defined tags (searchable)
  
  // ===== LIFECYCLE METADATA =====
  createdAt: string;                   // ISO 8601 timestamp
  modifiedAt: string;                  // ISO 8601 timestamp
  createdBy: string;                   // User ID (Phase 1: "local-user")
  lastModifiedBy: string;              // User ID (Phase 1: "local-user")
  
  // ===== DIAGRAM CONTENT =====
  participants: Participant[];         // Array of participants
  interactions: Interaction[];         // Array of interactions
  products: Product[];                 // Array of products
  
  // ===== COMPUTED FIELDS =====
  participantCount: number;            // Auto-computed
  interactionCount: number;            // Auto-computed
  productCount: number;                // Auto-computed
  
  // ===== CANVAS & VISUAL =====
  canvasState?: CanvasState;           // Zoom, pan, selected elements
  thumbnailDataUri?: string;           // Base64 PNG (max 200KB)
  
  // ===== PHASE 2+ FIELDS (nullable in Phase 1) =====
  syncStatus?: SyncStatus;             // 'local' | 'synced' | 'conflict'
  serverVersion?: number;              // Cloud version number
  lastSyncedDate?: string;             // ISO 8601 timestamp
  cloudBackupEnabled?: boolean;        // Auto-backup to cloud
  
  // ===== SYSTEM METADATA =====
  accessLog: AccessLogEntry[];         // Recent access history
  favorited: boolean;                  // User favorite flag
  shareStatus: ShareStatus;            // Private | Shared | Published
}

type COINStatus = 'Draft' | 'Review' | 'Approved' | 'Archived';
type SyncStatus = 'local' | 'synced' | 'conflict';
type ShareStatus = 'Private' | 'Shared' | 'Published';
```

**Supporting Interface (from Data Models Specification v2.0):**
```typescript
interface Project {
  // ===== IDENTITY =====
  id: string;                          // UUID v4
  name: string;                        // Max 100 chars, required
  description?: string;                // Max 500 chars
  dataModelVersion: string;            // "2.0"
  
  // ===== VISUAL =====
  colorTag: ColorTag;                  // Visual categorization
  icon?: string;                       // SF Symbol name or emoji
  
  // ===== LIFECYCLE =====
  createdAt: string;                   // ISO 8601
  modifiedAt: string;                  // ISO 8601
  createdBy: string;                   // User ID
  lastModifiedBy: string;              // User ID
  
  // ===== ORGANIZATIONAL =====
  tags: string[];                      // User-defined tags
  status: ProjectStatus;               // Active | Archived
  
  // ===== COMPUTED =====
  coinCount: number;                   // Number of COINs in project
  
  // ===== PHASE 2+ =====
  syncStatus?: SyncStatus;
  serverVersion?: number;
  lastSyncedDate?: string;
}

type ProjectStatus = 'Active' | 'Archived';
type ColorTag = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
```

**Project Dropdown Data Source:**
```typescript
// Load projects from ProjectRepository
const loadProjects = async (): Promise<Project[]> => {
  const allProjects = await ProjectRepository.findAll();
  
  // Filter: Only show Active projects
  const activeProjects = allProjects.filter(p => p.status === 'Active');
  
  // Sort: Alphabetically by name
  return activeProjects.sort((a, b) => a.name.localeCompare(b.name));
};

// Dropdown options:
// 1. "(No Project)" - null selection
// 2. "HR Transformation (3)" - project name + COIN count
// 3. "IT Modernization (7)"
// 4. ...etc
```

### Storage Integration

```typescript
import { COINRepository } from '@/repositories/COINRepository';
import { ProjectRepository } from '@/repositories/ProjectRepository';

// Create new COIN
const createCOIN = async (): Promise<COIN> => {
  const newCOIN: COIN = {
    // Identity
    id: uuidv4(),
    name: name.trim(),
    description: description.trim() || undefined,
    dataModelVersion: '2.0',
    
    // Organizational
    projectIds: selectedProjectId ? [selectedProjectId] : [],
    status: 'Draft',
    colorTag: undefined,
    tags: [],
    
    // Lifecycle
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: 'local-user',           // Phase 1: no auth
    lastModifiedBy: 'local-user',
    
    // Diagram content (empty on creation)
    participants: [],
    interactions: [],
    products: [],
    
    // Computed (all zero for new COIN)
    participantCount: 0,
    interactionCount: 0,
    productCount: 0,
    
    // Canvas state (default)
    canvasState: {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      selectedElements: [],
    },
    
    // System metadata
    accessLog: [{
      timestamp: new Date().toISOString(),
      action: 'created',
      userId: 'local-user',
    }],
    favorited: false,
    shareStatus: 'Private',
    
    // Phase 2+ fields (undefined in Phase 1)
    syncStatus: undefined,
    serverVersion: undefined,
    lastSyncedDate: undefined,
    cloudBackupEnabled: undefined,
  };
  
  // Save to AsyncStorage
  await COINRepository.save(newCOIN);
  
  // Update project's coinCount if assigned
  if (selectedProjectId) {
    await ProjectRepository.incrementCoinCount(selectedProjectId);
  }
  
  return newCOIN;
};
```

---

## Main Success Scenario (MS-1)

**Scenario:** BA creates minimal COIN with only name

**Pre-condition:**
- App is open on Recents screen (default tab on launch per Navigation Architecture)
- At least one active project exists in storage (for dropdown population)

**Steps:**

1. **BA taps "+" button in Recents screen nav bar**
   - System: Detects tap on headerRight component
   - System: Calls `navigation.navigate('CreateCOIN')`
   - **Animation:** Form sheet modal zooms in + fades in (300ms)
   - **Result:** CreateCOIN modal appears centered on screen, backdrop dims underlying UI

2. **System auto-focuses Name field and shows keyboard**
   - **Trigger:** `useEffect(() => { nameInputRef.current?.focus(); }, [])`
   - **Timing:** 100ms after modal animation completes (wait for card to settle)
   - **Keyboard:** Animates up from bottom, pushes modal content up if needed
   - **Result:** Name field has cursor, keyboard is active, ready for input

3. **BA types "HR Onboarding Process"**
   - **Input:** 23 characters, all printable
   - **Validation:** None yet (happens on Create tap)
   - **State:** `name = "HR Onboarding Process"`

4. **BA leaves Project dropdown at default "(No Project)"**
   - **State:** `selectedProjectId = null`
   - **Implication:** COIN will have `projectIds: []` (empty array)

5. **BA leaves Description field empty**
   - **State:** `description = ""`

6. **BA taps "Create" button**
   - **Validation:** Passes (name is not empty after trim)
   - **Processing:**
     ```typescript
     setIsCreating(true);                     // Disable button, show spinner
     const newCOIN = await createCOIN();      // Generate + save COIN
     setIsCreating(false);
     
     // Haptic feedback for success
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
     
     // Navigate to editor
     navigation.goBack();                     // Close CreateCOIN modal
     navigation.navigate('COINEditor', { 
       coinId: newCOIN.id,
       mode: 'create',
     });
     ```

7. **System creates COIN and saves to AsyncStorage**
   - **COIN ID:** `"coin-a1b2c3d4-e5f6-7890-abcd-ef1234567890"` (UUID v4)
   - **Created timestamp:** `"2025-10-22T14:35:00.000Z"`
   - **Storage key:** `@coin-app:coins:${coinId}`
   - **JSON serialization:** Pretty-printed for debugging Phase 1
   - **Result:** COIN persisted to device storage

8. **System closes CreateCOIN modal**
   - **Animation:** Form sheet zooms out + fades out (200ms)
   - **Backdrop:** Fades to transparent
   - **Tab bar:** Remains unchanged (was visible behind modal)

9. **System opens COIN Editor as new full-screen modal**
   - **Animation:** Vertical slide from bottom (300ms, per Navigation Architecture)
   - **Presentation:** Full-screen, covers tab bar completely
   - **Canvas state:** Empty (0 participants, 0 interactions)
   - **Header:** Shows COIN name "HR Onboarding Process", close button (X) in top-left
   - **UC-110:** COIN Editor takes over (separate use case)

10. **System updates Recents list (when BA returns from editor)**
    - **Trigger:** When BA closes editor, returning to Recents tab
    - **Action:** Recents screen refresh triggers
    - **Result:** New COIN appears at top of Recents list

**Post-condition:**
- New COIN persisted to AsyncStorage
- COIN appears in Recents list
- BA is in COIN Editor with empty canvas
- Project's coinCount unchanged (no project assigned)

**Performance Targets:**
- Modal open animation: 300ms
- Auto-focus delay: 100ms
- Create + save operation: < 500ms
- Navigation to editor: < 300ms
- **Total flow duration:** < 1.5 seconds from "+" tap to editor canvas

---

## Alternate Scenarios

### AS-1: Cancel with Confirmation

**Scenario:** BA starts entering data, then cancels

**Trigger:** BA has entered data in any field, taps Cancel button OR taps backdrop

**Steps:**
1. BA taps Cancel button (or backdrop)
2. System detects unsaved changes: `hasChanges = name.trim() || selectedProjectId || description.trim()`
3. System shows iOS ActionSheet:
   - Title: "Discard New COIN?"
   - Message: "Your changes will be lost."
   - Options: ["Discard", "Keep Editing", "Cancel"]
   - Destructive index: 0 (red text)
4. **If BA taps "Discard":**
   - System dismisses modal immediately (goBack)
   - No COIN created
   - Returns to Recents screen
5. **If BA taps "Keep Editing" or "Cancel":**
   - ActionSheet closes
   - Modal remains open
   - Focus returns to last active field

**Post-condition:** Either modal closed (no COIN) OR still in modal

---

### AS-2: Name Validation Error

**Scenario:** BA tries to create COIN with empty name

**Trigger:** BA taps Create button with empty or whitespace-only name

**Steps:**
1. BA leaves Name field empty (or enters only spaces)
2. BA taps Create button
3. System validates: `name.trim() === ''`
4. System shows error:
   - `setNameError("Name is required")`
   - Name field border turns red (systemRed)
   - Error message appears below field with alert icon
   - Haptic feedback: `Haptics.notificationAsync(NotificationFeedbackType.Error)`
   - Field shakes: 3 quick horizontal oscillations (200ms total)
5. System focuses Name field: `nameInputRef.current?.focus()`
6. Create button remains enabled (allow retry)

**Post-condition:** Modal still open, Name field has focus, error visible

**Error Message Copy:**
- Empty: "Name is required"
- Only whitespace: "Name cannot be blank"
- Too long (>100 chars): "Name must be 100 characters or less"

**Accessibility:**
- Error message has `accessibilityRole="alert"` (announces automatically)
- Error message has `accessibilityLiveRegion="polite"`

---

### AS-3: Duplicate Name Warning

**Scenario:** BA enters name that matches existing COIN in same project

**Trigger:** BA selects project, types name that exists in that project (debounced check)

**Implementation:**
```typescript
// Debounced duplicate check (500ms after typing stops)
useEffect(() => {
  if (!name.trim() || !selectedProjectId) {
    setShowDuplicateWarning(false);
    return;
  }
  
  const timeoutId = setTimeout(async () => {
    const existingCOINs = await COINRepository.findByProjectId(selectedProjectId);
    const duplicate = existingCOINs.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    setShowDuplicateWarning(!!duplicate);
  }, 500);
  
  return () => clearTimeout(timeoutId);
}, [name, selectedProjectId]);
```

**Steps:**
1. BA selects "HR Transformation" project
2. BA types "New Hire Process"
3. System waits 500ms after last keystroke
4. System queries COINRepository for duplicates in "HR Transformation"
5. System finds existing COIN with same name
6. System shows warning banner below Project field:
   - Icon: ⚠️ (SF Symbol: exclamationmark.triangle)
   - Text: "A COIN with this name already exists in HR Transformation"
   - Background: systemYellow (alpha 0.2)
   - Border: systemYellow (1px)
   - Padding: 12pt
7. Warning is informational only (does NOT block creation)
8. BA can still tap Create button (duplicate names allowed, just warned)

**Post-condition:** Warning visible, Create button still enabled

**Accessibility:**
- Warning has `accessibilityLabel="Warning: A COIN with this name already exists in this project"`
- Announces with `accessibilityLiveRegion="polite"` (not aggressive)

---

### AS-4: Project Selection

**Scenario:** BA assigns COIN to a project

**Trigger:** BA taps Project dropdown

**Steps:**
1. BA taps Project dropdown field
2. System shows iOS Picker (wheel picker on iOS, dropdown on iPad):
   - First option: "(No Project)" (gray text, italic)
   - Remaining options: Active projects sorted alphabetically with COIN counts
     - "Client A - Discovery (3)"
     - "HR Transformation (7)"
     - "IT Modernization (0)"
3. BA scrolls and selects "HR Transformation"
4. System updates state: `setSelectedProjectId("proj-hr-transform-uuid")`
5. Dropdown shows selected value: "HR Transformation"
6. System runs duplicate name check (AS-3 may trigger)

**Post-condition:** Project selected, visible in dropdown

**Dropdown Option Format:**
```typescript
interface DropdownOption {
  label: string;      // "HR Transformation (7)"
  value: string;      // "proj-hr-transform-uuid"
  sublabel?: string;  // "7 COINs" (optional, for screen readers)
}
```

**Accessibility:**
- Dropdown has `accessibilityLabel="Project: HR Transformation, 7 COINs"`
- Each option announces project name + coin count

---

### AS-5: Description Entry

**Scenario:** BA adds optional description

**Trigger:** BA taps into Description field

**Steps:**
1. BA taps Description field
2. System focuses field: `descriptionInputRef.current?.focus()`
3. Keyboard shows (if hidden)
4. BA types multiline text:
   ```
   This COIN maps the employee onboarding process from offer 
   acceptance through first day orientation and equipment setup.
   ```
5. System updates state: `setDescription("This COIN maps the...")`
6. Text wraps to multiple lines (multiline: true, numberOfLines: 4)

**Post-condition:** Description entered, stored in state

**Field Specifications:**
- Multiline: Yes
- Initial height: 4 lines (~80pt)
- Max length: 500 characters (enforced, counter shown)
- Placeholder: "Add a description... (optional)"
- Keyboard type: `default` (not `email-address` or `numeric`)
- Return key: `default` (allows newlines)

**Character Counter:**
- Position: Bottom-right of field
- Format: "247 / 500" (current / max)
- Color: secondaryLabel (gray) until > 450, then systemOrange until 500, then systemRed if over
- Updates on every keystroke

**Accessibility:**
- Field has `accessibilityLabel="Description, optional, 247 of 500 characters entered"`
- Counter updates live but doesn't announce on every keystroke (too noisy)

---

### AS-6: Keyboard Handling on iPad

**Scenario:** Keyboard appears and potentially obstructs fields

**Trigger:** Any text field gains focus

**Implementation:**
```typescript
<KeyboardAvoidingView
  behavior="padding"           // Adjust padding when keyboard appears
  keyboardVerticalOffset={0}   // No offset needed for form sheet modal
  style={{ flex: 1 }}
>
  <ScrollView
    keyboardShouldPersistTaps="handled"  // Allow taps while keyboard is up
    keyboardDismissMode="interactive"    // Drag to dismiss keyboard
    contentContainerStyle={{ paddingBottom: 20 }}
  >
    {/* Form fields */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Behavior:**
1. Field gains focus → Keyboard slides up (300ms)
2. If keyboard obstructs field → ScrollView auto-scrolls to keep field visible
3. If keyboard obstructs Create button → ScrollView enables scrolling, button remains accessible below keyboard
4. BA can dismiss keyboard:
   - Tap outside field (taps on backdrop show confirmation, taps on form scroll)
   - Swipe down on keyboard (interactive dismiss)
   - Tap "return" on Name field (goes to Description) or Description field (dismisses)

**Return Key Behavior:**
- **Name field:** returnKeyType: 'next' → Moves focus to Description (skips Project dropdown)
- **Description field:** returnKeyType: 'default' → Allows newlines, does NOT submit form

**Keyboard Toolbar (iOS):**
- System-provided keyboard accessory bar shows:
  - Previous/Next buttons (if implemented)
  - Done button (dismisses keyboard)
- Phase 1: Use native toolbar, no custom implementation needed

---

### AS-7: Orientation Change

**Scenario:** Device rotates while modal is open

**Trigger:** BA rotates iPad from portrait to landscape (or vice versa)

**Steps:**
1. BA enters data: name = "Test COIN", description = "Some text"
2. BA rotates iPad 90° (portrait → landscape)
3. System detects orientation change
4. Modal re-renders:
   - Card dimensions adjust (landscape: wider, shorter)
   - Fields remain visible (no layout breakage)
   - Keyboard adjusts if visible
   - **CRITICAL:** State is preserved (name, description, project all unchanged)
5. Modal continues to work normally in new orientation

**Post-condition:** All entered data preserved, layout adapted

**Layout Behavior:**
```typescript
// Modal card dimensions adapt to orientation
const cardStyle = {
  width: isLandscape ? '70%' : '85%',      // Narrower in landscape
  maxWidth: 600,                            // Cap width on large iPad Pro
  height: 'auto',                           // Let content determine height
  maxHeight: isLandscape ? '85%' : '70%',  // More vertical space in portrait
};
```

**Testing Requirements:**
- Test rotation while keyboard is visible (keyboard re-positions correctly)
- Test rotation with error messages showing (errors remain visible)
- Test rotation with dropdown open (dropdown should close, then reopen)
- Test rotation with duplicate warning showing (warning remains visible)

---

### AS-8: Backdrop Tap Dismissal

**Scenario:** BA taps outside modal to dismiss

**Trigger:** BA taps on semi-transparent backdrop area

**Steps:**
1. BA taps anywhere on backdrop (outside modal card)
2. System checks for unsaved changes (same logic as AS-1)
3. **If no changes:** Modal dismisses immediately (goBack)
4. **If changes exist:** System shows ActionSheet confirmation (AS-1 flow)

**Post-condition:** Modal dismissed OR confirmation shown

**Backdrop Specifications:**
```typescript
<TouchableWithoutFeedback onPress={handleBackdropPress}>
  <View style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',  // 40% opacity black
  }}>
    {/* Modal card positioned absolutely on top */}
  </View>
</TouchableWithoutFeedback>
```

**Accessibility:**
- Backdrop has `accessibilityLabel="Dismiss modal"`
- Backdrop has `accessibilityHint="Double-tap to close the create COIN form"`
- Backdrop tappable area excludes modal card (does not interfere with card interactions)

---

## Business Rules

### BR-1: Name is Required
- **Rule:** Name field cannot be empty or contain only whitespace
- **Validation:** On Create button tap
- **Enforcement:** Create button triggers validation, shows error if fails
- **Error:** Inline below Name field, red border, shake animation + error haptic

### BR-2: Name Maximum Length
- **Rule:** Name cannot exceed 100 characters
- **Enforcement:** TextInput has `maxLength={100}` prop (hard limit, prevents typing beyond)
- **Display:** Character counter shows "47 / 100" below field
- **No error:** Character limit is preventative, not error-based (can't exceed)

### BR-3: Project is Optional
- **Rule:** COIN can be created without project assignment
- **Default:** Dropdown starts at "(No Project)" (null)
- **Implication:** If null, `projectIds: []` (empty array in COIN object)

### BR-4: Description is Optional
- **Rule:** Description can be empty or omitted
- **Validation:** None required
- **Storage:** If empty, stored as `undefined` (not empty string)

### BR-5: Description Maximum Length
- **Rule:** Description cannot exceed 500 characters
- **Enforcement:** TextInput has `maxLength={500}` prop
- **Display:** Character counter "247 / 500" below field

### BR-6: Project Dropdown Filtering
- **Rule:** Only Active projects appear in dropdown
- **Implementation:** `const activeProjects = allProjects.filter(p => p.status === 'Active')`
- **Sorting:** Projects sorted alphabetically by name
- **COIN Count:** Each option shows current COIN count in project

### BR-7: Duplicate Names Allowed (with Warning)
- **Rule:** System allows duplicate COIN names within a project
- **Rationale:** BAs may want "Sprint 1 Planning", "Sprint 2 Planning", etc.
- **Warning:** System shows informational warning (AS-3) but does not block
- **Uniqueness:** COIN IDs are unique (UUID v4), names are not

### BR-8: Auto-Generated Fields
- **Rule:** System auto-generates these fields (BA does NOT enter):
  - `id`: UUID v4
  - `createdAt`, `modifiedAt`: ISO 8601 timestamp
  - `createdBy`, `lastModifiedBy`: "local-user" (Phase 1)
  - `dataModelVersion`: "2.0"
  - `status`: Always "Draft" on creation
  - `participants`, `interactions`, `products`: Empty arrays
  - `participantCount`, `interactionCount`, `productCount`: 0

### BR-9: Validation is Inline
- **Rule:** Validation errors appear inline below field, NOT in global alert
- **Rationale:** Less disruptive, clearer association with field
- **Styling:** Red border, red text, alert icon, shake animation, error haptic

### BR-10: Modal is Non-Blocking for Other Tabs
- **Rule:** Modal covers tab bar, but tab state is preserved
- **Implementation:** When modal dismisses, underlying tab is unchanged
- **Example:** If BA was on Projects tab, tapped "+", then cancels, they return to Projects tab (not Recents)

---

## UI/UX Specifications

### Visual Design

**Modal Card:**
```typescript
{
  backgroundColor: 'systemBackground',      // White in light mode, dark in dark mode
  borderRadius: 16,                         // Rounded corners (iOS 13+ standard)
  shadowColor: 'black',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 16,                            // Android shadow (N/A on iOS but include)
}
```

**Modal Header:**
```typescript
{
  height: 56,                               // Standard iOS nav bar height
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  borderBottomWidth: 0.5,
  borderBottomColor: 'separator',           // System separator color
}
```

**Cancel Button:**
```typescript
<TouchableOpacity 
  onPress={handleCancelPress}
  style={{
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 44,                           // Minimum touch target
    minHeight: 44,
    justifyContent: 'center',
  }}
  accessibilityLabel="Cancel"
  accessibilityRole="button"
  accessibilityHint="Dismiss this form without creating a COIN"
>
  <Text style={{
    fontSize: 17,
    color: 'systemBlue',
    fontWeight: '400',
  }}>
    Cancel
  </Text>
</TouchableOpacity>
```

**Modal Title:**
```typescript
<Text style={{
  fontSize: 17,
  fontWeight: '600',
  color: 'label',                           // Primary text color
  textAlign: 'center',
}}>
  New COIN
</Text>
```

**Form Field Label:**
```typescript
<Text style={{
  fontSize: 15,
  fontWeight: '600',
  color: 'label',
  marginBottom: 6,
}}>
  Name <Text style={{ color: 'systemRed' }}>*</Text>
</Text>
```

**Text Input:**
```typescript
<TextInput
  style={{
    height: 44,
    backgroundColor: 'secondarySystemBackground',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 17,
    color: 'label',
    borderWidth: 1,
    borderColor: nameError ? 'systemRed' : 'separator',
  }}
  placeholder="Enter COIN name"
  placeholderTextColor="placeholderText"
  autoCapitalize="words"
  autoCorrect={true}
  returnKeyType="next"
  maxLength={100}
  accessibilityLabel="COIN name"
  accessibilityRequired={true}
/>
```

**Error Message:**
```typescript
{nameError && (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  }}
  accessibilityRole="alert"
  accessibilityLiveRegion="polite"
  >
    <Icon name="exclamationcircle" size={16} color="systemRed" />
    <Text style={{
      fontSize: 13,
      color: 'systemRed',
      marginLeft: 6,
    }}>
      {nameError}
    </Text>
  </View>
)}
```

**Create Button:**
```typescript
<TouchableOpacity
  style={{
    height: 50,
    backgroundColor: isCreating || !name.trim() ? 'quaternaryLabel' : 'systemBlue',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    opacity: isCreating || !name.trim() ? 0.5 : 1.0,
  }}
  onPress={handleCreate}
  disabled={isCreating || !name.trim()}
  accessibilityLabel="Create COIN and open editor"
  accessibilityRole="button"
  accessibilityState={{ disabled: !name.trim(), busy: isCreating }}
>
  {isCreating ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={{
      fontSize: 17,
      fontWeight: '600',
      color: 'white',
    }}>
      Create
    </Text>
  )}
</TouchableOpacity>
```

### Touch Targets
- **Minimum size:** 44×44pt (Apple HIG recommendation)
- **Comfortable size:** 50×50pt (use for primary actions)
- **Spacing:** 8pt minimum between tappable elements
- **Create button:** 50pt height (full-width, prominent)
- **Cancel button:** 44×44pt minimum (text button with padding)

### Animations

**Modal Open (Form Sheet):**
```typescript
// Per Navigation Architecture: Form sheet zooms + fades in
{
  presentation: 'formSheet',
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      },
    },
  },
}
```

**Field Shake (Error):**
```typescript
const shakeAnimation = useRef(new Animated.Value(0)).current;

const triggerShake = () => {
  Animated.sequence([
    Animated.timing(shakeAnimation, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimation, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimation, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimation, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]).start();
};

// Apply to field
<Animated.View
  style={{
    transform: [{ translateX: shakeAnimation }],
  }}
>
  <TextInput {...} />
</Animated.View>
```

### Haptic Feedback

**Success (COIN Created):**
```typescript
import * as Haptics from 'expo-haptics';

Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
```

**Error (Validation Failed):**
```typescript
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Error
);
```

**Selection (Project Picker Change):**
```typescript
Haptics.selectionAsync();
```

### Dark Mode Support

All colors use iOS semantic colors that adapt automatically:
- `systemBackground` → White (light), Dark Gray (dark)
- `secondarySystemBackground` → Light Gray (light), Medium Gray (dark)
- `label` → Black (light), White (dark)
- `secondaryLabel` → Gray (both modes)
- `systemBlue` → Blue (adapts brightness)
- `systemRed` → Red (adapts brightness)
- `separator` → Light Gray (light), Dark Gray (dark)

**Testing:** Run app in both light and dark mode, verify contrast ratios meet WCAG 2.1 AA (4.5:1 for text)

---

## Accessibility (VoiceOver)

### Screen Reader Announcements

**Modal Opens:**
- Announces: "New COIN, form" (modal title + role)
- Focus: Automatically moves to Name field

**Field Labels:**
- Name: "COIN name, required, text field"
- Project: "Project, optional, popup button, currently selected: No Project"
- Description: "Description, optional, text field, 0 of 500 characters"

**Error Announcements:**
- Error message appears → VoiceOver announces immediately: "Alert: Name is required"
- Uses `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"`

**Button States:**
- Create button disabled: "Create COIN, button, dimmed, unavailable"
- Create button enabled: "Create COIN and open editor, button"
- Create button busy: "Create COIN, button, busy"

### Keyboard Navigation

**Tab Order:**
1. Cancel button
2. Name field
3. Project dropdown
4. Description field
5. Create button

**Focus Indicators:**
- All interactive elements show blue focus ring when selected via keyboard
- Focus ring: 2pt width, systemBlue color, 4pt offset from element

### Dynamic Type Support

**Font Sizes:**
- Use iOS Dynamic Type: `fontSize: UIFontTextStyleBody` (17pt default)
- All text scales with user's accessibility text size preference
- Test at: Default, Large, Extra Large, XXL, XXXL

**Layout Adaptation:**
- If text size increases, increase field heights proportionally
- If text size increases, Create button may need to be taller
- Ensure labels don't truncate (wrap to multiple lines if needed)

---

## Performance Requirements

### Target Metrics (Per Navigation Architecture Appendix C)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Modal open time | < 300ms | Tap "+" to modal fully visible |
| Auto-focus time | < 100ms | Modal visible to Name field focused |
| Create + save | < 500ms | Tap Create to COIN saved |
| Navigation to editor | < 300ms | Modal dismiss to editor open |
| **Total flow** | < 1.5 sec | "+" tap to editor canvas visible |

### Optimization Strategies

**Avoid Blocking Operations:**
- Load projects list in background (useEffect on mount)
- Use async/await for all storage operations
- Don't block UI thread during COIN creation

**Minimize Re-renders:**
- Use `React.memo()` for static sub-components
- Use `useCallback()` for event handlers passed as props
- Don't create inline functions in render (hoist to component level)

**Debounce Expensive Operations:**
- Duplicate name check: 500ms debounce (AS-3)
- Character count updates: Immediate (cheap operation)

**Native Driver for Animations:**
```typescript
// Use native driver for better performance
Animated.timing(shakeAnimation, {
  toValue: 10,
  duration: 50,
  useNativeDriver: true,  // ← Runs on native thread, 60fps guaranteed
});
```

---

## Testing Strategy

### Unit Tests

**Validation Logic:**
```typescript
describe('validateForm', () => {
  it('should return error if name is empty', () => {
    expect(validateForm('')).toEqual({ error: 'Name is required' });
  });
  
  it('should return error if name is only whitespace', () => {
    expect(validateForm('   ')).toEqual({ error: 'Name cannot be blank' });
  });
  
  it('should return success if name is valid', () => {
    expect(validateForm('Test COIN')).toEqual({ success: true });
  });
});
```

**COIN Creation Logic:**
```typescript
describe('createCOIN', () => {
  it('should generate UUID v4 for id', async () => {
    const coin = await createCOIN('Test', null, '');
    expect(coin.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
  
  it('should set status to Draft', async () => {
    const coin = await createCOIN('Test', null, '');
    expect(coin.status).toBe('Draft');
  });
  
  it('should set projectIds to empty array if no project', async () => {
    const coin = await createCOIN('Test', null, '');
    expect(coin.projectIds).toEqual([]);
  });
  
  it('should set projectIds to array with projectId if provided', async () => {
    const coin = await createCOIN('Test', 'proj-123', '');
    expect(coin.projectIds).toEqual(['proj-123']);
  });
});
```

### Integration Tests

**Full Create Flow:**
```typescript
describe('CreateCOINModal Integration', () => {
  it('should create COIN and navigate to editor', async () => {
    const { getByLabelText, getByText } = render(<CreateCOINModal visible={true} />);
    
    // Enter name
    const nameInput = getByLabelText('COIN name');
    fireEvent.changeText(nameInput, 'Test COIN');
    
    // Tap create
    const createButton = getByText('Create');
    fireEvent.press(createButton);
    
    // Wait for async operations
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('COINEditor', {
        coinId: expect.any(String),
        mode: 'create',
      });
    });
  });
});
```

### Manual Testing on iPad

**Test Scenarios (All 8 alternate scenarios + main scenario):**
1. ✅ MS-1: Create minimal COIN (name only)
2. ✅ AS-1: Cancel with confirmation
3. ✅ AS-2: Name validation error
4. ✅ AS-3: Duplicate name warning
5. ✅ AS-4: Project selection
6. ✅ AS-5: Description entry
7. ✅ AS-6: Keyboard handling
8. ✅ AS-7: Orientation change
9. ✅ AS-8: Backdrop tap dismissal

**Device Testing:**
- iPad Pro 12.9" (2022) - Portrait and Landscape
- iPad Air (2020) - Portrait and Landscape
- iPad Mini (2021) - Portrait only (test small screen)

**Accessibility Testing:**
- Enable VoiceOver → Navigate entire form by swiping
- Test with Extra Large text size (Dynamic Type XXL)
- Test with high contrast mode enabled
- Test with reduced motion enabled (animations should still work, just gentler)

### Performance Testing

**Measure Timings:**
```typescript
const startTime = performance.now();
// ... operation ...
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

**Profiling:**
- Use React DevTools Profiler to find slow re-renders
- Use Xcode Instruments to measure memory usage
- Use Flipper to debug async storage operations

---

## Known Issues & Workarounds

### Issue 1: iOS Picker vs Dropdown on iPad

**Problem:** React Native `Picker` component looks native on iPhone (wheel picker) but awkward on iPad (full-screen modal)

**Workaround (Phase 1):** Use React Native `Picker` despite iPad awkwardness
- Acceptable for Phase 1 MVP
- Phase 2: Replace with custom dropdown component (react-native-modal-dropdown or custom)

**Implementation:**
```typescript
import { Picker } from '@react-native-picker/picker';

<Picker
  selectedValue={selectedProjectId}
  onValueChange={(itemValue) => setSelectedProjectId(itemValue)}
  style={{
    height: 44,
    backgroundColor: 'secondarySystemBackground',
  }}
  itemStyle={{
    fontSize: 17,
    color: 'label',
  }}
>
  <Picker.Item label="(No Project)" value={null} />
  {projects.map(p => (
    <Picker.Item 
      key={p.id} 
      label={`${p.name} (${p.coinCount})`} 
      value={p.id} 
    />
  ))}
</Picker>
```

### Issue 2: Keyboard Dismissal on Backdrop Tap

**Problem:** Tapping backdrop should show confirmation, but if keyboard is visible, it dismisses keyboard first (iOS behavior)

**Workaround:** Two-tap behavior is acceptable
- First tap: Dismisses keyboard (native iOS behavior, cannot override)
- Second tap: Shows confirmation sheet
- BAs learn this pattern quickly

### Issue 3: Modal Presentation on React Navigation 6

**Problem:** React Navigation 6 changed modal presentation options, old `mode="modal"` deprecated

**Solution:** Use `presentation` option in `options`:
```typescript
<Stack.Screen 
  name="CreateCOIN" 
  component={CreateCOINModal}
  options={{
    presentation: 'formSheet',  // NEW API
    // NOT: mode="modal" (deprecated)
  }}
/>
```

### Issue 4: Form Sheet Modal Width on Large iPad Pro

**Problem:** 85% width looks too wide on 12.9" iPad Pro in landscape (huge card)

**Solution:** Cap modal width at 600pt:
```typescript
const cardStyle = {
  width: isLandscape ? '70%' : '85%',
  maxWidth: 600,  // ← Caps width on large screens
};
```

---

## Edge Cases

### Edge Case 1: No Active Projects

**Scenario:** BA opens Create COIN modal, but no active projects exist (all archived)

**Handling:**
- Dropdown shows only "(No Project)" option
- Dropdown is still interactive (can tap, but only one option)
- No error or warning shown (valid state)
- BA can still create COIN (projectIds: [])

### Edge Case 2: Very Long Project Names

**Scenario:** Project name is "Annual Financial Planning and Budget Allocation for Fiscal Year 2026" (too wide for dropdown)

**Handling:**
- Truncate with ellipsis: "Annual Financial Planning and..."
- Full name shown on selected value (wraps if needed)
- Accessible label contains full name for VoiceOver

### Edge Case 3: Storage Write Failure

**Scenario:** AsyncStorage.setItem() throws error (storage full, permissions issue, etc.)

**Handling:**
```typescript
try {
  await COINRepository.save(newCOIN);
  // Success
} catch (error) {
  // Rollback UI state
  setIsCreating(false);
  
  // Show alert
  Alert.alert(
    'Failed to Create COIN',
    'There was a problem saving your COIN. Please try again.',
    [{ text: 'OK', onPress: () => nameInputRef.current?.focus() }]
  );
  
  // Log error for debugging
  console.error('Failed to save COIN:', error);
  
  // Haptic feedback
  Haptics.notificationAsync(NotificationFeedbackType.Error);
}
```

### Edge Case 4: Navigation Fails (COINEditor screen doesn't exist yet)

**Scenario:** UC-110 (COIN Editor) not implemented yet, navigate() throws error

**Handling:**
```typescript
try {
  navigation.goBack();
  navigation.navigate('COINEditor', { coinId: newCOIN.id });
} catch (error) {
  console.error('Failed to navigate to editor:', error);
  
  // Fallback: Just close modal, show success alert
  Alert.alert(
    'COIN Created',
    `"${newCOIN.name}" has been created. Editor not available yet.`,
    [{ text: 'OK' }]
  );
}
```

### Edge Case 5: Duplicate Name Check Race Condition

**Scenario:** BA types name, selects project, types more, debounce timers overlap

**Handling:**
- useEffect cleanup function cancels previous timeout
- Only the latest debounce timer fires
- No stale warnings shown

```typescript
useEffect(() => {
  // ... duplicate check logic ...
  
  const timeoutId = setTimeout(async () => {
    // Check for duplicate
  }, 500);
  
  return () => clearTimeout(timeoutId);  // ← Cleanup cancels previous timer
}, [name, selectedProjectId]);
```

---

## Phase 2/3 Considerations

### Phase 2: Web Application (Stakeholder Review)

**Platform:** React (web, NOT React Native)  
**Presentation:** Browser-based modal dialog (NOT native iOS modal)  
**Implementation:** Separate component for web (`CreateCOINDialog.tsx`)

**Key Differences:**
- Uses HTML `<dialog>` element or custom modal component
- Uses `<input>` and `<textarea>` (NOT TextInput)
- Uses CSS for styling (NOT StyleSheet)
- Uses `<select>` dropdown (NOT Picker)
- Mouse interactions (hover states, focus styles)
- Browser navigation (URL routing, back button)
- Entry point: "New COIN" button in web app toolbar

**Shared Code (Monorepo):**
```typescript
// packages/shared/types/ - Used by BOTH platforms
export interface COIN { ... }
export interface Project { ... }

// packages/shared/validation/ - Used by BOTH platforms
export function validateCOINName(name: string): ValidationResult { ... }

// packages/ipad-app/src/screens/CreateCOINModal.tsx - React Native
import { COIN } from '@shared/types';
import { Modal, TextInput } from 'react-native';

// packages/web-app/src/components/CreateCOINDialog.tsx - React DOM
import { COIN } from '@shared/types';
import { Dialog, Input } from '@/components/ui';
```

**Platform Differences:**
- iPad: Native iOS sheet, touch gestures, haptic feedback, on-screen keyboard
- Web: Browser dialog, mouse interactions, no haptics, standard keyboard
- **Same:** Business logic, validation rules, data models, repository interface

### Phase 3 (Advanced Features - Both Platforms)

- **Tags field:** Add optional tags for cross-cutting categorization
- **Custom fields:** Allow org-specific metadata fields in creation form
- **Duplicate COIN:** "Save As" flow to create copy with modified metadata
- **Batch creation:** Create multiple COINs rapidly from template or import
- **Version Control:** dataModelVersion field supports future schema migrations
- **Audit Trail:** accessLog tracks all creation events for compliance
- **Multi-project:** projectIds array allows assignment to multiple projects

**Architecture Notes for Future:**
- Modal component pattern reusable for other creation flows
- Form fields extractable as reusable components  
- Validation logic centralized for consistency (packages/shared/validation/)
- Project dropdown logic shared with UC-130 (Edit Metadata)
- Repository abstraction enables easy Phase 2/3 upgrades

---

## Acceptance Criteria Summary

**Must Pass All These Before UC-100 is Considered Complete:**

### Critical Path (Main Success Scenario):
1. ✅ Can open modal from Recents screen "+" button
2. ✅ Modal presents as form sheet (centered, zoom+fade animation)
3. ✅ Name field auto-focuses with keyboard
4. ✅ Can enter COIN name
5. ✅ Can create COIN with only name (minimal path)
6. ✅ Created COIN persists to AsyncStorage
7. ✅ Modal dismisses after creation
8. ✅ Navigation to COINEditor works
9. ✅ Editor opens with empty canvas
10. ✅ New COIN appears in Recents list

### Alternate Scenarios:
11. ✅ AS-1: Cancel with confirmation works
12. ✅ AS-2: Name validation error shows
13. ✅ AS-3: Duplicate name warning appears
14. ✅ AS-4: Project selection works
15. ✅ AS-5: Description entry works
16. ✅ AS-6: Keyboard handling smooth
17. ✅ AS-7: Orientation change preserves data
18. ✅ AS-8: Backdrop tap dismissal works

### Quality Standards:
19. ✅ Modal animations smooth (60fps, 300ms duration)
20. ✅ Keyboard appears immediately (<100ms)
21. ✅ Create+save operation fast (<500ms)
22. ✅ Touch targets meet 44×44pt minimum
23. ✅ Works in both portrait and landscape
24. ✅ VoiceOver support functional (all labels, announcements)
25. ✅ Dynamic Type support (text scales correctly)
26. ✅ Dark mode support (colors adapt)
27. ✅ Haptic feedback on errors and success
28. ✅ No data loss on rotation
29. ✅ Validation errors clear and actionable
30. ✅ Follows Navigation Architecture form sheet pattern

### Navigation Integration:
31. ✅ Integrates correctly with Global Modal Stack
32. ✅ Tab bar hidden when modal presented
33. ✅ Tab state preserved when modal dismisses
34. ✅ Navigation to editor uses correct pattern (goBack then navigate)
35. ✅ Backdrop dismissal respects Navigation Architecture rules

**Chuck's Approval Required:** Test all scenarios on actual iPad before marking UC-100 as complete.

---

## Implementation Notes for Claude Code

### Start Here:

1. **Create Modal Component File:** `src/screens/CreateCOINModal.tsx`
2. **Import Required Dependencies:** 
   - React, React Native components (Modal, TextInput, etc.)
   - React Navigation hooks (`useNavigation`)
   - Shared types from `@shared/types`
   - Repository from `@/repositories`
   - expo-haptics
3. **Define Navigation Types:**
```typescript
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  CreateCOIN: { returnTo?: string };
  COINEditor: { coinId: string; mode: 'create' | 'edit' };
};

type CreateCOINNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateCOIN'>;
```
4. **Implement State Management:** All useState hooks as listed in State Management section
5. **Implement Validation Logic:** validateForm function as specified
6. **Implement Create Handler:** handleCreate function as specified
7. **Build Component JSX:** Follow component structure tree (form sheet modal, not bottom sheet)
8. **Style with StyleSheet:** Modal card, form fields, buttons, error states
9. **Add Keyboard Handling:** KeyboardAvoidingView, ScrollView, auto-focus
10. **Add Navigation Integration:** Entry point in RecentsScreen, exit point to COINEditor
11. **Test on iPad:** All scenarios, both orientations, VoiceOver

### Code Style Guidelines:

- Use TypeScript for all code
- Use functional components with hooks
- Use StyleSheet.create for styles (not inline styles)
- Use async/await for asynchronous operations
- Use meaningful variable names
- Add comments for complex logic (especially navigation flow)
- Use constants for repeated values (animation durations, colors, etc.)
- Keep component under 500 lines (extract sub-components if needed)

### Common Pitfalls to Avoid:

- ❌ Don't use bottom sheet modal (use form sheet per Navigation Architecture)
- ❌ Don't use setTimeout for keyboard without cleanup (use useEffect return)
- ❌ Don't forget to trim whitespace from Name before validation
- ❌ Don't use Modal without proper backdrop press handling
- ❌ Don't hardcode colors (use iOS semantic colors)
- ❌ Don't forget haptic feedback on errors and success
- ❌ Don't skip VoiceOver labels and accessibility roles
- ❌ Don't forget to test on actual iPad hardware
- ❌ Don't forget navigation integration with Global Modal Stack
- ❌ Don't push to editor (use modal navigate pattern)

---

## Questions for Clarification (If Needed)

If Claude Code encounters ambiguity:

1. **Keyboard Accessory Bar:** Should we implement a custom toolbar or use the native keyboard?
   - *Recommendation:* Start with native keyboard for Phase 1, custom toolbar if needed in iteration.

2. **Project COIN Count Badges:** Where does ProjectRepository get COIN counts?
   - *Recommendation:* Calculate on-the-fly from COINRepository.findAll() filtered by projectId, OR store coinCount on Project object (preferred).

3. **Duplicate Name Check Timing:** Should we check on every keystroke or debounced?
   - *Specification Says:* Debounced 500ms (implemented in AS-3 scenario).

4. **Modal Background Dismiss:** Should tapping background always show confirmation?
   - *Specification Says:* Yes, same flow as Cancel button IF there are unsaved changes (AS-8 scenario).

5. **Error Message Positioning:** Inline below field or global alert?
   - *Specification Says:* Inline below field (BR-9: Validation is Inline).

6. **Navigation Pattern:** Bottom sheet or form sheet modal?
   - *Specification Says:* Form sheet (per Navigation Architecture Section 4.1).

---

## Version History

**v1.1** (October 22, 2025) - **CURRENT**
- ✅ Aligned with Navigation Architecture Specification
- ✅ Changed modal pattern from bottom sheet to form sheet (centered card, zoom+fade)
- ✅ Clarified Global Modal Stack integration
- ✅ Updated navigation trigger (headerRight button in RecentsScreen)
- ✅ Updated navigation exit (goBack then navigate to editor)
- ✅ Added dismissal patterns (backdrop tap, confirmation rules)
- ✅ Clarified modal presentation options for React Navigation 6
- ✅ Enhanced accessibility specifications (VoiceOver labels, announcements)
- ✅ Added navigation type definitions
- ✅ Updated acceptance criteria to include navigation integration
- ✅ Added edge case for navigation failure handling
- ✅ Enhanced implementation notes with navigation guidance

**v1.0** (October 23, 2025)
- Initial specification created from UC-100 Elaboration v1.0
- Comprehensive technical guidance for Claude Code
- All 8 scenarios covered with implementation details
- iPad-specific considerations documented
- Complete acceptance criteria checklist provided
- Testing strategy defined
- Known issues and workarounds included

---

## Success Metrics

**Implementation Complete When:**
- All acceptance criteria pass (35+ items checked)
- All 10 manual testing scenarios pass (MS-1 + AS-1 through AS-8 + edge cases)
- Performance meets targets (modal open <300ms, create <500ms, navigation <300ms)
- Keyboard handling feels natural on actual iPad
- Navigation integration follows Architecture spec patterns
- Chuck approves implementation on real device

**Quality Indicators:**
- Zero crashes during testing
- Smooth animations throughout (no jank, 60fps)
- Validation feedback immediate and clear
- Works flawlessly in both orientations
- Feels native to iOS (not web-ported)
- Creates COIN in <1 second total from "+" tap
- Navigation flow seamless (modal → editor transition clean)
- Tab bar hides/shows correctly during modal lifecycle

---

## Summary for Claude Code

**What to Build:**
Modal form sheet for creating new COIN diagrams with Name (required), Project (optional), and Description (optional) fields. Modal appears as centered card (form sheet) following iOS conventions, auto-focuses Name field with keyboard, validates input, and navigates to empty COIN Editor canvas on successful creation.

**Key Technologies:**
- React Native Modal with `presentation: 'formSheet'`
- React Navigation 6 (Global Modal Stack)
- TextInput with auto-focus and keyboard handling
- Picker/Dropdown for project selection
- AsyncStorage via COINRepository
- React Navigation (goBack + navigate pattern)
- expo-haptics (validation feedback)

**Critical Requirements:**
- Form sheet modal presentation (centered card, zoom+fade animation)
- Auto-focus Name field on modal open
- Keyboard appears immediately
- Inline validation with shake animation + haptic
- Cancellation requires confirmation (if changes exist)
- Works in portrait and landscape
- All animations 60fps (use native driver)
- Touch targets ≥44×44pt
- Follows Navigation Architecture patterns exactly

**Implementation Pattern:**
RecentsScreen "+" button → Global Modal Stack → CreateCOIN form sheet → Validate → Create COIN → Save to storage → Close modal → Navigate to COINEditor → Update Recents list

**Test Focus:**
- All 9 scenarios from elaboration work correctly (MS-1 + AS-1 through AS-8)
- Keyboard handling feels natural (show/hide/re-show)
- Orientation changes preserve data
- Validation feedback is clear and immediate
- Create → Editor → Recents flow is seamless
- Navigation follows Architecture spec (form sheet, not bottom sheet)
- Tab bar visibility correct throughout modal lifecycle

---

**This specification provides everything needed to implement UC-100: Create New COIN for iPad, aligned with the Navigation Architecture Specification. Follow iOS form sheet modal conventions, prioritize speed and simplicity, and focus on frictionless creation that supports live BA facilitation workflows.**

---

**END OF SPECIFICATION**
