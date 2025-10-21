# Session 001 Handoff - October 20, 2025

**Session Duration:** ~3 hours  
**Token Usage:** 174,569 / 190,000 (92%)  
**Status:** ✅ Environment Setup Complete, Wave 1 Specifications Ready

---

## 🎯 What Was Accomplished

### Environment & Setup
1. ✅ **Migrated from Vite to Expo + React Native**
   - Archived Wave 0 (Vite proof-of-concept) in Git branch `archive/wave-0-vite`
   - Created fresh Expo project with TypeScript
   - Project location: `~/Projects/coin-app`
   - GitHub: https://github.com/chuck-boudreau/coin-app

2. ✅ **Configured for iPad**
   - `app.json` updated with iPad-specific settings
   - Bundle ID: `com.agiledesignmethods.coinapp`
   - Camera permissions added
   - Orientation: default (portrait + landscape)

3. ✅ **Installed Phase 1 Dependencies**
   - expo-camera, expo-image-picker
   - @react-navigation/native, @react-navigation/stack
   - react-native-screens, react-native-safe-area-context
   - expo-secure-store, @react-native-async-storage/async-storage

4. ✅ **Development Environment**
   - VS Code command line (`code` command) working
   - Claude Code CLI verified: v2.0.14
   - iOS Simulator tested successfully
   - Expo development server working
   - Git properly configured

5. ✅ **Documentation Created**
   - `CLAUDE_CODE_CONTEXT.md` - React Native development guide
   - `specifications/UC-201-View-List-COINs-Specification.md`
   - `specifications/UC-100-Create-New-COIN-Specification.md`

6. ✅ **Git & GitHub**
   - All changes committed and pushed
   - Clean working tree
   - VS Code Git interface learned

---

## 📋 Wave 1 Specifications Ready

### UC-201: View/List My COINs (HOME SCREEN) ⭐ DO THIS FIRST
**File:** `specifications/UC-201-View-List-COINs-Specification.md`

**What it is:**
- The main home screen / COIN library view
- Shows list of all COINs
- Empty state when no COINs exist
- Hosts the "New COIN" button
- This is where UC-100 gets triggered FROM

**Key components to generate:**
- `src/screens/HomeScreen.tsx` - Main screen
- `src/components/COINListItem.tsx` - Individual COIN card
- `src/components/EmptyState.tsx` - No COINs message
- `src/storage/COINRepository.ts` - AsyncStorage wrapper

**Important:** UC-201 must be implemented FIRST because it's the home screen that hosts UC-100's modal.

---

### UC-100: Create New COIN (MODAL) ⭐ DO THIS SECOND
**File:** `specifications/UC-100-Create-New-COIN-Specification.md`

**What it is:**
- Modal that slides up from bottom
- Text input for COIN name
- Save and Cancel buttons
- Validation for empty/duplicate names
- Triggered by "New COIN" button in UC-201

**Key components to generate:**
- `src/components/CreateCOINModal.tsx` - Modal component
- Integrates with COINRepository from UC-201
- Managed by HomeScreen (UC-201)

**Important:** This is called FROM HomeScreen, so UC-201 must exist first.

---

## 🔧 Technical Context

### Project Structure
```
~/Projects/coin-app/
├── specifications/
│   ├── UC-201-View-List-COINs-Specification.md
│   └── UC-100-Create-New-COIN-Specification.md
├── CLAUDE_CODE_CONTEXT.md
├── app.json (configured for iPad)
├── App.tsx (default Expo blank template)
├── package.json
└── .git/ (all history preserved)
```

