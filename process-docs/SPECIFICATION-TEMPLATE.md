# UC-XXX: [Feature Name] - Implementation Specification for Claude Code

**Version:** 1.0  
**Date:** [Current Date]  
**Platform:** React Native + Expo (iPad) _[or "React + Vite (Web)" or "Node.js + Express (Backend)"]_  
**Use Case Reference:** UC-XXX elaboration document v[X.X]  
**Target:** 8-9/10 specification quality

---

## 📋 CRITICAL: Read These First

**Session Summaries (REQUIRED READING):**
- ✅ `sessions/UC-[previous]-Session-Summary.md` - [What patterns/components to reuse]
- ✅ `sessions/UC-[another]-Session-Summary.md` - [What else to reference]

**Context Documents (REQUIRED READING):**
- ✅ `CLAUDE.md` - Current project state, established patterns, integration rules
- ✅ `CLAUDE_CODE_CONTEXT.md` - React Native fundamentals _(if applicable)_

**Process Document (REQUIRED READING):**
- ✅ `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` - Complete workflow for this UC

**Architecture References:**
- [List relevant architecture docs: Navigation Architecture, Data Models, Security, etc.]

---

## 🔀 Git Workflow - CRITICAL FIRST STEP

**⚠️ BEFORE implementing ANY code, you MUST create a feature branch.**

**Reference:** `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` (Step 2)

### Create Feature Branch First

```bash
cd ~/Projects/coin-app

# Create feature branch from main
git checkout -b feature/uc-XXX

# Verify clean state
git status

# Test that current code still works
npm start
```

**Branch Name:** `feature/uc-XXX`

**Verify:** Current app must work before starting implementation.

**Only proceed with implementation after branch is created and verified working.**

---

## 🎯 Project Overview

**What You're Building:** [One-sentence description of the feature]

**Context:** [2-3 paragraphs explaining:
- Why this feature exists
- How it fits into the larger app
- Who will use it and when
- What problem it solves]

**Platform:** [Native iPad app using React Native + Expo / Web app using React + Vite / Backend API using Node.js + Express]

**Current Status:** [List completed related UCs]

**Dependencies:** [List UCs this builds upon]

---

## 🔗 Integration with Existing Code

### Current Codebase (from CLAUDE.md - VERIFIED)

✅ **Already Implemented:**
- [List existing features/components that are relevant]
- [Three-tab navigation / User authentication / Data models / etc.]
- [Components to reuse]
- [Patterns established]

✅ **Shared State Management:**
- [Describe any shared context/state]
- [What this UC can access from existing state]
- [What this UC should NOT create duplicates of]

### This UC Must

✅ **REUSE existing components (DO NOT recreate):**
- [ComponentName] - Use exactly as-is for [purpose]
- [AnotherComponent] - Use exactly as-is for [purpose]
- [Pattern] - Follow [ExistingScreen] pattern for [purpose]

✅ **REUSE existing context/state:**
- [ContextName] for accessing [data]
- Use [field] from context (shared across [where])

✅ **FOLLOW established patterns:**
- Same [pattern description]
- Same [another pattern]
- Same [integration pattern]

### DO NOT

❌ **DO NOT modify these files unless spec explicitly says:**
- `[file path]` - Modify ONLY as specified in [Section Name]
- `[another file]` - Must continue to work (no regressions)
- `[component file]` - DO NOT modify (use as-is)

❌ **DO NOT create duplicate components:**
- DO NOT create [DuplicateComponent] (use [ExistingComponent])
- DO NOT create [another thing] (use existing [pattern])

---

## 📊 Data Model Changes

_[If this UC requires data model changes, include this section. Otherwise, state "No data model changes required for this UC."]_

### Step X: [Add/Update] [Interface Name] in src/types/index.ts

[For new interfaces:]
Add this NEW interface to `src/types/index.ts`:

```typescript
export interface InterfaceName {
  // ===== CATEGORY =====
  field: type;                   // Description and constraints
  anotherField?: type;           // Optional field description
  
  // ===== ANOTHER CATEGORY =====
  relatedField: type;            // Description
}

export type TypeName = 'value1' | 'value2' | 'value3';
```

[For updating existing interfaces:]
MODIFY the existing [InterfaceName] interface (find it in the file, add these fields):

```typescript
export interface ExistingInterface {
  // ... existing fields ...
  
  // ===== ADD THESE FIELDS =====
  newField: type;                // Description and purpose
  anotherNewField?: type;        // Optional field description
  
  // ... rest of existing fields ...
}
```

**CRITICAL NOTES:**
- [Any important notes about the data model]
- [Phase 1 vs Phase 2/3 considerations]
- [Relationships to other data models]

---

## 🗂️ Mock Data Strategy

