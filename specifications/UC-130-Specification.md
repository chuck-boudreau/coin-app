# UC-130 Specification: Edit COIN Metadata
**For Claude Code Implementation**

**Specification Version:** 2.0  
**Created:** October 22, 2025  
**Updated:** October 22, 2025 (Comprehensive revision)  
**Platform:** React Native (iPad - Phase 1)  
**Wave:** Wave 1  
**Target:** Expo + React Native + TypeScript  

---

## Source Use Case

**UC-130: Edit the Name and Metadata for a COIN**  
Location: `UC-130-Edit-COIN-Metadata-Elaboration.md` (POC version)

**Summary:** Business Analysts frequently need to refine COIN organization after creation—moving COINs between projects, updating descriptions, or changing status as work evolves. This feature provides a lightweight metadata editor accessible from any COIN card, enabling organizational refinement without the cognitive overhead of opening the full canvas editor.

**Why This Matters (Research-Based):**
- **Context switching costs 9-23 minutes** to regain full focus (academic studies cited in Organizational Patterns research)
- BAs work on **1-3 concurrent projects** with **3-7 COINs per project**, requiring frequent reorganization
- **Metadata-based organization beats deep folder nesting** (SharePoint best practice) - flexible project assignment is critical
- **Quick edits should stay quick** - Don't force full editor open for simple name/project changes
- **Episodic work patterns** mean BAs return after weeks/months and need to immediately reorganize outdated categorization

**Note:** This specification is created from the POC elaboration and enhanced with comprehensive research. A full re-elaboration matching UC-200 quality standards will occur in a future session, but this implementation spec is production-ready.

---

## Implementation Overview

Create a **form sheet modal** for editing COIN metadata, accessible via info/edit actions on COIN cards in both UC-200 (Recents) and UC-201 (Projects). The modal presents a focused form with inline validation, immediate visual feedback, and safe save/cancel flows.

**Key Requirements:**
- **Form sheet modal presentation** (iOS standard for quick data entry)
- **Editable fields:** Name (required), Description (optional), Project (optional), Status (Phase 1)
- **Project picker:** Action sheet with "None" option for root-level COINs
- **Status picker:** Visual badges matching UC-200 status indicators
- **Inline validation:** Real-time feedback without blocking
- **Unsaved changes protection:** Confirmation on cancel/dismiss
- **Immediate updates:** Changes reflected in calling screen instantly
- **Keyboard-optimized:** Auto-focus, proper return keys, toolbar
- **60fps animations:** Native driver for all transitions

---

## Research Context & Design Rationale

### Organizational Patterns Research Application

**Flat Hierarchies with Rich Metadata:**
Modern document management (SharePoint, Google Drive) recommends **flat structures with metadata-driven organization** over deep folder nesting. UC-130 supports this by:
- Allowing COINs at root level (no project required)
- One-to-many project-to-COIN relationship (1 project → 3-5 COINs)
- Easy reassignment between projects
- Optional project field reduces creation friction

**Status-Based Filtering as First-Class Feature:**
BAs conceptualize work through lifecycle stages: Draft → Review → Approved → Archived. UC-130 makes status editing prominent with:
- Visual status badges (color-coded)
- Quick status changes without full editor
- Matches UC-200's status badge system

**BA Work Reality:**
- **2-4 major projects annually** in consulting environments
- **5-13 formal deliverables per project** (waterfall) or **3-7 deliverables** (agile)
- **20-50 supporting work products** including diagrams
- Projects transition through clear lifecycle stages requiring metadata updates

### iOS Conventions

**Form Sheet Modal Standard:**
- Settings app uses form sheets for quick configuration
- Reminders app uses form sheets for "Edit List" functionality
- Centered card on iPad, respects safe areas
- Dismissible but requires explicit action (save/cancel)

**Keyboard-First Design:**
- iPad users expect auto-focus on first field
- Hardware keyboard shortcuts (Cmd+S, Cmd+W, Esc)
- Return key navigation between fields
- Keyboard toolbar with "Done" button

---

## Technical Architecture

### Screen Component
**`EditCOINMetadataScreen.tsx`** - Form sheet modal screen
- React Navigation modal with `presentation: 'formSheet'`
- Form state management with controlled inputs
- Real-time validation with error state
- Keyboard event handling
- Coordinates with COINRepository and ProjectRepository
- Implements usePreventRemove for unsaved changes protection

### Key Components

**`MetadataForm`** - Form container and coordinator
- Props: `coin: COIN`, `projects: Project[]`, `onSave: (data) => Promise<void>`, `onCancel: () => void`
- Manages form state via useState hook
- Validates on blur and submit
- Tracks dirty state for unsaved changes detection
- Handles keyboard show/hide events
- Provides context to child form components

**`NameInput`** - Required text input with validation
- TextInput with label and error display
- Required field indicator (red asterisk)
- Character limit: 100 characters
- Auto-focus on modal open
- Clears error on typing
- Shows character counter when near limit (>80 characters)
- Trim whitespace on blur
- iOS clear button (X) when text present

**`DescriptionInput`** - Optional multi-line text input
- TextInput with multiline enabled
- Auto-expanding height: 3 lines (75pt) to 6 lines (150pt)
- Character limit: 500 characters
- Live character counter: "0/500" (always visible)
- Counter color: gray (0-400), amber (401-480), red (481-500)
- Scrollable when exceeds max height
- Placeholder: "Add a description..."

**`ProjectPicker`** - Project selection with action sheet
- Current value display: Project name or "None" in gray
- Tap opens ActionSheetIOS with project list
- Shows "None" option at top (remove project assignment)
- All projects listed alphabetically
- "Cancel" option at bottom
- Selected project shows checkmark (if opened again)
- Disabled state if no projects exist
- Visual indicator: chevron.down SF Symbol

**`StatusPicker`** - Status selection with visual badges
- Current status badge display (color + icon)
- Tap opens ActionSheetIOS with status options
- Each option shows badge preview in sheet
- Status options:
  - Draft (gray circle + clock icon)
  - Review (amber circle + dot icon)
  - Approved (green circle + checkmark icon)
  - Archived (light gray + archive icon)
- Matches UC-200 status badge styling exactly

**`FormActions`** - Save/Cancel button group
- Two-button layout: Cancel (left), Save (right)
- Cancel button: Secondary style, always enabled
- Save button: Primary style, disabled when invalid
- Loading state: Spinner replaces text, buttons disabled
- Haptic feedback on press
- Proper touch targets (minimum 44x44pt)

### Services

**`COINRepository`** (existing, enhanced)
- `update(coinId: string, updates: Partial<COIN>): Promise<COIN>` - Updates COIN in AsyncStorage
- `getById(id: string): Promise<COIN | null>` - Fetches COIN for editing
- `validateNameUnique(name: string, excludeId?: string): Promise<boolean>` - Checks name uniqueness (optional, Phase 2)
- Emits `coinUpdated` event after successful update
- Event payload: `{ coinId: string, updates: Partial<COIN>, fullCOIN: COIN }`

**`ProjectRepository`** (existing from UC-201)
- `getAll(): Promise<Project[]>` - Fetches all projects for picker
- Returns array sorted alphabetically by name
- Used by ProjectPicker component

**`AccessHistoryService`** (existing from UC-200)
- **Does NOT** record access on metadata edit
- Metadata editing is not the same as opening/viewing COIN
- Only UC-110 (COIN Editor) records access events

### Data Models

```typescript
import { COIN, Project, COINStatus } from '@shared/types';

// Navigation params
type EditCOINMetadataParams = {
  coinId: string;
  returnScreen: 'Recents' | 'Projects' | 'ProjectDetail';
  suggestedProjectId?: string;  // Optional: Pre-select project from context
};

// Form state
interface EditMetadataFormData {
  name: string;
  description: string;
  projectId: string | null;
  status: COINStatus;
}

interface EditMetadataFormErrors {
  name?: string;
  description?: string;
  projectId?: string;
  status?: string;
}

interface EditMetadataFormState {
  data: EditMetadataFormData;
  errors: EditMetadataFormErrors;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;  // Initial load
}

// Repository update payload
interface COINUpdatePayload {
  name?: string;
  description?: string;
  projectId?: string | null;
  status?: COINStatus;
  lastModified?: string;  // ISO 8601 timestamp
}

// Status enum (from shared types)
enum COINStatus {
  Draft = 'draft',
  Review = 'review',
  Approved = 'approved',
  Archived = 'archived',
}

// Status display configuration
interface StatusConfig {
  label: string;
  color: string;
  icon: string;  // SF Symbol name
  accessibilityLabel: string;
}

const STATUS_CONFIGS: Record<COINStatus, StatusConfig> = {
  [COINStatus.Draft]: {
    label: 'Draft',
    color: '#8E8E93',      // iOS gray
    icon: 'clock.fill',
    accessibilityLabel: 'Draft status',
  },
  [COINStatus.Review]: {
    label: 'Review',
    color: '#FF9500',      // iOS amber
    icon: 'circle.fill',
    accessibilityLabel: 'In review status',
  },
  [COINStatus.Approved]: {
    label: 'Approved',
    color: '#34C759',      // iOS green
    icon: 'checkmark.circle.fill',
    accessibilityLabel: 'Approved status',
  },
  [COINStatus.Archived]: {
    label: 'Archived',
    color: '#C7C7CC',      // iOS light gray
    icon: 'archivebox.fill',
    accessibilityLabel: 'Archived status',
  },
};
```

---

## Detailed Requirements

### Navigation Integration

**Modal Presentation (from Navigation Architecture Spec):**

UC-130 is a **Global Modal** in the navigation hierarchy:
```
Global Modal Stack (overlays tabs)
├── COINEditorScreen (modal, full-screen)
├── CreateProjectScreen (modal, form sheet)
├── EditCOINMetadataScreen (modal, form sheet) ← UC-130
├── ParticipantLibraryScreen (modal, form sheet)
└── SettingsScreen (modal, form sheet)
```

**Navigation Configuration:**
```typescript
// In root stack navigator (App.tsx or Navigation.tsx)
<Stack.Navigator
  screenOptions={{
    presentation: 'modal',
    gestureEnabled: true,
  }}
>
  {/* Other screens */}
  
  <Stack.Screen
    name="EditCOINMetadata"
    component={EditCOINMetadataScreen}
    options={({route}) => ({
      presentation: 'formSheet',           // ⭐ Form sheet (not full screen)
      headerShown: true,
      headerTitle: 'Edit Details',
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: '600',
      },
      headerBackVisible: false,            // No back button
      headerLeft: () => <CancelButton />,
      headerRight: () => <SaveButton />,
      gestureEnabled: true,
      gestureDirection: 'vertical',        // Swipe down to dismiss
      cardOverlayEnabled: true,            // Dim background
      cardStyle: {
        backgroundColor: 'transparent',     // For overlay effect
      },
    })}
    getId={({params}) => params.coinId}    // Unique instance per COIN
  />
</Stack.Navigator>
```

**Access Points:**

**From UC-200 (Recents Tab):**
```typescript
// In COINCard component (Recents context)
const handleEditPress = () => {
  navigation.navigate('EditCOINMetadata', {
    coinId: coin.id,
    returnScreen: 'Recents',
  });
};

// Triggered by:
// - Three-dot menu → "Edit Details"
// - Long-press → "Edit Details" action
// - Info icon (circle.info) tap
```

**From UC-201 (Projects Tab):**
```typescript
// In COINCard component (Projects context)
const handleEditPress = () => {
  navigation.navigate('EditCOINMetadata', {
    coinId: coin.id,
    returnScreen: 'Projects',
    suggestedProjectId: currentProjectId,  // Optional context hint
  });
};

// Triggered by same actions as Recents
```

**From UC-201 (Project Detail Screen):**
```typescript
// In COINCard component (Project Detail context)
const handleEditPress = () => {
  navigation.navigate('EditCOINMetadata', {
    coinId: coin.id,
    returnScreen: 'ProjectDetail',
    suggestedProjectId: projectId,         // Pre-select current project
  });
};
```

