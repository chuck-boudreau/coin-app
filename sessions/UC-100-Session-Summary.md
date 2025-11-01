# UC-100 Session Summary: Create New COIN

**Date:** October 31, 2025
**Status:** ✅ Complete and Accepted
**Branch:** `feature/uc-100`
**Commits:** 490dc78, 8789677

---

## 🎯 Objective

Implement COIN creation workflow with canvas entry point, allowing users to create new COINs from any tab with context-aware project assignment.

---

## 📋 What Was Implemented

### Files Created
1. **src/components/COINEditorHeader.tsx** - Canvas header with project display and name input
2. **src/components/COINEditorToolbar.tsx** - Bottom toolbar with Save button
3. **src/screens/COINEditorScreen.tsx** - Main COIN editor canvas screen

### Files Modified
1. **App.tsx** - Added RootStack navigation wrapper, COINEditor modal, default project logic, iOS 26 padding
2. **src/contexts/COINContext.tsx** - Changed `createCOIN()` to return COIN ID for stay-in-editor workflow
3. **src/types/index.ts** - Added `projectId` and `sourceTab` to COINEditorParams
4. **src/components/COINCard.tsx** - Replaced ActionSheetIOS with cross-platform action sheet
5. **src/components/COINListItem.tsx** - Replaced ActionSheetIOS with cross-platform action sheet
6. **package.json** - Added `@expo/react-native-action-sheet` dependency

### Specifications Created
1. **specifications/UC-100-Specification.md** - Complete UC specification
2. **specifications/Navigation-Architecture-Specification.md** - Navigation patterns reference
3. **process-docs/Design-Research-IA-Patterns.md** - UX research foundations

---

## 🔄 Major Strategic Pivot

### Initial Design (Abandoned)
- Form modal with project picker
- Inline project selection dropdown
- Separate project creation modal
- Cancel + Save toolbar buttons

### Final Design (Implemented)
- **Document editor pattern** (like Word, Notes, Pages)
- **Context-aware project assignment** (immutable at creation)
- **Read-only project display** (for orientation only)
- **Back button navigation** (no Cancel button)
- **Stay-in-editor workflow** (create → edit mode transition)

### Why We Pivoted

**User feedback:** "You are thinking like a programmer and not like a user experience designer."

**Key insights:**
1. Project selection complexity was causing sync bugs (name vs reference confusion)
2. Users open editor with intent to edit, not just to name and close
3. Cognitive friction from managing project selection during creation flow
4. Context-aware assignment eliminates entire class of bugs by design

**Research-driven:** Decision aligned with Design-Research-IA-Patterns.md principles about minimizing cognitive load and context switching.

---

## 🐛 Critical Bugs Fixed

### 1. State Closure Bug (CRITICAL)
**Symptom:** COIN names truncated to first letter ever typed
**Root Cause:** `beforeRemove` listener captured stale state in `handleSave` callback
**Solution:** Refs pattern to always access latest state values

```typescript
// Problem: Captured state
const handleSave = useCallback(async () => {
  await createCOIN(coinName.trim(), currentProjectId); // Stale values!
}, [coinName, currentProjectId]);

// Solution: Refs
const coinNameRef = useRef(coinName);
useEffect(() => { coinNameRef.current = coinName; }, [coinName]);

const handleSave = useCallback(async () => {
  const latestCoinName = coinNameRef.current; // Always current!
  await createCOIN(latestCoinName.trim(), latestProjectId);
}, [coins, projects, createCOIN, updateCOIN]);
```

### 2. Default Project Logic Missing
**Problem:** Recents/Favorites tabs showed blocking Alert when user tapped "+"
**Solution:** Default project selection logic (prefer "My COINs", else alphabetically first active project)

```typescript
const myCOINsProject = projects.find(p => p.name === 'My COINs' && p.status === 'active');
const defaultProject = myCOINsProject || projects
  .filter(p => p.status === 'active')
  .sort((a, b) => a.name.localeCompare(b.name))[0];
```

### 3. ActionSheet Modal Interaction Bug
**Problem:** In iOS Simulator, could interact with background content while action sheet was open (scroll, swipe cards)
**Solution:** Replaced `ActionSheetIOS` with `@expo/react-native-action-sheet` for proper backdrop and touch event blocking

### 4. iOS 26+ Window Control Collisions
**Problem:** Window control buttons overlaying header content, resize handle colliding with toolbar
**Solution:** Conditional padding based on windowed mode detection

```typescript
const isResizableWindow = Platform.OS === 'ios' &&
  parseInt(Platform.Version as string, 10) >= 26;

// Header: Avoid window controls (top-left)
headerResizable: { paddingTop: 44 }

// Toolbar: Avoid resize handle (bottom-right)
toolbarResizable: { paddingRight: 36 }
```

---

## 🎨 Design Patterns Established

### 1. Document Editor Pattern (Not Form Modal)
- Back button navigation (not Cancel button)
- Save stays visible, doesn't close editor
- Create mode transitions to Edit mode after first save
- Unsaved changes warning on back navigation

**Critical:** Document editors don't have Cancel buttons - this is a universal pattern (Word, Notes, Pages, Google Docs).

### 2. Context-Aware Project Assignment
- Project assigned based on creation context, NOT user selection
- Immutable at creation (no inline project picker/editor)
- From ProjectDetail → auto-assigned to that project
- From Recents/Favorites → uses default project logic
- Future "Move COIN" UC for reassignment

**Benefit:** Eliminates entire class of sync bugs by design.

### 3. Project Display Read-Only Pattern
- Project shown for orientation (user needs context in modal)
- Not editable inline (prevents sync bugs and cognitive friction)
- Single source of truth: Name derived from `projects.find()` reference
- Never stored as COIN attribute, always computed