_[If this UC requires test data, include this section]_

### Step X: [Add/Update] Mock Data in src/utils/mockData.ts

**ADD [these items] to mockData.ts:**

```typescript
export const mockItems: ItemType[] = [
  {
    field: 'value',
    anotherField: 'value',
    // ... complete realistic test data
  },
  // ... more items
];
```

**UPDATE existing [items] in mockData.ts:**

[Explain which existing items need updates and what fields to add]

**Distribution strategy:**
- [Item 1]: X instances with [characteristics]
- [Item 2]: Y instances with [characteristics]
- [Root-level/Unassigned]: Z instances

**Total:** [X] items ([breakdown])

---

## 🏗️ Implementation Steps

_[Break implementation into numbered steps. Each step should be clear and testable.]_

### Step 1: [First Major Step]

**File:** `src/[path]/[filename].tsx`

**Purpose:** [What this step accomplishes]

**Props/State:**
```typescript
interface ComponentProps {
  prop: type;
  handler: (param: type) => void;
}
```

**Layout:**
```
[ASCII diagram or description of layout]
┌─────────────────────────┐
│  [Element]              │
│  [Another Element]      │
│                         │
│  [Content Area]         │
└─────────────────────────┘
```

**Implementation Notes:**
- [Technical guidance]
- [Integration requirements]
- [Special considerations]
- [Patterns to follow]

---

### Step 2: [Second Major Step]

[Repeat pattern from Step 1]

---

[Continue with all implementation steps...]

---

## 🎯 When to Initiate Session Closeout

**Claude Code: When you believe implementation is complete, proactively ask Chuck:**

```
I believe UC-XXX is complete and ready for closeout. Here's what I've verified:

✅ All acceptance criteria met (see checklist below)
✅ Tested in [portrait and landscape / multiple browsers / API endpoints]
✅ No regressions in [list related UCs]
✅ All TypeScript compilation errors resolved
✅ App runs without console errors or warnings
✅ [Other relevant verification items]

Would you like me to begin the session closeout process?
This includes:
- Step 4a: Generate comprehensive session summary
- Step 4b: Update CLAUDE.md with UC-XXX patterns
- Step 5: Commit all changes and push to feature branch

Ready to proceed with closeout? (yes/no)
```

**If Chuck says "yes":** Proceed with Steps 4a-5 below

**If Chuck says "not quite" or requests changes:** 
- Continue iterating on requested changes
- Re-offer closeout when changes complete
- Ask: "What would you like me to adjust?"

---

## 📋 Session Closeout Protocol

**Reference:** `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` (Steps 4-6)

**When Chuck confirms "ready to close out" or says "yes" to closeout offer:**

---

### Step 4a: Generate Session Summary

**Create comprehensive implementation summary:**

```
Please create the session summary now. Include:

1. **Files Created/Modified** - Complete list with purpose
2. **Features Implemented** - All functionality added
3. **Components Created** - Each component with description
4. **Data Model Changes** - Types, interfaces, mock data
5. **Enhancements Beyond Spec** - Anything you improved
6. **Integration Verification** - [Related UCs] still working
7. **Current Application State** - What works now
8. **Key Design Decisions** - Important choices made
9. **Testing Completed** - What was verified
10. **Future UC Integration Points** - What's ready for [next UCs]

Save as: `~/Projects/coin-app/sessions/UC-XXX-Session-Summary.md`
```

**Wait for Chuck to review summary before proceeding to Step 4b.**

---

### Step 4b: Update CLAUDE.md (CRITICAL - Atomic with Code)

**After session summary is approved, update CLAUDE.md immediately:**

```
Now update CLAUDE.md with UC-XXX patterns:

1. Mark UC-XXX as implemented in "Implemented Use Cases" section
2. Update "Current UC Being Implemented" to next UC (if known)
3. Add new components to "Current Structure" section:
   - [List all new files/components created]
4. Document [new data models] in "Key Interfaces" section
5. Add [new patterns] to relevant sections
6. Document new AsyncStorage keys (if applicable):
   - @design_the_what:[new_key]
7. Add integration notes for future UCs ([list related UCs])
8. Update header metadata (date, last UC completed)

Make changes directly to CLAUDE.md file.
```

**Chuck will review CLAUDE.md changes for accuracy before commit.**

---

### Step 5: Commit Everything Together

**Pre-commit verification checklist:**

Before running commit command, verify:
- [ ] Session summary generated and saved to `sessions/`
- [ ] CLAUDE.md updated with UC-XXX patterns
- [ ] Run `git status` to see staged changes
- [ ] Verify no unintended file changes
- [ ] Run `npm run build` or equivalent to check TypeScript compilation
- [ ] Run `npm start` to verify app launches without errors
- [ ] Check console for any warnings or errors