### Modal Layout & Visual Specifications

**Form Sheet Presentation (iPad):**
- **Width:** 540pt (standard iPad form sheet)
- **Max Height:** 620pt (or 80% of screen, whichever is smaller)
- **Corner Radius:** 13pt (iOS 13+ standard)
- **Shadow:** `0 10px 40px rgba(0, 0, 0, 0.15)` (iOS standard elevation)
- **Background Dim:** Black at 40% opacity behind modal
- **Position:** Centered vertically and horizontally
- **Safe Area:** Respects all safe area insets
- **Orientation:** Maintains centered position in both portrait/landscape

**Modal Header:**
```
┌─────────────────────────────────────────────┐
│ Cancel          Edit Details          Save  │  ← 56pt height
├─────────────────────────────────────────────┤  ← 0.5pt separator
```

**Header Styling:**
```typescript
{
  backgroundColor: 'systemBackground',   // #FFFFFF light, #000000 dark
  height: 56,
  borderBottomWidth: 0.5,
  borderBottomColor: 'separator',        // #C6C6C8 light, #38383A dark
  paddingHorizontal: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
```

**Cancel Button (Header Left):**
```typescript
{
  text: 'Cancel',
  fontSize: 17,
  color: 'systemBlue',                   // #007AFF
  fontWeight: '400',
  padding: 8,                            // Expand touch target
  minWidth: 44,                          // iOS minimum
  minHeight: 44,
}
```

**Save Button (Header Right):**
```typescript
{
  text: 'Save',
  fontSize: 17,
  color: 'systemBlue',                   // Enabled
  color: 'tertiaryLabel',                // Disabled: #C7C7CC
  fontWeight: '600',                     // Semibold (primary action)
  padding: 8,
  minWidth: 44,
  minHeight: 44,
  opacity: 1,                            // Enabled
  opacity: 0.3,                          // Disabled
}
```