### 4. State Closure Fix with Refs Pattern
- Event handlers capture state at listener setup time
- Use refs + useEffect to always access latest values
- **CRITICAL** for handlers in navigation listeners
- **MUST USE** when `beforeRemove` or similar handlers access state

### 5. Back Button with Unsaved Changes Pattern
- `beforeRemove` listener intercepts back navigation
- Alert with 3 options: Keep Editing, Save, Discard
- Save option calls `handleSave()` then navigates
- Discard has haptic feedback for destructive action

### 6. Name Uniqueness Validation Pattern
- Enforce unique names within project scope
- Professional tool expectation (single source of truth)
- Prevents confusion when referencing COINs in meetings/docs
- Helpful error messages suggest alternatives

**Design Decision:** Enforced uniqueness is appropriate for business process design tools (not casual document editors).

### 7. iOS 26+ Modal Window Controls Pattern
- Detect windowed vs maximized mode
- Header needs padding to avoid window control buttons (top-left)
- Toolbar needs padding to avoid resize handle (bottom-right)
- Different padding values for different contexts

### 8. Source Tab Back Button Label Pattern
- Back button shows which tab opened the editor
- Pass `sourceTab` param in navigation
- Provides clear navigation context for users
- Shows "< Recents", "< Favorites", or "< Project"

---

## 🧪 Testing Results

### Tested Scenarios ✅
- [x] Create COIN from ProjectDetail (auto-assigns to that project)
- [x] Create COIN from Recents (uses default project)
- [x] Create COIN from Favorites (uses default project)
- [x] Save with valid name (transitions create → edit mode, stays in editor)
- [x] Back button with unsaved changes (Alert with 3 options)
- [x] Back button without changes (navigates immediately)
- [x] Duplicate name validation (shows error, prevents save)
- [x] Empty name validation (shows error, prevents save)
- [x] iOS 26 windowed mode (no UI collisions)
- [x] iOS 26 maximized mode (proper padding)
- [x] Long-press action sheet (proper backdrop, no background interaction)
- [x] State closure bug (names save correctly, not truncated)

### Edge Cases Covered
- [x] No projects exist (Alert prompts to create project first)
- [x] "My COINs" project exists (preferred as default)
- [x] "My COINs" project doesn't exist (uses alphabetically first)
- [x] Extremely long COIN names (validation, UI handles gracefully)
- [x] Rapid typing and immediate back button (refs capture latest state)

---

## 📊 Integration Points

### Ready for Future UCs

**UC-101: Edit Existing COIN**
- Editor already supports edit mode
- Just needs card press navigation hookup
- Same validation and save patterns apply

**UC-102: Delete COIN**
- Long-press menu already has Delete option (placeholder)
- Just needs confirmation dialog and deletion logic

**UC-210: Move COIN to Project**
- Context-aware design makes this a separate, explicit operation
- No confusion with inline editing (which doesn't exist)

---

## 🎓 Lessons Learned

### What Went Well
1. **Strategic pivot based on user feedback** - Eliminating project picker eliminated sync bugs by design
2. **Refs pattern for state closure** - Solved critical bug that would have been hard to diagnose
3. **Document editor pattern** - Aligns with user mental models from other apps
4. **Research-driven decisions** - Design-Research-IA-Patterns.md provided clear rationale

### What Could Improve
1. **Premature session closeout** - Should wait for explicit user confirmation before writing completion summaries
2. **Specification completeness** - Initial spec didn't anticipate state closure issue in navigation listeners
3. **Testing in simulator earlier** - ActionSheet bug would have been caught sooner with systematic testing

### Process Improvements
1. **Session Closure Protocol:** Never write "✅ Completed Tasks" messages without explicit user confirmation
2. **State Management Checklist:** Always consider state closure when using navigation listeners
3. **Simulator Testing:** Test long-press and modal interactions in simulator, not just on device

---

## 📦 Dependencies Added

```json
{
  "@expo/react-native-action-sheet": "^4.1.0"
}
```

**Why:** Cross-platform action sheet with proper backdrop and touch event blocking, fixing simulator interaction bug.

---

## 🔗 Related Documents

- **Specification:** `specifications/UC-100-Specification.md`
- **Design Research:** `process-docs/Design-Research-IA-Patterns.md`
- **Navigation Architecture:** `specifications/Navigation-Architecture-Specification.md`
- **CLAUDE.md Updated:** UC-100 patterns added to persistent context

---

## 🎯 Acceptance Criteria Met

- [x] Users can create new COINs from any tab
- [x] Project assignment is context-aware (immutable at creation)
- [x] COIN name validation (required, unique within project)
- [x] Canvas screen displays project context (read-only)
- [x] Back navigation with unsaved changes warning
- [x] Stay-in-editor workflow (create → edit mode)
- [x] iOS 26+ windowed mode support (no UI collisions)
- [x] Long-press action sheet properly blocks background interaction
- [x] All previous UC features still work (no regressions)

---

## 🚀 Next Steps

**Recommended Next UC:**
- **UC-101:** Edit Existing COIN - Hook up card press to open editor in edit mode
- **UC-102:** Delete COIN - Implement deletion with confirmation
- **UC-210:** Move COIN to Project - Reassignment UI (now that inline editing is removed)

**Feature Branch:** `feature/uc-100` ready for merge to `main` after acceptance testing on physical iPad.

---

**Session Duration:** Extended session with strategic pivot
**Total Commits:** 2 (UC-100 implementation + ActionSheet fix)
**Lines Changed:** ~5,200 insertions, ~200 deletions
**Status:** ✅ Ready for iPad Testing and Merge