**Only proceed with commit if ALL checkboxes above are verified.**

---

**Commit and push to feature branch:**

```bash
cd ~/Projects/coin-app

# Stage all changes
git add .

# Review what's being committed
git status

# Commit with detailed message
git commit -m "feat: UC-XXX [Feature Name]

Implemented:
- [Major feature 1]
- [Major feature 2]
- [Major feature 3]

[Additional details organized by category:
- Data model changes
- Components created
- Integration points
- Testing completed
- Documentation updates]

[Future integration points]
[Testing notes]
[Documentation included]"

# Push to feature branch
git push origin feature/uc-XXX
```

**After push completes, confirm to Chuck:**

```
✅ Step 5 Complete:

All changes committed to feature branch `feature/uc-XXX` and pushed to GitHub.

Commit includes:
- Implementation code (all new files and modifications)
- Session summary (sessions/UC-XXX-Session-Summary.md)
- CLAUDE.md updates (atomic with code changes)

Branch: feature/uc-XXX
Ready for: Step 6 (merge to main)

Waiting for your approval to merge to main...
```

---

### Step 6: Merge to Main (REQUIRES EXPLICIT APPROVAL)

**⚠️ STOP - Request explicit approval before merging:**

```
Feature branch `feature/uc-XXX` is ready to merge.

Changes summary:
- [X] files modified
- [X] files created
- Session summary saved
- CLAUDE.md updated

All changes committed and pushed to feature/uc-XXX.

Ready to merge to main? 

Type "yes" to proceed with merge, or "wait" if you want to review the commit first.
```

**ONLY proceed if Chuck explicitly says "yes" or "merge" or "go ahead"**

---

**If Chuck approves, execute merge:**

```bash
cd ~/Projects/coin-app

# Switch to main branch
git checkout main

# Pull latest (safety check)
git pull origin main

# Merge feature branch
git merge feature/uc-XXX

# Push to GitHub
git push origin main
```

**After successful merge, confirm:**

```
✅ UC-XXX Session Complete!

Branch merged: feature/uc-XXX → main
All changes pushed to GitHub
Documentation updated and committed atomically with code

Remaining manual steps for Chuck:
- [ ] Update Use Case Registry (mark UC-XXX as ✔️ Implemented with date)
- [ ] Update README.md (if needed)

Session closeout complete! 🚀

Feature branch `feature/uc-XXX` can be kept for reference or deleted.
```

---

## 🔄 If Issues Arise During Closeout

### If Step 4b (CLAUDE.md update) reveals problems:
- **Stop immediately** - Don't proceed to commit
- Fix issues in implementation code
- Re-test thoroughly
- Restart from Step 4a (regenerate session summary)

### If git commit fails or errors occur:
- **Don't force it** - Something is wrong
- Run `git status` to see what's happening
- Ask Chuck for guidance
- Reference DEVELOPMENT-PROCESS.md troubleshooting section

### If Chuck says "not ready" during closeout offer:
- Continue iterating on requested changes
- Ask: "What would you like me to adjust?"
- Re-offer closeout when changes complete
- Don't proceed to Steps 4-6 until approved

### If pre-commit verification fails:
- Fix the failing item (TypeScript errors, console warnings, etc.)
- Re-run verification checklist
- Only proceed when ALL items check out

### If merge creates conflicts:
- **Stop immediately** - Don't force merge
- Show Chuck the conflicts
- Ask for guidance on resolution
- May need to abort merge and investigate

---

## 📝 Acceptance Criteria

**This UC is complete when all of these are verified:**

### ✅ Visual Requirements
- [ ] [Visual requirement 1]
- [ ] [Visual requirement 2]
- [ ] [Layout responsive in portrait and landscape]
- [ ] [Consistent with established design patterns]

### ✅ Functional Requirements
- [ ] [Functional requirement 1]
- [ ] [Functional requirement 2]
- [ ] [All user scenarios work]
- [ ] [Edge cases handled]

### ✅ Data Requirements
- [ ] [Data model defined correctly]
- [ ] [Mock data includes required test cases]
- [ ] [Persistence works correctly]

### ✅ Integration Requirements
- [ ] [Related UC 1] still works perfectly
- [ ] [Related UC 2] still works perfectly
- [ ] No regressions in existing features
- [ ] Shared components work in all contexts

### ✅ Persistence Requirements _(if applicable)_
- [ ] [Data persists across app restarts]
- [ ] [AsyncStorage keys follow naming convention]
- [ ] [Preferences sync correctly]

### ✅ Performance Requirements
- [ ] Smooth 60fps scrolling _(if applicable)_
- [ ] No lag on interactions
- [ ] Efficient re-renders (useMemo, useCallback used)