**Content Area Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  Name *                                     │  ← 16pt from top
│  [_____________________________________]    │  ← 44pt height
│      ↑ error message here (8pt below)      │
│                                             │  ← 16pt spacing
│  Description                                │
│  [_____________________________________]    │  ← 75pt initial
│  [_____________________________________]    │
│  [_____________________________________]    │
│  0/500                                      │  ← Counter, 4pt below
│                                             │  ← 16pt spacing
│  Project                                    │
│  [None                               ▼]    │  ← 44pt height
│                                             │  ← 16pt spacing
│  Status                                     │
│  [● Draft                            ▼]    │  ← 44pt height, badge inline
│                                             │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │  ← Separator
│                                             │
│  Last modified: Oct 22, 2025                │  ← 12pt from separator
│                                             │  ← 24pt from bottom
└─────────────────────────────────────────────┘
```

**Measurements:**
- **Side margins:** 24pt from modal edges
- **Top padding:** 16pt from header separator to first field
- **Field spacing:** 16pt between fields
- **Label to input spacing:** 8pt
- **Error message spacing:** 8pt below input
- **Counter spacing:** 4pt below input
- **Bottom padding:** 24pt from last modified to bottom

### Form Field Specifications

#### Name Field (Required)

**Label Styling:**
```typescript
{
  text: 'Name *',                        // Asterisk indicates required
  fontSize: 13,
  fontWeight: '600',                     // Semibold
  color: 'label',                        // #000000 light, #FFFFFF dark
  marginBottom: 8,
}
```

**Required Indicator:**
```typescript
{
  text: '*',
  color: 'systemRed',                    // #FF3B30
  fontSize: 13,
  fontWeight: '600',
}
```

**Input Styling:**
```typescript
{
  height: 44,                            // iOS minimum touch target
  borderWidth: 1,
  borderColor: 'separator',              // Normal: #C6C6C8
  borderColor: 'systemRed',              // Error: #FF3B30
  borderRadius: 8,
  backgroundColor: 'secondarySystemBackground',  // #F2F2F7 light
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 17,                          // iOS body text
  fontWeight: '400',
  color: 'label',
  fontFamily: 'SF Pro Text',             // iOS system font
}
```

**Input Behavior:**
- **Auto-focus:** YES (keyboard opens automatically on modal present)
- **Return key:** "next" (advances to description)
- **Auto-capitalization:** "sentences"
- **Auto-correction:** YES
- **Spell check:** YES
- **Clear button:** YES (X icon, appears when text present)
- **Max length:** 100 characters (enforced via maxLength prop)
- **Trim on blur:** Remove leading/trailing whitespace

**Validation Rules:**
- **Required:** Cannot be empty or whitespace-only
- **Min length:** 1 character (after trim)
- **Max length:** 100 characters
- **Unique:** Optional (Phase 2) - Check if name exists for other COINs
- **Validation timing:** On blur (field loses focus) and on submit

**Error Message:**
```typescript
{
  text: 'Name is required' | 'Name must be 100 characters or less',
  fontSize: 13,
  color: 'systemRed',                    // #FF3B30
  marginTop: 4,
  marginLeft: 12,                        // Align with input padding
}
```

**Character Counter (shown when >80 characters):**
```typescript
{
  text: '95/100',                        // Current/max
  fontSize: 12,
  color: 'secondaryLabel',               // Gray: 0-80 chars
  color: 'systemOrange',                 // Amber: 81-95 chars
  color: 'systemRed',                    // Red: 96-100 chars
  marginTop: 4,
  textAlign: 'right',
}
```

#### Description Field (Optional)

**Label Styling:**
```typescript
{
  text: 'Description',
  fontSize: 13,
  fontWeight: '600',
  color: 'label',
  marginBottom: 8,
}
```

**Input Styling:**
```typescript
{
  minHeight: 75,                         // 3 lines at 17pt line height
  maxHeight: 150,                        // 6 lines
  borderWidth: 1,
  borderColor: 'separator',
  borderColor: 'systemRed',              // Error state
  borderRadius: 8,
  backgroundColor: 'secondarySystemBackground',
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 17,
  lineHeight: 22,                        // 1.3x font size
  fontWeight: '400',
  color: 'label',
  textAlignVertical: 'top',              // Android: align to top
}
```

**Input Behavior:**
- **Multi-line:** YES (multiline={true})
- **Auto-expanding:** YES (grows from 75pt to 150pt as user types)
- **Scrollable:** YES (when content exceeds 150pt)
- **Return key:** "default" (allows line breaks)
- **Auto-capitalization:** "sentences"
- **Max length:** 500 characters
- **Placeholder:** "Add a description..."

**Validation Rules:**
- **Optional:** Can be empty
- **Max length:** 500 characters
- **Validation timing:** On change (live) for character count, on submit for errors

**Character Counter (always visible):**
```typescript
{
  text: '0/500',                         // Updates live
  fontSize: 12,
  color: 'secondaryLabel',               // Gray: 0-400 chars
  color: 'systemOrange',                 // Amber: 401-480 chars
  color: 'systemRed',                    // Red: 481-500 chars
  marginTop: 4,
  textAlign: 'right',
}
```

**Error Message:**
```typescript
{
  text: 'Description must be 500 characters or less',
  fontSize: 13,
  color: 'systemRed',
  marginTop: 4,
  marginLeft: 12,
}
```

#### Project Field (Optional)

**Label Styling:**
```typescript
{
  text: 'Project',
  fontSize: 13,
  fontWeight: '600',
  color: 'label',
  marginBottom: 8,
}
```

**Display Field (Touchable):**
```typescript
{
  height: 44,
  borderWidth: 1,
  borderColor: 'separator',
  borderRadius: 8,
  backgroundColor: 'secondarySystemBackground',
  paddingHorizontal: 12,
  paddingVertical: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
```

**Current Value Text:**
```typescript
{
  text: project?.name || 'None',
  fontSize: 17,
  fontWeight: '400',
  color: 'label',                        // If project selected
  color: 'placeholderText',              // If "None" (gray)
}
```

**Chevron Icon:**
```typescript
{
  icon: 'chevron.down',                  // SF Symbol
  size: 17,
  color: 'tertiaryLabel',                // #C7C7CC (subtle)
}
```

**Picker Behavior - ActionSheetIOS:**
```typescript
ActionSheetIOS.showActionSheetWithOptions(
  {
    title: 'Select Project',
    options: ['None', ...projectNames, 'Cancel'],
    cancelButtonIndex: projectNames.length + 1,
    userInterfaceStyle: 'automatic',     // Respect light/dark mode
  },
  (buttonIndex) => {
    if (buttonIndex === 0) {
      // "None" selected - remove project
      setFormData(prev => ({ ...prev, projectId: null }));
      setIsDirty(true);
    } else if (buttonIndex > 0 && buttonIndex <= projectNames.length) {
      // Project selected
      const selectedProject = projects[buttonIndex - 1];
      setFormData(prev => ({ ...prev, projectId: selectedProject.id }));
      setIsDirty(true);
    }
    // Cancel: do nothing
  }
);
```

**Accessibility:**
```typescript
{
  accessibilityLabel: `Project: ${project?.name || 'None selected'}`,
  accessibilityHint: 'Double tap to select a project',
  accessibilityRole: 'button',
}
```

**Empty State (No Projects Exist):**
```typescript
// Field shows:
{
  text: 'None',
  color: 'placeholderText',
}

// Below field:
{
  text: 'Create a project in the Projects tab',
  fontSize: 13,
  color: 'secondaryLabel',
  fontStyle: 'italic',
  marginTop: 4,
}

// Field is disabled (not tappable)
{
  opacity: 0.5,
  pointerEvents: 'none',
}
```

#### Status Field (Phase 1)

**Label Styling:**
```typescript
{
  text: 'Status',
  fontSize: 13,
  fontWeight: '600',
  color: 'label',
  marginBottom: 8,
}
```

**Display Field (Touchable):**
```typescript
{
  height: 44,
  borderWidth: 1,
  borderColor: 'separator',
  borderRadius: 8,
  backgroundColor: 'secondarySystemBackground',
  paddingHorizontal: 12,
  paddingVertical: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
```

**Status Badge (Inline):**
```typescript
// Badge circle
{
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: statusConfig.color,   // See STATUS_CONFIGS
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
}

// Badge icon (SF Symbol)
{
  icon: statusConfig.icon,
  size: 12,
  color: '#FFFFFF',                      // White icon on colored circle
}

// Status label
{
  text: statusConfig.label,              // "Draft", "Review", etc.
  fontSize: 17,
  fontWeight: '400',
  color: 'label',
}
```

**Picker Behavior - ActionSheetIOS with Visual Options:**
```typescript
// Build options with badge emojis for visual reference
const statusOptions = [
  '⚪️ Draft',                            // Gray circle
  '🟠 Review',                           // Amber circle
  '🟢 Approved',                         // Green circle
  '⚫️ Archived',                         // Light gray circle
  'Cancel',
];

ActionSheetIOS.showActionSheetWithOptions(
  {
    title: 'Select Status',
    options: statusOptions,
    cancelButtonIndex: statusOptions.length - 1,
    destructiveButtonIndex: 3,           // Archived is semi-destructive
    userInterfaceStyle: 'automatic',
  },
  (buttonIndex) => {
    if (buttonIndex >= 0 && buttonIndex < statusOptions.length - 1) {
      const statusValues = [
        COINStatus.Draft,
        COINStatus.Review,
        COINStatus.Approved,
        COINStatus.Archived,
      ];
      setFormData(prev => ({ ...prev, status: statusValues[buttonIndex] }));
      setIsDirty(true);
    }
  }
);
```

### Last Modified Display

**Separator Line:**
```typescript
{
  height: 1,
  backgroundColor: 'separator',          // #E5E5EA
  marginVertical: 16,
}
```

**Last Modified Text:**
```typescript
{
  text: 'Last modified: Oct 22, 2025',
  fontSize: 13,
  fontWeight: '400',
  color: 'secondaryLabel',               // #8E8E93 (subtle)
  textAlign: 'center',
}
```

**Date Format:**
- Same as current date: "Today at 2:34 PM"
- Yesterday: "Yesterday at 2:34 PM"
- This year: "Oct 22 at 2:34 PM"
- Previous year: "Oct 22, 2024"
- Use device locale for formatting

### Interaction Behaviors

#### Modal Open Sequence

**Animation Timeline:**
```
0ms:   Trigger (info button tap)
0ms:   Start background dim (fade in black at 40%)
0ms:   Modal slide up from bottom center (form sheet)
150ms: Background dim complete
250ms: Modal position complete
260ms: Name field auto-focus
270ms: Keyboard slide up from bottom
420ms: Animation fully complete, user can interact
```

**Implementation:**
```typescript
// React Navigation handles most of this automatically
// Custom configuration:
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
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
}

// Auto-focus name input
useEffect(() => {
  const timer = setTimeout(() => {
    nameInputRef.current?.focus();
  }, 260);  // Wait for modal animation
  return () => clearTimeout(timer);
}, []);
```

#### Typing in Fields

**Live Updates:**
- Character counters update on every keystroke
- Validation errors clear immediately when user starts fixing
- Form marked as "dirty" on first character typed
- Save button enabled/disabled updates on every change

**Validation Timing:**
- **Name:** Validate on blur (field loses focus)
- **Description:** Validate on change (for character count only)
- **All fields:** Validate on Save button press

**Error Clearing:**
```typescript
// Clear error as soon as user starts typing
<TextInput
  value={formData.name}
  onChangeText={(text) => {
    setFormData(prev => ({ ...prev, name: text }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    setIsDirty(true);
  }}
/>
```

#### Project/Status Selection

**Picker Open:**
- Field tap → Haptic feedback (light impact)
- Action sheet slides up from bottom
- Background dims further (to 60% opacity)
- Previous field loses focus (keyboard dismisses if open)

**Picker Selection:**
- Option tap → Haptic feedback (selection)
- Action sheet slides down
- Background returns to 40% opacity
- Selected value updates immediately in field
- Visual confirmation: Brief highlight (50ms) on field

**Picker Cancel:**
- "Cancel" tap → No changes, sheet dismisses
- Swipe down → Same as cancel
- Tap outside sheet → Dismisses (iOS 15+ behavior)

#### Tap Cancel Button

**If Form Clean (No Changes):**
```typescript
const handleCancel = () => {
  if (!isDirty) {
    // No confirmation needed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
    return;
  }
  // ... show confirmation
};
```

**If Form Dirty (Has Changes):**
```typescript
Alert.alert(
  'Discard changes?',
  'Your changes will not be saved.',
  [
    {
      text: 'Keep Editing',
      style: 'cancel',
      onPress: () => {
        // Do nothing, stay on modal
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      text: 'Discard',
      style: 'destructive',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
      },
    },
  ],
  { cancelable: true }  // Tap outside = Keep Editing
);
```

**Alert Styling (iOS Standard):**
- Title: 17pt Semibold
- Message: 13pt Regular
- Buttons: 17pt Regular (Cancel), Semibold (Discard)
- Discard button: Red text (destructive style)

#### Tap Save Button

**Validation Flow:**
```typescript
const handleSave = async () => {
  // 1. Validate all fields
  const validationErrors = validateForm(formData);
  
  if (Object.keys(validationErrors).length > 0) {
    // Show all errors
    setErrors(validationErrors);
    // Haptic for error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Focus first invalid field
    if (validationErrors.name) {
      nameInputRef.current?.focus();
    }
    return;
  }
  
  // 2. Start save process
  setIsSaving(true);
  
  try {
    // 3. Update COIN in AsyncStorage
    const updatedCOIN = await COINRepository.update(coinId, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      projectId: formData.projectId,
      status: formData.status,
      lastModified: new Date().toISOString(),
    });
    
    // 4. Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 5. Close modal (COINRepository will emit update event)
    navigation.goBack();
    
  } catch (error) {
    // 6. Handle error
    console.error('Failed to save COIN metadata:', error);
    
    setIsSaving(false);
    
    // Error haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Error toast
    Alert.alert(
      'Error',
      'Failed to save changes. Please try again.',
      [{ text: 'OK' }]
    );
  }
};
```

**Save Button States:**

**Enabled:**
```typescript
{
  opacity: 1,
  color: 'systemBlue',
  pointerEvents: 'auto',
}
```

**Disabled (Invalid Form):**
```typescript
{
  opacity: 0.3,
  color: 'tertiaryLabel',              // Grayed out
  pointerEvents: 'none',               // Not tappable
}
```

**Loading (Saving):**
```typescript
{
  opacity: 1,
  color: 'systemBlue',
  text: null,                           // Hide "Save" text
  children: <ActivityIndicator size="small" color="systemBlue" />,
  pointerEvents: 'none',                // Not tappable during save
}
```

#### Swipe Down to Dismiss

**Gesture Configuration:**
```typescript
// React Navigation handles this automatically with:
{
  gestureEnabled: true,
  gestureDirection: 'vertical',
  gestureResponseDistance: 100,         // How far user must swipe
}
```

**Behavior:**
- **If form clean:** Dismisses immediately (no confirmation)
- **If form dirty:** Shows confirmation alert (same as Cancel button)
- **During save:** Gesture disabled (can't dismiss while saving)

**Visual Feedback:**
- Modal follows finger during swipe
- Rubber-band bounce if swipe incomplete
- Background dim follows modal (fades out as modal slides down)

#### Keyboard Handling

**Keyboard Appearance:**
```typescript
<KeyboardAvoidingView
  behavior="padding"
  keyboardVerticalOffset={0}          // Modal already handles offset
  style={styles.container}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

**Keyboard Types:**
- Name: Default keyboard
- Description: Default keyboard
- Project/Status: No keyboard (pickers)

**Return Key Behavior:**
```typescript
// Name field
<TextInput
  returnKeyType="next"
  onSubmitEditing={() => descriptionInputRef.current?.focus()}
/>

// Description field
<TextInput
  returnKeyType="done"
  onSubmitEditing={() => Keyboard.dismiss()}
/>
```

**Keyboard Toolbar (iOS):**
```typescript
// Automatically appears on iPad with "Done" button
// No additional configuration needed
```

**Keyboard Dismissal:**
- Tap "Done" on keyboard toolbar
- Tap "Done" return key (on description)
- Tap project/status picker (automatic)
- Swipe down on modal (with confirmation)

**ScrollView Behavior:**
```typescript
<ScrollView
  keyboardShouldPersistTaps="handled"   // Allow taps while keyboard open
  scrollEnabled={true}                   // Allow scroll to see all fields
  contentInsetAdjustmentBehavior="automatic"  // Handle keyboard height
>
  {/* Form fields */}
</ScrollView>
```

### iPad-Specific Considerations

#### Touch Targets

**Minimum Sizes (iOS HIG):**
- All interactive elements: **44x44pt minimum**
- Tap Cancel button: 44x44pt (text + padding)
- Tap Save button: 44x44pt (text + padding)
- Name input: 44pt height
- Description input: 75pt height (auto-expanding)
- Project picker: 44pt height
- Status picker: 44pt height

**Spacing for Comfortable Tapping:**
- Between fields: 16pt (prevents accidental taps)
- Input padding: 12pt horizontal (comfortable text entry)

#### Hardware Keyboard Support

**Keyboard Shortcuts:**
```typescript
import { useEffect } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

useEffect(() => {
  const keyboardListener = Keyboard.addListener(
    'keyboardDidShow',
    (e: KeyboardEvent) => {
      // Listen for Cmd+S (Save)
      // Listen for Cmd+W (Cancel/Close)
      // Listen for Esc (Cancel)
    }
  );
  
  return () => keyboardListener.remove();
}, []);

// For React Navigation, use useFocusEffect for hardware keyboard
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  React.useCallback(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+S (Save)
      if (e.key === 's' && e.metaKey) {
        e.preventDefault();
        handleSave();
      }
      
      // Cmd+W or Esc (Cancel)
      if ((e.key === 'w' && e.metaKey) || e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      
      // Tab (next field)
      if (e.key === 'Tab' && !e.shiftKey) {
        // React Native handles this automatically
      }
    };
    
    // Add event listener (platform-specific implementation)
    return () => {
      // Remove event listener
    };
  }, [isDirty, formData])
);
```

**Keyboard Navigation:**
- **Tab:** Move to next field (Name → Description → Project → Status → Save)
- **Shift+Tab:** Move to previous field
- **Return:** Advance to next field (Name) or dismiss keyboard (Description)
- **Cmd+S:** Save changes
- **Cmd+W:** Cancel (with confirmation if dirty)
- **Esc:** Same as Cmd+W

#### Orientation Handling

**Portrait Orientation:**
- Modal: 540pt wide, centered
- Form fields: Full width minus 24pt margins (492pt effective width)
- Comfortable spacing for all fields
- Keyboard: 264pt height (standard iPad portrait)
- Modal scrollable if keyboard obscures fields

**Landscape Orientation:**
- Modal: Same 540pt width (maintains consistency)
- Still centered on screen
- More vertical space available
- Keyboard: 352pt height (standard iPad landscape)
- Fields remain fully visible above keyboard

**Orientation Change During Edit:**
```typescript
// Preserve form state during rotation
useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    // Update layout calculations
    // Modal re-centers automatically
    // Form state preserved
    // Keyboard remains open (iOS behavior)
  });
  
  return () => subscription?.remove();
}, []);
```

#### Gestures

**Standard iOS Gestures (All Supported):**
- ✅ Swipe down: Dismiss modal (with confirmation if dirty)
- ✅ Tap outside modal: **Does NOT dismiss** (iOS form sheet standard - requires explicit action)
- ✅ Pinch/zoom: Not applicable (no zoomable content)
- ✅ Two-finger scrub: VoiceOver dismiss gesture

**Custom Gestures:**
- None needed - standard iOS patterns sufficient

#### Performance Targets

**Animation Performance:**
- Modal open: <300ms (target 250ms)
- Modal dismiss: <300ms (target 250ms)
- Keyboard appear: <150ms (system controlled)
- Field updates: <16ms (60fps)
- Validation: <10ms (must be instant)

**Memory:**
- Modal overhead: <10MB
- No memory leaks on open/close
- Clean up all listeners on unmount

**Responsiveness:**
- Time to interactive: <500ms after animation
- Input lag: <16ms (60fps)
- Save operation: <500ms typical, <2s maximum

---

## State Management & Data Persistence

### Navigation State Preservation

**Unsaved Changes Protection:**
```typescript
import { usePreventRemove } from '@react-navigation/native';

// Prevent user from leaving if form has unsaved changes
usePreventRemove(isDirty, ({ data }) => {
  Alert.alert(
    'Discard changes?',
    'Your changes will not be saved.',
    [
      { text: 'Keep Editing', style: 'cancel', onPress: () => {} },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]
  );
});
```

**When Protection Applies:**
- User presses hardware back button (Android - not applicable on iPad)
- User swipes down to dismiss
- User taps Cancel button
- User presses Cmd+W or Esc
- User switches tabs (shouldn't happen - modal covers tabs)
- App backgrounded (see below)

### App Lifecycle Handling

**App Backgrounded During Edit:**
```typescript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      // Save draft to memory (not AsyncStorage)
      saveDraftToMemory({
        coinId,
        formData,
        timestamp: Date.now(),
      });
    }
    
    if (nextAppState === 'active') {
      // Restore draft if exists and recent (<5 minutes)
      const draft = getDraftFromMemory(coinId);
      if (draft && Date.now() - draft.timestamp < 300000) {
        // Ask user if they want to restore
        Alert.alert(
          'Restore changes?',
          'You have unsaved changes from earlier.',
          [
            { text: 'Discard', style: 'destructive' },
            { text: 'Restore', onPress: () => setFormData(draft.formData) },
          ]
        );
      }
    }
  });
  
  return () => subscription.remove();
}, [coinId, formData]);
```

**Note:** Draft is stored in memory only, not AsyncStorage. Don't persist incomplete edits to disk.

### Update Event Flow

**After Successful Save:**
```typescript
// 1. COINRepository.update() completes
const updatedCOIN = await COINRepository.update(coinId, updates);

// 2. COINRepository emits event
EventEmitter.emit('coinUpdated', {
  coinId,
  updates,
  fullCOIN: updatedCOIN,
});

// 3. UC-200 (Recents) listens and refreshes
// In RecentsScreen.tsx:
useEffect(() => {
  const handleUpdate = ({ coinId }) => {
    // Refresh COIN in list
    refreshCOIN(coinId);
  };
  
  EventEmitter.on('coinUpdated', handleUpdate);
  return () => EventEmitter.off('coinUpdated', handleUpdate);
}, []);

// 4. UC-201 (Projects) listens and refreshes
// Same pattern as Recents

// 5. Modal dismisses
navigation.goBack();

// User sees updated COIN immediately in calling screen
```

**Event-Based Architecture Benefits:**
- Clean separation of concerns
- No need to pass callbacks through navigation params
- Multiple screens can listen to same event
- Works even if user navigated elsewhere before save completes

### AsyncStorage Schema

**COIN Document Structure:**
```json
// Key: coin:{coinId}
// Value:
{
  "id": "coin-abc123",
  "name": "Q4 Planning Process",
  "description": "Revised process for 2025 planning cycle",
  "projectId": "project-xyz789",
  "status": "review",
  "createdAt": "2025-10-15T14:23:00.000Z",
  "lastModified": "2025-10-22T16:45:30.000Z",
  "lastAccessed": "2025-10-22T16:30:00.000Z",  // NOT updated by UC-130
  "canvas": { /* canvas data */ },
  "metadata": {
    "createdBy": "user-123",
    "version": "1.2",
    // ... other metadata
  }
}
```

**Update Operation:**
```typescript
// Partial update - only changed fields
const updates = {
  name: formData.name.trim(),
  description: formData.description.trim(),
  projectId: formData.projectId,
  status: formData.status,
  lastModified: new Date().toISOString(),
};

// COINRepository.update() merges with existing
const existingCOIN = await AsyncStorage.getItem(`coin:${coinId}`);
const parsedCOIN = JSON.parse(existingCOIN);
const updatedCOIN = {
  ...parsedCOIN,
  ...updates,
};
await AsyncStorage.setItem(`coin:${coinId}`, JSON.stringify(updatedCOIN));
```

**Critical: Do NOT Update lastAccessed:**
- UC-130 is metadata editing, not viewing/opening
- Only UC-110 (COIN Editor) updates lastAccessed
- AccessHistoryService is NOT called by UC-130

---

## Accessibility Implementation

### VoiceOver Support

**Screen Announcement (on modal open):**
```typescript
{
  accessibilityLabel: 'Edit Details',
  accessibilityHint: 'Edit COIN name, description, project, and status',
  accessibilityRole: 'adjustable',
  accessibilityViewIsModal: true,      // Trap focus within modal
}
```

**Field Labels:**

**Name Input:**
```typescript
{
  accessibilityLabel: 'COIN name, required, text field',
  accessibilityHint: formData.name ? `Current value: ${formData.name}` : 'Enter COIN name',
  accessibilityValue: { text: formData.name },
  accessibilityRequired: true,
}
```

**Description Input:**
```typescript
{
  accessibilityLabel: 'Description, optional, text field',
  accessibilityHint: 'Enter optional description',
  accessibilityValue: { text: formData.description || 'Empty' },
}
```

**Project Picker:**
```typescript
{
  accessibilityLabel: 'Project',
  accessibilityHint: 'Double tap to select a project',
  accessibilityValue: { text: project?.name || 'None selected' },
  accessibilityRole: 'button',
}
```

**Status Picker:**
```typescript
{
  accessibilityLabel: 'Status',
  accessibilityHint: 'Double tap to select status',
  accessibilityValue: { text: STATUS_CONFIGS[formData.status].accessibilityLabel },
  accessibilityRole: 'button',
}
```

**Save Button:**
```typescript
{
  accessibilityLabel: 'Save',
  accessibilityHint: isFormValid 
    ? 'Double tap to save changes' 
    : 'Save is disabled. Fix errors to save',
  accessibilityRole: 'button',
  accessibilityState: { 
    disabled: !isFormValid || isSaving 
  },
}
```

**Cancel Button:**
```typescript
{
  accessibilityLabel: 'Cancel',
  accessibilityHint: 'Double tap to cancel and discard changes',
  accessibilityRole: 'button',
}
```

### Error Announcements

**When Validation Error Appears:**
```typescript
// Announce error to VoiceOver immediately
UIAccessibility.post({
  notification: UIAccessibility.Notification.Announcement,
  argument: `Error: ${errorMessage}`,
});

// Also set accessibilityLiveRegion on error text
{
  accessibilityLiveRegion: 'assertive',  // Interrupt current speech
  accessibilityRole: 'alert',
}
```

**Example:**
```typescript
// Name error appears
{
  text: 'Name is required',
  accessibilityLabel: 'Error: Name is required',
  accessibilityLiveRegion: 'assertive',
  accessibilityRole: 'alert',
}

// VoiceOver announces: "Error: Name is required"
```

### Focus Management

**Initial Focus:**
```typescript
// After modal animation completes
useEffect(() => {
  const timer = setTimeout(() => {
    if (isVoiceOverRunning) {
      // Set focus to modal title
      setAccessibilityFocus(modalTitleRef);
    } else {
      // Focus name input for typing
      nameInputRef.current?.focus();
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, []);
```

**Focus Order:**
1. Modal title ("Edit Details")
2. Cancel button
3. Name field label
4. Name input
5. Name error (if present)
6. Description field label
7. Description input
8. Description counter
9. Description error (if present)
10. Project field label
11. Project picker
12. Status field label
13. Status picker
14. Last modified text
15. Save button

**Focus Trap:**
```typescript
{
  accessibilityViewIsModal: true,      // Keep focus within modal
}
```

### Dynamic Type Support

**All Text Must Scale:**
```typescript
// Base sizes (at default Dynamic Type)
const textStyles = {
  title: { fontSize: 17, lineHeight: 22 },      // Title 3
  body: { fontSize: 17, lineHeight: 22 },       // Body
  callout: { fontSize: 16, lineHeight: 21 },    // Callout
  subheadline: { fontSize: 15, lineHeight: 20 }, // Subheadline
  footnote: { fontSize: 13, lineHeight: 18 },   // Footnote
  caption: { fontSize: 12, lineHeight: 16 },    // Caption 1
};

// Apply scaling
import { useAccessibilityInfo } from '@react-native-community/hooks';

const { isScreenReaderEnabled, boldTextEnabled } = useAccessibilityInfo();

<Text style={[
  textStyles.body,
  boldTextEnabled && { fontWeight: '600' }  // Respect Bold Text setting
]}>
  {text}
</Text>
```

**Maximum Supported Sizes:**
- Support up to XXXL (largest Dynamic Type setting)
- Modal may need to scroll to show all fields at XXXL
- Minimum field heights maintained even at largest text size

### Reduced Motion

**Disable Animations:**
```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
    setReduceMotionEnabled(enabled);
  });
  
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReduceMotionEnabled
  );
  
  return () => subscription.remove();
}, []);

// Apply to animations
const transitionConfig = reduceMotionEnabled 
  ? { duration: 0 }                 // Instant
  : { duration: 250, animation: 'spring' };  // Animated
```

**Affected Elements:**
- Modal slide up/down
- Background dim fade
- Keyboard slide
- Field highlight on selection
- Save button loading spinner (still shown, but no rotation)

### Accessibility Testing Checklist

- [ ] All fields announced correctly by VoiceOver
- [ ] Focus order logical and complete
- [ ] Error messages announced immediately
- [ ] Save button state changes announced
- [ ] Modal title announced on open
- [ ] All buttons have clear labels and hints
- [ ] Picker selections announced
- [ ] Character counters read with fields
- [ ] Last modified date announced
- [ ] Focus trapped within modal (can't escape to tabs)
- [ ] Hardware keyboard navigation works with VoiceOver
- [ ] Reduced Motion disables animations
- [ ] Bold Text renders correctly
- [ ] Dynamic Type scales all text (test at XXXL)
- [ ] High contrast mode renders clearly

---

## Implementation Scenarios

### Main Success Scenario (from UC-130 POC)

**User Flow:**
1. Business Analyst viewing COIN card in Recents tab
2. Taps three-dot menu button on card
3. Selects "Edit Details" from menu
4. Modal slides up, name field focused, keyboard appears
5. User changes name from "Q3 Planning" to "Q4 Planning Process"
6. User taps description field, adds "Revised process for 2025"
7. User taps project field, action sheet appears
8. User selects "Q4 2024 Initiatives" project
9. User taps status field, selects "Review" from options
10. User taps "Save" button
11. Brief haptic feedback (success)
12. Modal dismisses smoothly
13. Returns to Recents tab
14. COIN card shows updated name and project badge
15. COIN's position unchanged in Recents (last accessed not updated)

**Test Success Criteria:**
- ✓ Modal opens in <300ms
- ✓ Name field focused automatically
- ✓ All changes saved correctly to AsyncStorage
- ✓ Updated data visible in card immediately
- ✓ No errors in console
- ✓ Smooth 60fps throughout

### AS-1: Cancel Without Changes

**Scenario:** User opens modal to review metadata but makes no changes

**Steps:**
1. User taps info button on COIN card
2. Modal opens, displays current metadata
3. User reviews name, description, project, status
4. User decides no changes needed
5. User taps "Cancel"
6. No confirmation shown (form is clean)
7. Modal dismisses immediately
8. Returns to calling screen
9. No updates to AsyncStorage
10. No events emitted

**Test:**
- Open modal → Don't change anything → Tap Cancel → Verify instant dismiss with no confirmation

### AS-2: Cancel With Changes - Discard

**Scenario:** User makes changes but decides to discard them

**Steps:**
1. User opens modal
2. User changes name to "New Name"
3. Form marked as dirty
4. User taps "Cancel"
5. Confirmation alert appears: "Discard changes?"
6. User taps "Discard" (destructive action)
7. Haptic feedback (light impact)
8. Alert dismisses
9. Modal dismisses
10. Returns to calling screen
11. Original data unchanged
12. No updates to AsyncStorage

**Test:**
- Open modal → Change name → Tap Cancel → Tap "Discard" → Verify changes not saved

### AS-3: Cancel With Changes - Keep Editing

**Scenario:** User accidentally taps cancel but wants to continue editing

**Steps:**
1. User opens modal
2. User changes description
3. User taps "Cancel" by accident
4. Confirmation alert appears
5. User taps "Keep Editing"
6. Alert dismisses
7. Modal remains open
8. Changes still present in form
9. User continues editing
10. User taps "Save"
11. Changes saved successfully

**Test:**
- Open modal → Make changes → Tap Cancel → Tap "Keep Editing" → Verify modal stays open with changes intact → Save successfully

### AS-4: Validation Error - Empty Name

**Scenario:** User deletes name completely

**Steps:**
1. User opens modal
2. User taps in name field (already focused)
3. User selects all text (long press → Select All)
4. User presses Delete
5. Name field now empty
6. User taps outside name field (blur)
7. Validation runs
8. Error appears below field: "Name is required"
9. Name field border turns red
10. Save button disabled (grayed out, 0.3 opacity)
11. User taps Save button
12. Nothing happens (button not tappable)
13. User types valid name
14. Error clears immediately
15. Name field border returns to normal
16. Save button enabled
17. User saves successfully

**Test:**
- Delete name → Try to save → Verify blocked → Add valid name → Verify error clears → Save succeeds

### AS-5: Validation Error - Name Too Long

**Scenario:** User types name exceeding 100 character limit

**Steps:**
1. User opens modal
2. User types very long name (>100 characters)
3. TextInput maxLength prop prevents typing beyond 100
4. OR: Character counter appears at 80 characters
5. Counter color: gray (0-80), amber (81-95), red (96-100)
6. User sees "100/100" in red
7. User cannot type more characters
8. User can still save (100 is okay, <100 is the rule)
9. If user somehow has 101 characters:
   - Error appears: "Name must be 100 characters or less"
   - Save button disabled
10. User deletes characters to get under 100
11. Error clears
12. Save enabled

**Test:**
- Type 100 characters → Verify can save → Type 101 (if possible) → Verify blocked

### AS-6: Description Character Limit

**Scenario:** User writes long description approaching limit

**Steps:**
1. User opens modal
2. User taps description field
3. User types lengthy description
4. Character counter visible at all times: "0/500"
5. Counter updates live as user types
6. At 401 characters: Counter turns amber (#FF9500)
7. At 481 characters: Counter turns red (#FF3B30)
8. At 500 characters: User cannot type more (maxLength enforced)
9. OR: Error appears if somehow exceeds 500
10. User can save with 500 characters (valid)
11. Description is optional, so empty is also valid

**Test:**
- Type 500 characters → Verify counter changes colors → Verify can save → Verify character limit enforced

### AS-7: Change Project Assignment

**Scenario:** User moves COIN to different project

**Steps:**
1. COIN currently in "Q3 Initiatives" project
2. User opens modal from Recents tab
3. Project field shows "Q3 Initiatives"
4. User taps project field
5. Haptic feedback (light impact)
6. Action sheet slides up with options:
   - "None"
   - "Q3 Initiatives" (current - no checkmark in iOS action sheet)
   - "Q4 2024 Initiatives"
   - "Q4 2025 Planning"
   - "Cancel"
7. User taps "Q4 2024 Initiatives"
8. Haptic feedback (selection)
9. Action sheet dismisses
10. Project field updates to "Q4 2024 Initiatives"
11. Form marked as dirty
12. User taps "Save"
13. Modal dismisses
14. In Projects tab: COIN now appears in "Q4 2024 Initiatives" section
15. In Recents tab: COIN card shows "Q4 2024 Initiatives" badge

**Test:**
- Change project → Save → Go to Projects tab → Verify COIN in correct project section

### AS-8: Remove Project Assignment

**Scenario:** User removes COIN from project (makes it root-level)

**Steps:**
1. COIN currently in "Q3 Initiatives" project
2. User opens modal
3. Project field shows "Q3 Initiatives"
4. User taps project field
5. Action sheet opens with "None" at top
6. User taps "None"
7. Haptic feedback
8. Action sheet dismisses
9. Project field shows "None" in gray (placeholder color)
10. User saves
11. In Projects tab: COIN appears in root level (not in any project folder)
12. In Recents tab: COIN card shows no project badge

**Test:**
- Remove project → Save → Go to Projects tab → Verify COIN at root level (not in folder)

### AS-9: Change Status with Visual Badges

**Scenario:** User changes COIN status from Draft to Review

**Steps:**
1. COIN currently "Draft" status (gray badge with clock icon)
2. User opens modal
3. Status field shows gray circle badge + "Draft"
4. User taps status field
5. Action sheet opens with visual options:
   - "⚪️ Draft" (current)
   - "🟠 Review"
   - "🟢 Approved"
   - "⚫️ Archived" (destructive style)
   - "Cancel"
6. User taps "🟠 Review"
7. Action sheet dismisses
8. Status field updates to amber circle badge + "Review"
9. User saves
10. COIN card in Recents/Projects shows amber status badge
11. Can filter by "Review" status in Projects tab

**Test:**
- Change status → Save → Verify badge color updated on card → Verify filterable by new status

### AS-10: Edit from Projects Tab (Context Awareness)

**Scenario:** User edits COIN while viewing project detail

**Steps:**
1. User in Projects tab
2. User taps "Q4 2024 Initiatives" project
3. Navigates to ProjectDetailScreen
4. Shows COINs within that project
5. User taps edit on a COIN card
6. Modal opens with project pre-selected: "Q4 2024 Initiatives"
7. User changes name and description
8. User taps "Save"
9. Modal dismisses
10. Returns to ProjectDetailScreen
11. Updated COIN visible in list
12. COIN still in same project (project didn't change)

**Test:**
- Edit from Project Detail → Verify modal opens with correct project pre-selected → Save → Verify returns to Project Detail

### AS-11: Edit from Recents vs Projects - Same Behavior

**Scenario:** Verify consistent behavior regardless of calling screen

**From Recents:**
1. User in Recents tab
2. Opens edit modal for COIN A
3. Changes name
4. Saves
5. Returns to Recents tab
6. COIN A shows updated name

**From Projects:**
1. User in Projects tab
2. Opens edit modal for COIN A (same COIN)
3. Changes description
4. Saves
5. Returns to Projects tab
6. COIN A shows updated description

**Verify:**
- ✓ Same modal appearance
- ✓ Same fields available
- ✓ Same validation rules
- ✓ Same save behavior
- ✓ Returns to correct calling screen
- ✓ Updates visible in both tabs

**Test:**
- Edit same COIN from both tabs → Verify identical modal → Verify correct return navigation

### AS-12: Save Failure Handling (Simulated)

**Scenario:** AsyncStorage write fails (rare but possible - disk full, permissions, corruption)

**Steps:**
1. User opens modal
2. User makes valid changes
3. User taps "Save"
4. Save button shows loading spinner
5. COINRepository.update() attempts AsyncStorage.setItem()
6. AsyncStorage throws error (simulated: disk full)
7. Error caught in try/catch
8. Save button returns to normal (no spinner)
9. Error alert appears: "Error / Failed to save changes. Please try again."
10. User taps "OK" on alert
11. Modal remains open
12. All changes still present in form (not lost)
13. User can retry save
14. OR user can cancel (with confirmation)

**Test:**
- Mock AsyncStorage failure → Try to save → Verify graceful error handling → Verify form data preserved → Retry succeeds (after fixing mock)

### AS-13: Swipe Down to Dismiss (Clean Form)

**Scenario:** User uses iOS standard swipe gesture

**Steps:**
1. User opens modal
2. User reviews metadata (no changes)
3. User starts swiping down from top of modal
4. Modal follows finger (partial dismiss)
5. User continues swipe past threshold
6. Modal dismisses smoothly (no confirmation needed - form clean)
7. Background dim fades out
8. Returns to calling screen

**Test:**
- Open modal → Don't change anything → Swipe down → Verify dismisses without confirmation

### AS-14: Swipe Down to Dismiss (Dirty Form)

**Scenario:** User swipes to dismiss after making changes

**Steps:**
1. User opens modal
2. User changes name
3. Form marked as dirty
4. User swipes down
5. Modal starts to follow finger
6. User completes swipe
7. Gesture triggers dismiss intent
8. React Navigation's usePreventRemove intervenes
9. Confirmation alert appears: "Discard changes?"
10. User can tap "Keep Editing" or "Discard"
11. If "Discard": Modal dismisses, changes lost
12. If "Keep Editing": Modal stays open, changes preserved

**Test:**
- Make changes → Swipe down → Verify confirmation appears → Test both options

### AS-15: Hardware Keyboard Shortcuts

**Scenario:** User with hardware keyboard attached (Magic Keyboard, Bluetooth keyboard)

**Steps:**
1. User opens modal (keyboard attached)
2. User presses **Tab** key
3. Focus moves from Name → Description → Project → Status → Save
4. User presses **Shift+Tab**
5. Focus moves backward
6. User makes changes
7. User presses **Cmd+S**
8. Save triggered (same as tapping Save button)
9. Modal dismisses
10. Changes saved

**Alternative:**
1. User opens modal
2. User makes changes
3. User presses **Cmd+W** (or **Esc**)
4. Cancel triggered (with confirmation if dirty)
5. User confirms discard
6. Modal dismisses

**Test:**
- Connect hardware keyboard → Open modal → Use Tab for navigation → Use Cmd+S to save → Use Cmd+W to cancel

### AS-16: No Projects Exist Yet

**Scenario:** New user who hasn't created any projects

**Steps:**
1. User creates first COIN
2. User opens edit modal
3. Name and description fields work normally
4. Project field shows "None" (grayed out)
5. Below project field: "Create a project in the Projects tab"
6. Project field is disabled (not tappable)
7. Status field works normally
8. User can save with no project (root-level COIN)
9. User goes to Projects tab
10. User creates first project
11. User reopens edit modal
12. Project field now enabled and shows available project

**Test:**
- Fresh install → Create COIN → Edit metadata → Verify project field disabled with guidance text → Create project → Reopen modal → Verify project now selectable

### AS-17: Project Picker with Many Projects (10+)

**Scenario:** Power user with many projects

**Steps:**
1. User has 15 projects created
2. User opens modal
3. User taps project field
4. Action sheet appears with all 15 projects + "None" + "Cancel" = 17 options
5. Action sheet scrollable (iOS handles automatically)
6. User scrolls through options
7. User selects desired project
8. Selection works normally

**Note:** Phase 2 will add search bar if >10 projects. Phase 1 just uses scrollable action sheet.

**Test:**
- Create 15+ projects → Open modal → Tap project picker → Verify all projects listed → Verify scrollable → Select one successfully

### AS-18: Orientation Change During Edit

**Scenario:** User rotates iPad while modal open

**Steps:**
1. User opens modal in portrait orientation
2. Modal: 540pt wide, centered
3. User typing in description field
4. User rotates iPad to landscape
5. Modal remains 540pt wide (doesn't stretch)
6. Modal re-centers on screen
7. Form state preserved (all fields keep values)
8. Cursor position preserved in description
9. Keyboard remains open (if it was open)
10. Keyboard adjusts to landscape height
11. User continues editing
12. User rotates back to portrait
13. Everything still works correctly

**Test:**
- Open modal → Start editing → Rotate to landscape → Verify layout → Continue editing → Rotate back → Save successfully

### AS-19: VoiceOver Navigation

**Scenario:** VoiceOver user edits metadata

**Steps:**
1. VoiceOver enabled
2. User taps edit button on card
3. Modal opens
4. VoiceOver announces: "Edit Details"
5. User swipes right
6. VoiceOver announces: "Cancel, button"
7. User swipes right
8. VoiceOver announces: "COIN name, required, text field, [current value]"
9. User double-taps to activate
10. Keyboard appears
11. User types new name
12. User swipes right through all fields
13. Each field announced with label, hint, and current value
14. User reaches "Save, button, disabled" (if invalid)
15. OR "Save, button, double tap to save changes" (if valid)
16. User double-taps Save
17. Modal dismisses
18. VoiceOver announces return to calling screen

**Test:**
- Enable VoiceOver → Open modal → Navigate with swipes → Verify all announcements → Edit fields → Save using double-tap

### AS-20: Reduced Motion Enabled

**Scenario:** User has Reduce Motion accessibility setting enabled

**Steps:**
1. User enables Reduce Motion in iOS Settings
2. User opens modal
3. Modal appears instantly (no slide-up animation)
4. Background dim appears instantly (no fade)
5. Keyboard appears normally (system-controlled, may still animate slightly)
6. User edits fields
7. Field highlights instant (no transition)
8. User saves
9. Modal disappears instantly
10. All functionality works identically, just without animations

**Test:**
- Enable Reduce Motion → Open modal → Verify instant appearance → Edit and save → Verify instant dismissal → All functions work

---

## Performance Requirements

### Animation Performance

**Target: 60fps (16.67ms per frame)**

**Modal Open Animation:**
- Duration: 250ms
- Frame budget: 15 frames @ 60fps
- Rendering: Native driver (UIView animation)
- No JavaScript thread blocking
- Smooth spring animation curve

**Modal Dismiss Animation:**
- Duration: 250ms
- Frame budget: 15 frames @ 60fps
- Native driver
- Reverse of open animation

**Keyboard Animations:**
- System-controlled (UIKit)
- Always smooth on iOS
- No custom animation needed

**Field Updates:**
- Live typing: <16ms per keystroke
- Counter updates: <10ms
- Error state changes: <16ms
- All use React state, batched updates

### Memory Constraints

**Modal Memory Budget:**
- Base modal overhead: <5MB
- With all fields rendered: <10MB
- Project list (100 projects): ~1MB
- Total acceptable: <15MB

**Memory Leaks Prevention:**
```typescript
// Clean up all listeners
useEffect(() => {
  const subscription = EventEmitter.on('event', handler);
  return () => subscription.remove();
}, []);

// Clean up timers
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);
}, []);

// Clean up keyboard listeners
useEffect(() => {
  const listener = Keyboard.addListener('keyboardDidShow', handler);
  return () => listener.remove();
}, []);
```

### Responsiveness

**Time to Interactive:**
- From tap to fully interactive: <500ms
- Breakdown:
  - Modal animation: 250ms
  - Name field focus: 10ms
  - Keyboard appear: 150ms
  - Total: 410ms

**Input Lag:**
- Keystroke to character appear: <16ms (60fps)
- Validation to error display: <50ms (acceptable)
- Save button to action: <16ms (instant feedback)

**Save Operation:**
- Typical: <500ms
  - Validation: <10ms
  - AsyncStorage write: <300ms
  - Event emission: <10ms
  - Modal dismiss: 250ms
- Maximum acceptable: <2000ms (for very large COINs with complex canvas data)

### Network Considerations

**Phase 1 (No Network):**
- All operations local
- AsyncStorage only
- No API calls
- No network waiting

**Phase 2 (Cloud Sync):**
- Will add background sync
- UI remains responsive during sync
- "Not Synced" indicator shown
- No blocking operations

---

## Data Management

### Reading COIN Data

**On Modal Open:**
```typescript
const EditCOINMetadataScreen = ({ route, navigation }) => {
  const { coinId, returnScreen, suggestedProjectId } = route.params;
  
  const [coin, setCoin] = useState<COIN | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EditMetadataFormData>({
    name: '',
    description: '',
    projectId: null,
    status: COINStatus.Draft,
  });
  
  // Load COIN and projects on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load COIN
        const coinData = await COINRepository.getById(coinId);
        if (!coinData) {
          // COIN not found - shouldn't happen, but handle gracefully
          Alert.alert('Error', 'COIN not found', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
        
        setCoin(coinData);
        
        // Load all projects for picker
        const projectsData = await ProjectRepository.getAll();
        setProjects(projectsData);
        
        // Initialize form with COIN data
        setFormData({
          name: coinData.name,
          description: coinData.description || '',
          projectId: coinData.projectId || suggestedProjectId || null,
          status: coinData.status || COINStatus.Draft,
        });
        
      } catch (error) {
        console.error('Failed to load COIN data:', error);
        Alert.alert('Error', 'Failed to load COIN details', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [coinId, suggestedProjectId]);
  
  // Show loading spinner while data loads
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="systemBlue" />
      </View>
    );
  }
  
  // ... rest of component
};
```

### Form Validation

**Validation Function:**
```typescript
const validateForm = (data: EditMetadataFormData): EditMetadataFormErrors => {
  const errors: EditMetadataFormErrors = {};
  
  // Name validation
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = 'Name is required';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }
  // Optional: Check uniqueness (Phase 2)
  // const isUnique = await COINRepository.validateNameUnique(trimmedName, coinId);
  // if (!isUnique) {
  //   errors.name = 'A COIN with this name already exists';
  // }
  
  // Description validation
  if (data.description.length > 500) {
    errors.description = 'Description must be 500 characters or less';
  }
  
  // Project validation (none - it's optional)
  
  // Status validation (none - enum ensures valid value)
  
  return errors;
};

const isFormValid = (errors: EditMetadataFormErrors): boolean => {
  return Object.keys(errors).length === 0;
};
```

**Live Validation:**
```typescript
// Validate on blur (name field)
<TextInput
  value={formData.name}
  onChangeText={(text) => {
    setFormData(prev => ({ ...prev, name: text }));
    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    setIsDirty(true);
  }}
  onBlur={() => {
    // Validate on blur
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
    } else if (trimmedName.length > 100) {
      setErrors(prev => ({ ...prev, name: 'Name must be 100 characters or less' }));
    }
  }}
/>
```

### Saving Changes

**Complete Save Flow:**
```typescript
const handleSave = async () => {
  // 1. Validate entire form
  const validationErrors = validateForm(formData);
  
  if (!isFormValid(validationErrors)) {
    setErrors(validationErrors);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Focus first invalid field
    if (validationErrors.name) {
      nameInputRef.current?.focus();
    } else if (validationErrors.description) {
      descriptionInputRef.current?.focus();
    }
    
    return;
  }
  
  // 2. Start save process
  setIsSaving(true);
  
  try {
    // 3. Build update payload
    const updates: COINUpdatePayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      projectId: formData.projectId,
      status: formData.status,
      lastModified: new Date().toISOString(),
    };
    
    // 4. Update in AsyncStorage via repository
    const updatedCOIN = await COINRepository.update(coinId, updates);
    
    // 5. Success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 6. COINRepository emits 'coinUpdated' event automatically
    // UC-200 and UC-201 are listening and will refresh
    
    // 7. Close modal
    navigation.goBack();
    
    // Note: Don't navigate.navigate() back to specific screen
    // goBack() returns to whatever screen was before modal
    
  } catch (error) {
    // 8. Handle error
    console.error('Failed to save COIN metadata:', error);
    
    setIsSaving(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    Alert.alert(
      'Error',
      'Failed to save changes. Please try again.',
      [{ text: 'OK' }]
    );
  }
};
```

### AsyncStorage Operations

**COINRepository.update() Implementation:**
```typescript
class COINRepository {
  private static STORAGE_KEY_PREFIX = 'coin:';
  
  static async update(
    coinId: string, 
    updates: COINUpdatePayload
  ): Promise<COIN> {
    const key = `${this.STORAGE_KEY_PREFIX}${coinId}`;
    
    // 1. Read existing COIN
    const existingData = await AsyncStorage.getItem(key);
    if (!existingData) {
      throw new Error(`COIN not found: ${coinId}`);
    }
    
    const existingCOIN: COIN = JSON.parse(existingData);
    
    // 2. Merge updates
    const updatedCOIN: COIN = {
      ...existingCOIN,
      ...updates,
      // Ensure lastModified is always updated
      lastModified: updates.lastModified || new Date().toISOString(),
    };
    
    // 3. Write back to AsyncStorage
    await AsyncStorage.setItem(key, JSON.stringify(updatedCOIN));
    
    // 4. Emit update event
    EventEmitter.emit('coinUpdated', {
      coinId,
      updates,
      fullCOIN: updatedCOIN,
    });
    
    // 5. Return updated COIN
    return updatedCOIN;
  }
  
  static async getById(coinId: string): Promise<COIN | null> {
    const key = `${this.STORAGE_KEY_PREFIX}${coinId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
```

### Event-Based Updates

**COINRepository Event Emission:**
```typescript
// After successful update
EventEmitter.emit('coinUpdated', {
  coinId: 'coin-abc123',
  updates: {
    name: 'Updated Name',
    projectId: 'project-xyz',
  },
  fullCOIN: { /* complete COIN object */ },
});
```

**UC-200 (Recents) Listening:**
```typescript
// In RecentsScreen.tsx
useEffect(() => {
  const handleCOINUpdate = async ({ coinId, fullCOIN }) => {
    // Update COIN in local state
    setRecentCOINs(prev => 
      prev.map(coin => 
        coin.id === coinId ? fullCOIN : coin
      )
    );
    
    // OR: Refresh entire list from AsyncStorage
    // const refreshedRecents = await AccessHistoryService.getRecentCOINs(20);
    // setRecentCOINs(refreshedRecents);
  };
  
  const subscription = EventEmitter.on('coinUpdated', handleCOINUpdate);
  
  return () => subscription.remove();
}, []);
```

**UC-201 (Projects) Listening:**
```typescript
// In ProjectsScreen.tsx and ProjectDetailScreen.tsx
useEffect(() => {
  const handleCOINUpdate = async ({ coinId, fullCOIN, updates }) => {
    // If project changed, COIN may move between sections
    if (updates.projectId !== undefined) {
      // Refresh entire project structure
      await refreshProjects();
    } else {
      // Just update COIN in current list
      updateCOINInList(fullCOIN);
    }
  };
  
  const subscription = EventEmitter.on('coinUpdated', handleCOINUpdate);
  
  return () => subscription.remove();
}, []);
```

---

## Integration Points

### With UC-200 (Recents Tab)

**Access to UC-130:**
- Three-dot menu on COINCard → "Edit Details"
- Long-press on COINCard → "Edit Details" action
- Info icon (circle.info) on COINCard

**After Save:**
- COINCard updates immediately with new name, project badge, status badge
- COIN position in Recents list UNCHANGED (lastAccessed not updated)
- If user filtered by project or status, COIN may move or disappear from view

**Data Flow:**
```
RecentsScreen
    ↓ [tap edit button]
EditCOINMetadataScreen (modal)
    ↓ [save changes]
COINRepository.update()
    ↓ [emit event]
RecentsScreen (listening) → Updates COINCard
```

### With UC-201 (Projects Tab)

**Access to UC-130:**
- Same as UC-200: Three-dot menu, long-press, info icon on COINCard

**After Save (Projects List View):**
- If project changed: COIN moves to new project folder
- If project removed: COIN moves to root level
- If name/description/status changed: COIN updates in current location
- Folder counts update (# of COINs per project)

**After Save (Project Detail View):**
- If project changed to different project: COIN disappears from current view
- If project changed to "None": COIN disappears (moved to root)
- If other changes: COIN updates in list

**Data Flow:**
```
ProjectsScreen / ProjectDetailScreen
    ↓ [tap edit button, pass suggestedProjectId]
EditCOINMetadataScreen (modal)
    ↓ [save changes]
COINRepository.update()
    ↓ [emit event]
ProjectsScreen (listening) → Reorganizes project structure if needed
```

### With UC-110 (COIN Editor - Future)

**UC-130 Does NOT Open from UC-110:**
- UC-110 has its own inline name editing
- UC-110 has full canvas for editing content
- UC-130 is for quick edits from list views only

**However:**
- UC-110 can read metadata edited by UC-130
- UC-110 can edit metadata, which updates same fields as UC-130
- Both must maintain data consistency

### With COINRepository (Data Layer)

**UC-130's Only Storage Interaction:**
```typescript
// Read COIN on open
const coin = await COINRepository.getById(coinId);

// Write COIN on save
const updatedCOIN = await COINRepository.update(coinId, {
  name: formData.name.trim(),
  description: formData.description.trim(),
  projectId: formData.projectId,
  status: formData.status,
  lastModified: new Date().toISOString(),
});

// That's it - no other storage operations
```

**What UC-130 Does NOT Do:**
- Does not update lastAccessed (that's UC-110 only)
- Does not update canvas data (that's UC-110 only)
- Does not create COINs (that's UC-100)
- Does not delete COINs (that's UC-160, future)
- Does not manage projects (that's UC-201)

### Cross-Reference: Related Specifications

**See Also:**
- **UC-200 Specification:** For COINCard component shared between Recents and UC-130 access point
- **UC-201 Specification:** For Project data model and project picker behavior
- **Navigation Architecture Specification:** For modal presentation patterns and navigation configuration
- **Data Models Specification** (future): For complete COIN and Project TypeScript interfaces
- **Visual Design System** (future): For status badge colors, typography scale, spacing system

---

## Common Pitfalls to Avoid

### Data & State Management
1. **Don't forget to trim whitespace** - Always `.trim()` name and description before validation and save
2. **Don't forget to update lastModified** - Every save must update this timestamp
3. **Don't update lastAccessed** - UC-130 is metadata editing, not viewing - only UC-110 updates lastAccessed
4. **Don't lose form state on backgrounding** - Implement draft save to memory for restoration
5. **Don't forget dirty state tracking** - Must know when form has changes for confirmation prompt
6. **Don't forget to emit events** - COINRepository.update() must emit 'coinUpdated' for UI refresh

### Validation & Error Handling
7. **Don't validate on every keystroke** - Only validate name on blur, description for character count only
8. **Don't clear all errors at once** - Only clear error for field user is actively fixing
9. **Don't block UI on validation** - Validation must be <10ms, don't await async checks in Phase 1
10. **Don't forget to show where error is** - Focus first invalid field when save fails validation
11. **Don't assume AsyncStorage always succeeds** - Wrap in try/catch and handle gracefully
12. **Don't lose form data on error** - Keep modal open with data intact so user can retry

### UI & Interaction
13. **Don't forget auto-focus** - Name field must auto-focus on modal present (after animation)
14. **Don't forget confirmation on cancel** - Must check isDirty and show alert if changes exist
15. **Don't allow tap-outside to dismiss** - Form sheet modals require explicit action (iOS convention)
16. **Don't forget keyboard toolbar** - iPad users expect "Done" button on keyboard
17. **Don't obscure fields with keyboard** - Use KeyboardAvoidingView or ScrollView
18. **Don't forget haptic feedback** - iOS users expect haptics on save, cancel, errors
19. **Don't animate during Reduced Motion** - Check accessibility setting and use instant transitions

### Navigation & Integration
20. **Don't navigate to specific screen** - Use `navigation.goBack()` to return to wherever user came from
21. **Don't forget navigation params** - Must receive coinId, returnScreen, optional suggestedProjectId
22. **Don't forget usePreventRemove** - Must prevent accidental navigation away when form dirty
23. **Don't assume user came from specific screen** - returnScreen param tells you, but goBack() handles it

### Performance & Memory
24. **Don't use inline styles** - Use StyleSheet.create() for performance and consistency
25. **Don't forget to clean up listeners** - EventEmitter, Keyboard, AppState subscriptions must be removed
26. **Don't forget to clean up timers** - setTimeout, setInterval must be cleared in useEffect cleanup
27. **Don't keep modal mounted** - React Navigation unmounts on dismiss, but ensure no memory leaks
28. **Don't block animations** - Use native driver for all animations, keep JavaScript thread free

### Accessibility
29. **Don't forget accessibility labels** - Every field, button, and picker needs proper label and hint
30. **Don't skip VoiceOver testing** - Must be fully navigable and usable with VoiceOver
31. **Don't hardcode text sizes** - Support Dynamic Type scaling (use system text styles)
32. **Don't forget focus management** - VoiceOver focus must be logical and trapped within modal
33. **Don't forget error announcements** - Errors must be announced to VoiceOver immediately (live region)

### Edge Cases
34. **Don't assume projects exist** - Handle empty project list gracefully with disabled field and guidance
35. **Don't assume COIN exists** - Handle case where coinId is invalid (COIN deleted while modal open)
36. **Don't assume network available** - Phase 1 is offline, but architecture for Phase 2 sync
37. **Don't forget orientation changes** - Modal must reposition, form state must persist through rotation

---

## Testing Guidance

### Manual Testing Scenarios (Comprehensive)

**Priority 1: Critical Path (Must Pass)**

1. **Basic Edit and Save**
   - Open modal from Recents
   - Change name
   - Change description
   - Change project
   - Change status
   - Tap Save
   - ✓ Modal dismisses
   - ✓ All changes visible in card
   - ✓ No errors logged

2. **Cancel Without Changes**
   - Open modal
   - Don't change anything
   - Tap Cancel
   - ✓ Dismisses immediately (no confirmation)

3. **Cancel With Changes - Discard**
   - Open modal
   - Change name
   - Tap Cancel
   - Tap "Discard"
   - ✓ Changes not saved
   - ✓ Original data intact

4. **Cancel With Changes - Keep Editing**
   - Open modal
   - Change name
   - Tap Cancel
   - Tap "Keep Editing"
   - ✓ Modal stays open
   - ✓ Changes still present
   - Save successfully

5. **Empty Name Validation**
   - Open modal
   - Delete name completely
   - Tap outside field (blur)
   - ✓ Error appears: "Name is required"
   - ✓ Save button disabled
   - Type valid name
   - ✓ Error clears
   - ✓ Save enabled

**Priority 2: Core Features**

6. **Long Name Validation**
   - Type 100 characters
   - ✓ Character counter visible
   - ✓ Counter colors: gray → amber → red
   - ✓ Can save with 100 chars
   - Try typing 101st character
   - ✓ Blocked by maxLength

7. **Description Character Limit**
   - Type 500 characters
   - ✓ Counter updates live: "500/500"
   - ✓ Counter red at 481-500
   - ✓ Can save with 500 chars
   - ✓ Blocked at limit

8. **Change Project Assignment**
   - Open modal
   - Tap Project field
   - ✓ Action sheet appears
   - Select different project
   - Save
   - Go to Projects tab
   - ✓ COIN in new project section

9. **Remove Project Assignment**
   - Open modal with COIN in project
   - Tap Project field
   - Select "None"
   - Save
   - ✓ COIN at root level in Projects tab

10. **Change Status**
    - Open modal
    - Tap Status field
    - ✓ Action sheet with visual badges
    - Select "Review"
    - ✓ Badge updates in field
    - Save
    - ✓ Status badge updated on card

**Priority 3: Integration**

11. **Edit from Recents Tab**
    - In Recents tab
    - Tap edit on card
    - Make changes, save
    - ✓ Returns to Recents tab
    - ✓ Changes visible in card

12. **Edit from Projects Tab**
    - In Projects tab
    - Tap edit on card
    - Make changes, save
    - ✓ Returns to Projects tab
    - ✓ Changes visible in card

13. **Edit from Project Detail**
    - In Projects tab
    - Open a project
    - Tap edit on card
    - ✓ Modal opens with project pre-selected
    - Change name (not project)
    - Save
    - ✓ Returns to Project Detail
    - ✓ COIN still in same section

**Priority 4: iPad-Specific**

14. **Keyboard Handling**
    - Open modal
    - ✓ Name field focused automatically
    - ✓ Keyboard appears
    - Type in name, press "Next"
    - ✓ Description focused
    - Press "Done"
    - ✓ Keyboard dismisses

15. **Orientation Change**
    - Open modal in portrait
    - Make changes (don't save)
    - Rotate to landscape
    - ✓ Modal stays centered
    - ✓ All fields visible
    - ✓ Form data preserved
    - Rotate back, save
    - ✓ Success

16. **Hardware Keyboard Shortcuts**
    - Connect hardware keyboard
    - Open modal
    - Press Tab to navigate fields
    - Make changes
    - Press Cmd+S
    - ✓ Saves and closes
    - Open again
    - Press Cmd+W
    - ✓ Cancel (with confirmation)

17. **Swipe Down to Dismiss (Clean)**
    - Open modal
    - Don't change anything
    - Swipe down
    - ✓ Dismisses immediately

18. **Swipe Down to Dismiss (Dirty)**
    - Open modal
    - Make changes
    - Swipe down
    - ✓ Confirmation appears
    - Test both options

**Priority 5: Accessibility**

19. **VoiceOver Navigation**
    - Enable VoiceOver
    - Open modal
    - ✓ Announces "Edit Details"
    - Swipe through all fields
    - ✓ All fields announced correctly
    - ✓ Errors announced when appear
    - Double-tap to edit
    - Save using double-tap
    - ✓ All functions work

20. **Dynamic Type**
    - Increase text size to XXXL
    - Open modal
    - ✓ All text scales
    - ✓ Layout doesn't break
    - ✓ Modal scrollable if needed
    - All functions work

21. **Reduced Motion**
    - Enable Reduce Motion
    - Open modal
    - ✓ Appears instantly (no animation)
    - Edit and save
    - ✓ Dismisses instantly
    - All functions work

**Priority 6: Edge Cases**

22. **No Projects Exist**
    - Fresh install or delete all projects
    - Create COIN
    - Open edit modal
    - ✓ Project field disabled
    - ✓ Guidance text shown
    - ✓ Can save with no project

23. **Many Projects (10+)**
    - Create 15 projects
    - Open modal
    - Tap Project field
    - ✓ Action sheet scrollable
    - ✓ All 15 projects listed
    - Select one
    - ✓ Works normally

24. **Save Failure (Simulated)**
    - Mock AsyncStorage.setItem to throw error
    - Make changes
    - Tap Save
    - ✓ Error alert appears
    - ✓ Modal stays open
    - ✓ Form data preserved
    - Fix mock, retry
    - ✓ Saves successfully

25. **App Backgrounded During Edit**
    - Open modal
    - Make changes (don't save)
    - Background app (Home button or gesture)
    - Wait 30 seconds
    - Reopen app
    - ✓ Modal still open (if quick)
    - OR ✓ Restore prompt appears
    - ✓ Changes recoverable

### Automated Testing

**Unit Tests (Jest):**

```typescript
describe('UC-130: Edit COIN Metadata', () => {
  describe('Form Validation', () => {
    it('should require name field', () => {
      const errors = validateForm({ name: '', description: '', projectId: null, status: 'draft' });
      expect(errors.name).toBe('Name is required');
    });
    
    it('should enforce 100 character name limit', () => {
      const longName = 'a'.repeat(101);
      const errors = validateForm({ name: longName, description: '', projectId: null, status: 'draft' });
      expect(errors.name).toBe('Name must be 100 characters or less');
    });
    
    it('should accept valid name', () => {
      const errors = validateForm({ name: 'Valid Name', description: '', projectId: null, status: 'draft' });
      expect(errors.name).toBeUndefined();
    });
    
    it('should enforce 500 character description limit', () => {
      const longDesc = 'a'.repeat(501);
      const errors = validateForm({ name: 'Valid', description: longDesc, projectId: null, status: 'draft' });
      expect(errors.description).toBe('Description must be 500 characters or less');
    });
    
    it('should allow empty description', () => {
      const errors = validateForm({ name: 'Valid', description: '', projectId: null, status: 'draft' });
      expect(errors.description).toBeUndefined();
    });
  });
  
  describe('Dirty State Tracking', () => {
    it('should mark form as dirty when field changes', () => {
      const { result } = renderHook(() => useFormState());
      act(() => {
        result.current.updateField('name', 'New Name');
      });
      expect(result.current.isDirty).toBe(true);
    });
    
    it('should remain clean if no changes made', () => {
      const { result } = renderHook(() => useFormState());
      expect(result.current.isDirty).toBe(false);
    });
  });
  
  describe('Form State Management', () => {
    it('should clear error when user starts typing in field', () => {
      const { result } = renderHook(() => useFormState());
      act(() => {
        result.current.setErrors({ name: 'Name is required' });
      });
      expect(result.current.errors.name).toBe('Name is required');
      
      act(() => {
        result.current.updateField('name', 'N');
      });
      expect(result.current.errors.name).toBeUndefined();
    });
  });
});
```

**Integration Tests:**

```typescript
describe('UC-130 Integration', () => {
  it('should open modal, edit COIN, save, and update calling screen', async () => {
    // 1. Render Recents screen
    const { getByTestId, getByText } = render(<RecentsScreen />);
    
    // 2. Tap edit button on first COIN card
    const editButton = getByTestId('coin-card-edit-button-0');
    fireEvent.press(editButton);
    
    // 3. Modal should open
    await waitFor(() => {
      expect(getByText('Edit Details')).toBeTruthy();
    });
    
    // 4. Change name field
    const nameInput = getByTestId('metadata-name-input');
    fireEvent.changeText(nameInput, 'Updated Name');
    
    // 5. Change description
    const descInput = getByTestId('metadata-description-input');
    fireEvent.changeText(descInput, 'Updated description');
    
    // 6. Tap Save
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);
    
    // 7. Modal should dismiss
    await waitFor(() => {
      expect(() => getByText('Edit Details')).toThrow();
    });
    
    // 8. Recents screen should show updated COIN
    await waitFor(() => {
      expect(getByText('Updated Name')).toBeTruthy();
    });
  });
  
  it('should show confirmation when canceling with changes', async () => {
    const { getByTestId, getByText } = render(<EditCOINMetadataScreen route={mockRoute} />);
    
    // Make changes
    const nameInput = getByTestId('metadata-name-input');
    fireEvent.changeText(nameInput, 'Changed');
    
    // Tap Cancel
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    
    // Confirmation should appear
    await waitFor(() => {
      expect(getByText('Discard changes?')).toBeTruthy();
    });
  });
});
```

**E2E Tests (Detox):**

```typescript
describe('UC-130 E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should complete full edit flow from Recents to save', async () => {
    // Navigate to Recents tab
    await element(by.id('tab-recents')).tap();
    
    // Tap edit on first COIN
    await element(by.id('coin-card-0')).longPress();
    await element(by.text('Edit Details')).tap();
    
    // Wait for modal
    await waitFor(element(by.id('edit-metadata-modal')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Edit fields
    await element(by.id('metadata-name-input')).clearText();
    await element(by.id('metadata-name-input')).typeText('Updated COIN Name');
    
    await element(by.id('metadata-description-input')).typeText('This is an updated description');
    
    // Change project
    await element(by.id('metadata-project-picker')).tap();
    await element(by.text('Q4 2024 Initiatives')).tap();
    
    // Save
    await element(by.text('Save')).tap();
    
    // Verify modal dismissed
    await waitFor(element(by.id('edit-metadata-modal')))
      .not.toBeVisible()
      .withTimeout(2000);
    
    // Verify updated name visible in Recents
    await expect(element(by.text('Updated COIN Name'))).toBeVisible();
  });
  
  it('should handle validation error gracefully', async () => {
    await element(by.id('tab-recents')).tap();
    await element(by.id('coin-card-0')).longPress();
    await element(by.text('Edit Details')).tap();
    
    // Delete name
    await element(by.id('metadata-name-input')).clearText();
    await element(by.id('metadata-name-input')).tapBackspaceKey();
    
    // Tap outside to blur
    await element(by.id('metadata-description-input')).tap();
    
    // Error should appear
    await expect(element(by.text('Name is required'))).toBeVisible();
    
    // Save should be disabled
    await expect(element(by.text('Save')).atIndex(0)).toHaveToggleValue(false);
  });
});
```

---

## Technical Reference

### TypeScript Type Definitions (Complete)

```typescript
// Navigation types
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Param List (modal stack)
type RootStackParamList = {
  MainTabs: undefined;
  COINEditor: { coinId: string };
  EditCOINMetadata: {
    coinId: string;
    returnScreen: 'Recents' | 'Projects' | 'ProjectDetail';
    suggestedProjectId?: string;
  };
  CreateProject: undefined;
  Settings: undefined;
};

// Screen props for UC-130
type EditCOINMetadataScreenProps = StackScreenProps<
  RootStackParamList,
  'EditCOINMetadata'
>;

// Form data interfaces
interface EditMetadataFormData {
  name: string;
  description: string;
  projectId: string | null;
  status: COINStatus;
}

interface EditMetadataFormErrors {
  name?: string;
  description?: string;
  projectId?: string;
  status?: string;
}

interface EditMetadataFormState {
  data: EditMetadataFormData;
  errors: EditMetadataFormErrors;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

// COIN types (from shared)
enum COINStatus {
  Draft = 'draft',
  Review = 'review',
  Approved = 'approved',
  Archived = 'archived',
}

interface COIN {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  status: COINStatus;
  createdAt: string;
  lastModified: string;
  lastAccessed: string;
  canvas: CanvasData;
  metadata: CoinMetadata;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  lastModified: string;
}

// Repository update payload
interface COINUpdatePayload {
  name?: string;
  description?: string;
  projectId?: string | null;
  status?: COINStatus;
  lastModified?: string;
}

// Event payload
interface CoinUpdatedEvent {
  coinId: string;
  updates: COINUpdatePayload;
  fullCOIN: COIN;
}

// Status configuration
interface StatusConfig {
  label: string;
  color: string;
  icon: string;
  accessibilityLabel: string;
}

const STATUS_CONFIGS: Record<COINStatus, StatusConfig> = {
  [COINStatus.Draft]: {
    label: 'Draft',
    color: '#8E8E93',
    icon: 'clock.fill',
    accessibilityLabel: 'Draft status',
  },
  [COINStatus.Review]: {
    label: 'Review',
    color: '#FF9500',
    icon: 'circle.fill',
    accessibilityLabel: 'In review status',
  },
  [COINStatus.Approved]: {
    label: 'Approved',
    color: '#34C759',
    icon: 'checkmark.circle.fill',
    accessibilityLabel: 'Approved status',
  },
  [COINStatus.Archived]: {
    label: 'Archived',
    color: '#C7C7CC',
    icon: 'archivebox.fill',
    accessibilityLabel: 'Archived status',
  },
};
```

### Component Structure Reference

```
src/
├── screens/
│   └── EditCOINMetadataScreen.tsx       (Modal screen, 300-400 lines)
│
├── components/
│   ├── metadata/
│   │   ├── MetadataForm.tsx              (Form coordinator, 200-300 lines)
│   │   ├── NameInput.tsx                 (Text input with validation, 100-150 lines)
│   │   ├── DescriptionInput.tsx          (Multi-line text input, 150-200 lines)
│   │   ├── ProjectPicker.tsx             (Picker + action sheet, 150-200 lines)
│   │   ├── StatusPicker.tsx              (Picker + action sheet + badges, 200-250 lines)
│   │   └── FormActions.tsx               (Save/Cancel buttons, 100-150 lines)
│   │
│   └── shared/
│       └── ConfirmationAlert.tsx         (Reusable alert wrapper, 50-100 lines)
│
├── services/
│   ├── COINRepository.ts                 (Data access layer, existing + update())
│   ├── ProjectRepository.ts              (Project data access, existing)
│   └── EventEmitter.ts                   (Event system, existing)
│
├── utils/
│   ├── validation.ts                     (Form validation functions, 50-100 lines)
│   ├── dateFormatting.ts                 (Last modified formatting, existing)
│   └── accessibility.ts                  (Helper functions, 50-100 lines)
│
├── types/
│   ├── navigation.ts                     (Navigation types)
│   ├── forms.ts                          (Form types)
│   └── coin.ts                           (COIN types, existing)
│
└── hooks/
    ├── useFormState.ts                   (Form state management hook, 100-150 lines)
    ├── usePreventUnsavedChanges.ts      (Unsaved changes protection, 50-100 lines)
    └── useAccessibility.ts               (Accessibility helpers, 50-100 lines)
```

### Dependencies Required

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/stack": "^6.4.1",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "^2.17.1",
    "react-native-screens": "^3.34.0",
    "react-native-safe-area-context": "^4.10.5",
    "@react-native-async-storage/async-storage": "^1.24.0",
    "expo-haptics": "^13.0.1",
    "react-native-vector-icons": "^10.1.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.5.0",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "detox": "^20.24.2"
  }
}
```

---

## Success Metrics

**Implementation Complete When:**
- ✅ All 25 Priority 1-4 manual tests pass
- ✅ All automated tests pass (unit + integration + E2E)
- ✅ VoiceOver navigation smooth and logical
- ✅ Dynamic Type support verified at all sizes
- ✅ Reduced Motion works correctly
- ✅ Performance meets all targets (60fps, <500ms save)
- ✅ Visual design matches specification exactly
- ✅ Chuck approves on actual iPad
- ✅ Collin approves UX on actual iPad
- ✅ Use Case Registry updated to "✔️ Implemented"

**Quality Indicators:**
- Zero crashes during extensive testing
- Smooth 60fps animations throughout
- Intuitive without explanation (user doesn't hesitate)
- Feels native to iOS (not web-like)
- Works identically in both orientations
- All accessibility users can complete tasks
- All edge cases handled gracefully
- No console errors or warnings
- No memory leaks after 50+ opens/closes
- AsyncStorage updates reliably

---

## Summary for Claude Code

**What to Build:**
Form sheet modal for editing COIN metadata (name, description, project, status), accessible from COIN cards in UC-200 (Recents) and UC-201 (Projects) tabs. Includes comprehensive validation, project/status pickers, unsaved changes protection, and immediate UI updates.

**Key Technologies:**
- React Navigation 6.x (form sheet modal, usePreventRemove)
- React Native core (TextInput, ScrollView, KeyboardAvoidingView)
- ActionSheetIOS (project and status pickers)
- @react-native-async-storage/async-storage (data persistence)
- expo-haptics (tactile feedback)
- TypeScript (full type safety)

**Critical Requirements:**
- ✅ Form sheet modal presentation (`presentation: 'formSheet'`)
- ✅ Name field required, validated, auto-focused
- ✅ Description optional, 500 char limit with live counter
- ✅ Project picker: ActionSheetIOS with "None" option
- ✅ Status picker: ActionSheetIOS with visual badge emojis
- ✅ Unsaved changes protection (usePreventRemove + confirmation)
- ✅ Real-time validation with inline error messages
- ✅ Save validates → updates AsyncStorage → emits event → closes modal
- ✅ Returns to calling screen (Recents, Projects, or ProjectDetail)
- ✅ Changes reflected immediately in calling screen (event-based)
- ✅ Keyboard optimized: auto-focus, return key navigation, toolbar
- ✅ Hardware keyboard shortcuts: Cmd+S (save), Cmd+W/Esc (cancel)
- ✅ 60fps animations (native driver)
- ✅ Full VoiceOver support
- ✅ Dynamic Type support
- ✅ Reduced Motion support

**Test Focus:**
- Validation (empty name, long name, long description)
- Cancel confirmation (dirty vs clean form)
- Save/cancel from Recents vs Projects (correct return)
- Project selection and removal
- Status selection with visual feedback
- Keyboard interactions (auto-focus, return keys, shortcuts)
- Swipe to dismiss (with confirmation when dirty)
- Orientation changes (form state preserved)
- Error handling (save failures, invalid COIN ID)
- VoiceOver navigation
- Performance (60fps, <500ms save)
- Memory (no leaks)

**Integration Points:**
- UC-200 (Recents): Access point + listens for updates
- UC-201 (Projects): Access point + listens for updates + project reorganization
- COINRepository: update() method for data persistence
- ProjectRepository: getAll() for project picker
- EventEmitter: 'coinUpdated' event for cross-screen updates
- Navigation: Modal in global stack, returns via goBack()

**Architecture Notes:**
- Event-based updates (not navigation params callbacks)
- Form sheet modal (not full screen)
- ActionSheetIOS for pickers (not custom modals)
- Controlled form inputs (React state)
- Validation on blur (name) and submit (all)
- usePreventRemove for unsaved changes
- Clean up all listeners in useEffect cleanup
- Native driver for all animations
- Accessible by default (proper labels, hints, roles)

---

**This comprehensive specification provides everything needed to implement UC-130: Edit COIN Metadata for iPad. It incorporates all research findings, follows Navigation Architecture patterns, meets iOS conventions, and is production-ready for Claude Code generation.**

**Version History:**
- v1.0 (Oct 22, 2025): Initial specification from POC use case
- v2.0 (Oct 22, 2025): Comprehensive revision with all improvements:
  - Added research context and design rationale
  - Complete visual specifications with exact measurements
  - Navigation Architecture integration
  - Full TypeScript type definitions
  - Comprehensive scenario coverage (20 scenarios)
  - Complete accessibility implementation
  - Performance targets and benchmarks
  - State management and event system
  - Hardware keyboard support
  - Reduced Motion support
  - Memory management
  - Error handling patterns
  - 25+ testing scenarios
  - Common pitfalls section expanded to 37 items
  - Technical reference section
  - Cross-references to related specs

**Related Documents:**
- UC-130 Use Case Elaboration (POC version, to be re-elaborated)
- UC-200 Specification (reference example, Recents tab)
- UC-201 Specification (future, Projects tab)
- Navigation Architecture Specification
- Organizational Patterns Research
- Data Models Specification (future)
- Visual Design System (future)