### Key Files
- **CLAUDE_CODE_CONTEXT.md** - Critical React Native patterns and constraints
- **specifications/** - Complete use case specifications ready for Claude Code

### Google Drive Integration
- **Drive search enabled** ✅
- **Use case elaborations folder ID:** `1Xt8FsGoAQL8QnxSOBR0Dd47RNCaAlJwi`
- Search pattern: `'1Xt8FsGoAQL8QnxSOBR0Dd47RNCaAlJwi' in parents`

---

## 🚀 Immediate Next Steps (Wave 1 Implementation)

### Step 1: Generate UC-201 (HomeScreen)
```bash
cd ~/Projects/coin-app

# Use Claude Code to generate from specification
claude "Please implement UC-201 based on the specification in specifications/UC-201-View-List-COINs-Specification.md. Read CLAUDE_CODE_CONTEXT.md first for React Native patterns."
```

**Expected output:**
- `src/screens/HomeScreen.tsx`
- `src/components/COINListItem.tsx`
- `src/components/EmptyState.tsx`
- `src/storage/COINRepository.ts`
- `src/types/COIN.ts`

**Test it:**
```bash
npm start
# Press 'i' for iOS Simulator
# Should see empty state with "New COIN" button
```

---

### Step 2: Generate UC-100 (CreateCOINModal)
```bash
# Use Claude Code to generate from specification
claude "Please implement UC-100 based on the specification in specifications/UC-100-Create-New-COIN-Specification.md. This modal will be used by HomeScreen (UC-201). Read CLAUDE_CODE_CONTEXT.md for React Native patterns."
```

**Expected output:**
- `src/components/CreateCOINModal.tsx`
- Updates to HomeScreen to integrate modal

**Test it:**
```bash
npm start
# Press 'i' for iOS Simulator
# Tap "New COIN" button
# Modal should slide up
# Create a COIN
# Should appear in list
```

---

### Step 3: Integration Testing

**Test scenarios from specifications:**
1. Empty state displays correctly
2. "New COIN" button opens modal
3. Can create COIN with valid name
4. Empty name shows error
5. Duplicate name shows error
6. Created COIN appears in list
7. Works in portrait and landscape
8. Smooth 60fps animations

**Success criteria:**
- All scenarios pass
- Chuck approves on iPad
- Ready for UC-130 (Wave 1 continues)

---

## 📝 Important Context

### About Chuck
- 40+ years software development experience
- Knows what he's doing architecturally
- New to: Expo, React Native, Claude Code, GitHub
- Experienced with: Product development, requirements, business analysis
- **Needs:** Patient, step-by-step guidance on unfamiliar tools
- **Doesn't need:** Architecture advice or questioning decisions

### About the Project
- **Validated methodology** - COIN proven at IIBA Denver
- **Strategic phases** - iPad first, then web+backend, then enterprise
- **Vibe Coding approach** - Claude Code generates 100% of implementation
- **Zero manual coding** - Specifications → AI codes → Humans test

### Key Decisions Made
- Bundle ID: `com.agiledesignmethods.coinapp` (not chuckboudreau)
- Expo + React Native (not Vite, not pure React Native CLI)
- AsyncStorage for Phase 1 (cloud-ready data models for Phase 2)
- Use Case-Driven development (atomic, testable)

---

## ⚠️ Critical Reminders

### React Native vs React DOM
**Claude Code MUST generate React Native code, NOT React DOM:**
- ✅ Use: `View, Text, TouchableOpacity, TextInput, ScrollView, FlatList`
- ❌ Never: `div, span, button, input, form`
- ✅ Use: `StyleSheet.create()`
- ❌ Never: Tailwind CSS, className prop
- ✅ Use: `onPress`
- ❌ Never: `onClick`

### Storage
- ✅ Use: AsyncStorage
- ❌ Never: localStorage, sessionStorage (don't exist in React Native)

### Implementation Order
1. **UC-201 FIRST** (home screen/list)
2. **UC-100 SECOND** (create modal)
3. **Test together** (full create → display flow)

This order is critical because UC-100 is triggered FROM UC-201.

---

## 🔍 How to Search Google Drive for Use Cases
```javascript
// Search for specific use case
google_drive_search with:
  api_query: "'1Xt8FsGoAQL8QnxSOBR0Dd47RNCaAlJwi' in parents and name contains 'UC-XXX'"
  
// Fetch full content
google_drive_fetch with:
  document_ids: ["<document_id_from_search>"]
```

**Example use cases in Drive:**
- UC-100: Create a new COIN diagram
- UC-130: Edit the name and metadata for a COIN
- UC-140: Add elements to a COIN
- UC-201: View/List My COINs
- (20+ more use cases available)

---

## 🎯 Success Metrics for Next Session

**Session should be successful when:**
1. ✅ UC-201 implemented and displaying correctly
2. ✅ UC-100 implemented and integrated with UC-201
3. ✅ Can create COINs and see them in list
4. ✅ All main scenarios work on iPad simulator
5. ✅ Code committed to Git
6. ✅ Chuck approves functionality

---

## 📁 Files to Reference

### In Project
- `CLAUDE_CODE_CONTEXT.md` - React Native patterns
- `specifications/UC-201-View-List-COINs-Specification.md`
- `specifications/UC-100-Create-New-COIN-Specification.md`

### In Project Knowledge (uploaded to Claude)
- Project Context & Philosophy
- Architecture Decision Document
- Phase Roadmap
- Requirements Capture Strategy
- Use Case Progress Tracker
- Vibe Coding Instructions

### In Google Drive (accessible via drive_search)
- All use case elaborations (UC-100 through UC-360)
- Folder ID: `1Xt8FsGoAQL8QnxSOBR0Dd47RNCaAlJwi`

---

## 💡 Quick Commands Reference

### Development
```bash
# Start Expo dev server
cd ~/Projects/coin-app
npm start
# Then press 'i' for iOS Simulator

# Open in VS Code
code .

# Check Git status
git status
```

### Git (Terminal)
```bash
git add .
git commit -m "message"
git push origin main
```

### Git (VS Code)
1. Click Source Control icon (left sidebar)
2. Type commit message
3. Click "Commit" button
4. Click "Sync Changes" button

---

## 🎬 Starting Next Session

**Copy/paste this to start next Claude session:**
```
Continuing COIN App development from Session 001.

CONTEXT:
- Multi-platform ecosystem (iPad native + Web + Backend)
- Currently: Phase 1 - iPad app (Expo + React Native)
- Location: ~/Projects/coin-app
- GitHub: https://github.com/chuck-boudreau/coin-app

SESSION 001 COMPLETED:
- Expo environment fully configured
- iPad dependencies installed
- UC-201 and UC-100 specifications ready
- CLAUDE_CODE_CONTEXT.md created
- Everything committed to Git

IMMEDIATE TASK:
Use Claude Code to implement UC-201 (home screen) and UC-100 (create modal) based on the specifications in the specifications/ folder.

Implementation order:
1. UC-201 FIRST (HomeScreen with list and empty state)
2. UC-100 SECOND (CreateCOINModal integrated into HomeScreen)
3. Test both together on iPad simulator

Please search project knowledge for:
- Session 001 Handoff document (this file)
- CLAUDE_CODE_CONTEXT.md
- UC-201 and UC-100 specifications

Let's start by having Claude Code generate UC-201.
```

---

## 📊 Token Budget Planning

**Session 001 used:** 174,569 tokens (92%)

**Estimated for Session 002:**
- Claude Code generation: ~30K tokens
- Testing iterations: ~20K tokens
- Debugging/refinement: ~20K tokens
- Documentation: ~10K tokens
- **Total estimated:** ~80K tokens (good for one session)

**Recommendation:** Plan for 2-3 sessions to complete Wave 1 (UC-100, UC-201, UC-130)

---

## ✅ Pre-Session 002 Checklist

Before starting next session, verify:
- [ ] `npm start` works in coin-app
- [ ] iOS Simulator launches with 'i' command
- [ ] VS Code opens project: `code ~/Projects/coin-app`
- [ ] `claude --version` shows 2.0.14
- [ ] Git status clean: `git status`
- [ ] Specifications exist in `specifications/` folder

---

**END OF SESSION 001 HANDOFF**

**Status:** Ready for Wave 1 Implementation  
**Next:** Claude Code generates UC-201 and UC-100  
**Contact:** Chuck Boudreau (chuck@chuckboudreau.com)