### ✅ Code Quality Requirements
- [ ] All TypeScript types defined (no `any` types)
- [ ] No console errors in terminal
- [ ] No console warnings in terminal
- [ ] Follows established patterns

### ✅ Documentation Requirements
- [ ] Specification saved to `specifications/` folder
- [ ] Session summary saved to `sessions/` folder
- [ ] CLAUDE.md updated (committed atomically)
- [ ] Git commit message detailed and descriptive

### ✅ Git Requirements
- [ ] Feature branch created before implementation
- [ ] All files committed to feature branch
- [ ] Pushed to GitHub
- [ ] Merged to main (after approval)

---

## 🔄 Future UC Integration Notes

### UC-[Next]: [Next Feature] (Next UC)

**This UC establishes:**
- ✅ [What this UC provides]
- ✅ [Patterns established]
- ✅ [Components created]

**UC-[Next] will add:**
- [New capability 1]
- [New capability 2]
- [Integration with this UC]

**Integration points ready:**
- [Handler/component/pattern that's ready]
- [Another integration point]

### UC-[Future]: [Future Feature] (Future)

**Integration points ready:**
- [What's already in place]
- [What will connect in the future]

---

## ⚠️ Known Limitations (Intentional Deferrals)

**Phase 1 Scope (These are NOT bugs):**
- ✅ [Limitation 1 with reasoning]
- ✅ [Limitation 2 with reasoning]
- ✅ [Feature that's deferred to Phase 2/3]

**Deferred to Future UCs:**
- [Feature]: [Which UC will implement it]
- [Another feature]: [Reasoning for deferral]

---

## 📚 References

**Session Summaries (Pattern Reference):**
- `sessions/UC-[related]-Session-Summary.md` - [What to reference]

**Architecture Documents:**
- [Document name] - [What it covers]
- [Another document] - [What it covers]

**Process Documents:**
- `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` - Complete workflow
- SPECIFICATION-QUALITY-CHECKLIST.md - This spec targets 8-9/10 quality

---

## ✅ Specification Quality Self-Assessment

**Essential Elements (Must Have - 10/10):**
- ✅ Context setting
- ✅ Git workflow (Step 2 upfront, Steps 4-6 at end)
- ✅ Component reuse
- ✅ Step-by-step implementation
- ✅ Data model changes (if applicable)
- ✅ Testing checklist
- ✅ Acceptance criteria
- ✅ Session closeout protocol

**Quality Enhancements (Should Have 70%+ - 8/10):**
- ✅ State management strategy
- ✅ Default behaviors
- ✅ Performance considerations
- ✅ Integration impact analysis
- ✅ Proactive closeout initiation

**Excellent Specifications (Nice to Have 30%+ - 7/10):**
- ✅ Design refinement guidance
- ✅ Future UC integration notes
- ✅ Known limitations section
- ✅ Escape hatch guidance

**Target:** 8-9/10 ✅
- Detailed enough to guide implementation
- Flexible enough for refinement and iteration
- Clear Git workflow preventing common mistakes
- Proactive closeout preventing forgotten steps

---

## 🎯 Final Notes for Claude Code

**This specification is comprehensive and includes:**
- Complete Git workflow (create branch → implement → closeout → merge)
- Proactive closeout detection (ask when you think it's done)
- Verification gates (don't commit if TypeScript errors exist)
- Approval gates (don't merge without explicit "yes")
- Escape hatches (what to do if problems arise)

**Your role in this process:**
1. **Start:** Create feature branch (Step 2)
2. **Build:** Implement all features with iteration
3. **Detect:** Recognize when complete, ask to close out
4. **Document:** Generate summary and update CLAUDE.md
5. **Commit:** Stage, commit, push (with verification)
6. **Merge:** Ask for approval, then merge to main

**If you encounter ambiguity:**
- Reference related UC session summaries first
- Check CLAUDE.md for established patterns
- Ask Chuck for clarification
- Don't guess - it's better to ask than implement incorrectly

**Success looks like:**
- [Feature] fully functional
- No regressions in related features
- Consistent with established patterns
- Complete documentation trail
- Clean git history with atomic commits

**Remember:**
- ✅ CREATE feature branch FIRST (before any code)
- ✅ REUSE components (don't recreate)
- ✅ FOLLOW patterns (don't invent new ones)
- ✅ TEST thoroughly (all scenarios, orientations)
- ✅ ASK questions (when spec is unclear)
- ✅ DETECT completion (offer closeout proactively)
- ✅ VERIFY before committing (run checklist)
- ✅ REQUEST approval before merging (don't assume)

Good luck! 🚀

---

**End of UC-XXX Specification v1.0**

---

## 📋 Version History

**v1.0** ([Date])
- Initial specification
- [Any other relevant notes]
