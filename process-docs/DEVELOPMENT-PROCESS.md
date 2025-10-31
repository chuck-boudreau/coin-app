# COIN App Development Process

**Version:** 1.3  
**Last Updated:** October 30, 2025  
**Purpose:** Standard workflow for implementing use cases with Claude Code

---

## Overview

This document defines the repeatable process for implementing use cases in the COIN App project using "Use Case-Driven Vibe Coding" with Claude Code as the AI developer.

**Key Principle:** Each use case gets three documents:
1. **Specification** (before implementation) - Instructions for Claude Code
2. **Session Summary** (after implementation) - Record of what was actually built
3. **CLAUDE.md** (living document) - Claude Code's persistent memory across all UCs

**Critical v1.3 Addition:** CLAUDE.md verification procedures to catch documentation drift before creating specifications.

---

## Standard Workflow for Each Use Case

### **Step 1: Create Specification (with Claude Chat)**

**When:** Before implementation begins  
**Tool:** Claude Chat (conversation with Chuck)  
**Output:** `specifications/UC-XXX-Specification.md`

**Process:**
1. Chuck identifies next UC to implement from Use Case Registry
2. Chuck starts Claude Chat session
3. Claude Chat reads:
   - UC elaboration document
   - Previous session summaries (to understand current state)
   - Use Case Registry (to see what's implemented)
   - **CLAUDE.md** (to see established patterns and constraints)

4. **Claude Chat VERIFIES CLAUDE.md accuracy:** ⚠️ CRITICAL STEP

   **Why This Matters:**
   
   CLAUDE.md can drift from actual code reality over time. Creating a specification based on wrong information causes implementation failures and wasted time.
   
   **Verification Checklist - Do This Before Writing Spec:**
   
   Open CLAUDE.md and actual codebase side-by-side, then verify:
   
   **A. Component Interfaces:**
   - [ ] Handler signatures match actual code
     - Open actual component files (`src/components/*.tsx`)
     - Check: Do handlers take `coinId: string` or `coin: COIN`?
     - Update CLAUDE.md if wrong
   
   - [ ] Component props are complete
     - Check actual TypeScript interfaces
     - Verify all props documented
     - Add missing props to CLAUDE.md (e.g., `onRemove`, `showCreatedDate`)
   
   **B. Utilities & Functions:**
   - [ ] Referenced utilities actually exist
     - Check `src/utils/` directory
     - Verify functions mentioned in CLAUDE.md are real
     - Remove references to non-existent utilities
   
   - [ ] Storage patterns match implementation
     - Check actual screen files (e.g., `RecentsScreen.tsx`)
     - Verify: Inline AsyncStorage or utility functions?
     - Update CLAUDE.md to match reality
   
   - [ ] Sorting patterns match implementation
     - Check actual sort implementations
     - Verify: Inline with useMemo or utility function?
     - Update CLAUDE.md to match reality
   
   **C. Patterns & Conventions:**
   - [ ] Feedback pattern documented correctly
     - Check: `Alert.alert()` or toast library?
     - Verify what's actually used in existing screens
     - Update if wrong
   
   - [ ] AsyncStorage keys list is complete
     - Search codebase for `@design_the_what:`
     - Add any missing keys to CLAUDE.md
   
   **D. Integration Points:**
   - [ ] Reusable components listed correctly
     - Check `src/components/` directory
     - Verify components mentioned exist
     - Update component descriptions if changed
   
   **Process When Discrepancies Found:**
   
   ```bash
   # 1. Fix CLAUDE.md immediately (don't wait)
   # 2. Commit separately with clear message
   cd ~/Projects/coin-app
   git add CLAUDE.md
   git commit -m "fix(docs): Correct CLAUDE.md - [what was wrong]
   
   Found during: UC-XXX specification creation
   Issue: [describe discrepancy]
   Fixed: [describe correction]"
   git push
   
   # 3. Continue with UC specification
   ```
   
   **Example Real Discrepancies (from UC-202):**
   
   ❌ **WRONG in CLAUDE.md:**
   ```typescript
   onPress: (coin: COIN) => void
   ```
   
   ✅ **ACTUAL in code:**
   ```typescript
   onPress: (coinId: string) => void
   ```
   
   ❌ **WRONG in CLAUDE.md:**
   "Import and use sortCOINs utility"
   
   ✅ **ACTUAL in code:**
   No sortCOINs utility exists - sorting is inline with useMemo
   
   ❌ **WRONG in CLAUDE.md:**
   "Use showToast() for feedback"
   
   ✅ **ACTUAL in code:**
   Project uses `Alert.alert()` - no toast library
   
   **Signs CLAUDE.md Needs Verification:**
   - 🚩 Specification references utilities that don't exist
   - 🚩 Claude Code generates code that doesn't compile
   - 🚩 Handler signatures mismatch during implementation
   - 🚩 Time gap since last UC (>2 weeks)
   - 🚩 New wave starting (green field moment)
   - 🚩 You're unsure about documented patterns
   
   **Best Practice:**
   
   Always verify CLAUDE.md accuracy at the START of each new wave. This catches accumulated drift before it affects multiple UCs.

5. Claude Chat creates comprehensive specification including:
   - Technical requirements
   - Integration notes (what to preserve from previous UCs)
   - Mock data strategy (if needed)
   - Component architecture
   - Step-by-step implementation guide
   - **Verified** patterns from CLAUDE.md (not aspirational ones)

6. Save specification to `~/Projects/coin-app/specifications/UC-XXX-Specification.md`

**Naming Convention:** `UC-XXX-Specification.md` (e.g., `UC-200-Specification.md`)

---

### **Step 2: Create Feature Branch**

**When:** Before giving spec to Claude Code  
**Tool:** Git command line

```bash
cd ~/Projects/coin-app

# Create feature branch from current working branch
git checkout -b feature/uc-XXX

# Verify clean state
git status
npm start  # Test that current code still works
```

**Branch Naming:** `feature/uc-XXX` (e.g., `feature/uc-100`)

---

### **Step 3: Implement with Claude Code**

**When:** After specification is created  
**Tool:** Claude Code (AI pair programmer)  
**Input:** UC-XXX-Specification.md  

**Process:**
1. Start Claude Code in project directory:
   ```bash
   cd ~/Projects/coin-app
   npx @anthropic-ai/claude-code
   ```

2. Paste complete specification into Claude Code
   - **Note:** Claude Code automatically reads CLAUDE.md for context

3. Iterate with Claude Code:
   - Claude Code generates initial implementation
   - Chuck reviews and tests
   - Chuck requests enhancements/fixes
   - Claude Code refines
   - Repeat until satisfied

4. Test thoroughly:
   - Run on iPad simulator
   - Test portrait and landscape
   - Test all scenarios from use case
   - Verify no regression in previous UCs

**Important:** The implementation will evolve beyond the original spec through iteration. This is expected and good!

---

### **Step 4: Get Implementation Summary (from Claude Code)**

**When:** After implementation is complete and tested  
**Tool:** Claude Code  
**Output:** Implementation summary document

**Process:**
1. In Claude Code, ask:
   ```
   Please create a comprehensive implementation summary including:
   1. All files created
   2. All features implemented
   3. All enhancements beyond the original specification
   4. Current state of the application
   5. Key design decisions made
   6. What's pending for future UCs
   
   Format as markdown with clear sections.
   ```

2. Claude Code provides detailed summary

3. Copy the summary

4. Save as `~/Projects/coin-app/sessions/UC-XXX-Session-Summary.md`

**Naming Convention:** `UC-XXX-Session-Summary.md` (e.g., `UC-200-Session-Summary.md`)

---

### **Step 5: Commit and Push**

**When:** After session summary is saved  
**Tool:** Git

```bash
cd ~/Projects/coin-app

# Add all changes including documentation
git add .

# Commit with detailed message
git commit -m "feat: UC-XXX [Use Case Name] - Complete with enhancements

Implemented UC-XXX with [brief description of core features]

Core Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Enhancements Beyond Spec:
- [Enhancement 1]
- [Enhancement 2]

Files: [X] files created/modified
Lines: ~[X] lines

See: sessions/UC-XXX-Session-Summary.md for complete details"

# Push to GitHub
git push origin feature/uc-XXX
```

---

### **Step 6: Merge to Main Branch**

**When:** After verifying everything works  
**Tool:** Git

```bash
# Switch to main working branch
git checkout wave-1-fresh-start-uc200  # or main

# Merge feature branch
git merge feature/uc-XXX

# Push to GitHub
git push origin wave-1-fresh-start-uc200

# Optional: Delete feature branch
git branch -D feature/uc-XXX
```

---

### **Step 7a: Update CLAUDE.md** ⭐ CRITICAL

**When:** After merge is complete, before updating registry  
**Tool:** Text editor  
**Time:** 5-10 minutes  
**Purpose:** Maintain Claude Code's persistent memory for future UCs

**Process:**

1. **Open CLAUDE.md** in your project root
   ```bash
   cd ~/Projects/coin-app
   # Open CLAUDE.md in your editor
   ```

2. **Extract key information from session summary:**
   - [ ] New files created
   - [ ] Patterns established (reusable components, layouts, etc.)
   - [ ] Integration points (what future UCs can reuse)
   - [ ] Critical constraints (what must NOT be broken)
   - [ ] AsyncStorage keys used
   - [ ] Design decisions

3. **Update "Implemented Use Cases" section:**
   Add new section for completed UC:
   
   ```markdown
   ### UC-XXX: [Use Case Name] ✔️ COMPLETE
   
   **Status:** Implemented and Accepted  
   **Date:** [Today's date]  
   **Session Summary:** `sessions/UC-XXX-Session-Summary.md`
   
   **Files Created:**
   - [List key files from session summary]
   
   **Patterns Established:**
   - [List reusable patterns - e.g., "Grid/list toggle pattern"]
   - [Components that can be reused - e.g., "COINCard component"]
   
   **Integration Points:**
   - [What future UCs can reuse]
   - [Established patterns to follow]
   
   **Critical Constraints:**
   - [What must NOT be broken]
   - [Dependencies other features have]
   ```

4. **Update "Current UC Being Implemented" section:**
   - Change to next UC in sequence
   - Add specific integration requirements for that UC
   - List components/patterns to reuse

5. **Update "Files You Must NEVER Modify" section (if needed):**
   - Add any new critical files that shouldn't be touched

6. **Update "Project Structure" section (if needed):**
   - Add new directories or files to the tree

7. **Commit CLAUDE.md:**
   ```bash
   git add CLAUDE.md
   git commit -m "docs: Update CLAUDE.md after UC-XXX implementation"
   git push
   ```

**Example: After UC-200**

From UC-200 session summary, extract:
- ✅ 7 reusable components created (COINCard, COINListItem, SortSelector, etc.)
- ✅ Grid/List view toggle pattern established
- ✅ Responsive grid: 3 cols portrait / 4 cols landscape
- ✅ AsyncStorage keys: `@design_the_what:*` prefix
- ✅ Tab bar height: 65px (FAB positioning depends on this)

Add to CLAUDE.md so future UCs know:
- Reuse COINCard, don't create new card components
- Follow established grid pattern
- Don't break tab bar height

**Why This Matters:**

Without updating CLAUDE.md:
- ❌ Claude Code might recreate existing components
- ❌ Patterns established in UC-200 get ignored
- ❌ Future UCs break existing functionality
- ❌ Have to manually explain context every time

With updated CLAUDE.md:
- ✅ Claude Code reuses existing components
- ✅ Maintains consistency across UCs
- ✅ Prevents regressions
- ✅ Saves time explaining context

**See Also:**
- CLAUDE.md template in project root
- Token Management Protocol for session handoffs

---

### **Step 7b: Update Documentation**

**When:** After CLAUDE.md is updated  
**Tool:** Text editor, Git

**Update Use Case Registry:**
- Change status from "📝 Planned" to "✔️ Implemented"
- Add implementation date
- Add link to session summary

**Update Project README:**
```bash
cd ~/Projects/coin-app

# Edit README.md to add new UC to "Implemented" section
# Remove from "Pending" section
# Update stats (files, lines, features)

git add README.md
git commit -m "docs: Update README for UC-XXX completion"
git push
```

---

## File Organization

```
~/Projects/coin-app/
├── CLAUDE.md                        # Claude Code's persistent memory
├── README.md                        # Project overview, current status
├── specifications/                  # Before implementation
│   ├── UC-100-Specification.md
│   ├── UC-200-Specification.md
│   └── ...
├── sessions/                        # After implementation
│   ├── UC-100-Session-Summary.md
│   ├── UC-200-Session-Summary.md
│   └── ...
├── src/                             # Source code
│   ├── components/
│   ├── screens/
│   ├── types/
│   └── utils/
└── ...
```

---

## Document Templates

### **Specification Template** (Created by Claude Chat)

```markdown
# UC-XXX: [Use Case Name] - Implementation Prompt for Claude Code

**IMPORTANT CONTEXT:** [Current project state]

## Project Overview
[Platform, tech stack, current status]

## INTEGRATION WITH EXISTING CODE
**Current Codebase:** (from CLAUDE.md - VERIFIED)
- ✅ [What's already implemented]
- ✅ [Established patterns]

**This UC Must:**
- ✅ [Integration requirement 1]
- ✅ [Integration requirement 2]

**DO NOT:**
- ❌ Modify [file] unless specifically instructed
- ❌ Break [feature] that's already working

## What You're Building
[Complete technical specification]

## Step-by-Step Implementation
[Detailed implementation guide]

## Testing Checklist
[How to verify success]
```

### **Session Summary Template** (Created by Claude Code)

```markdown
# Session Implementation Summary: UC-XXX ([Use Case Name])

## 1. Files Created
[Complete list of files]

## 2. Core Features Built
[Main functionality implemented]

## 3. Enhancements Beyond Original Specification
[What was added during iteration]

## 4. Current State of Application
[What works now, what's pending]

## Key Design Decisions
[Why choices were made]

## Next Steps
[What needs to happen next]
```

---

## Git Commit Message Template

```
feat: UC-XXX [Use Case Name] - Complete with enhancements

Implemented UC-XXX [one-line description]

Core Features:
- [Feature 1]
- [Feature 2]

Enhancements Beyond Spec:
- [Enhancement 1]
- [Enhancement 2]

Components: [list]
Files: [X] files
Lines: ~[X] lines

See: sessions/UC-XXX-Session-Summary.md
```

---

## Safety Measures

### **Git Branching Strategy**
- ✅ Always create feature branch before implementing new UC
- ✅ Test thoroughly before merging
- ✅ Can abandon branch if implementation fails

### **Backup Points**
```bash
# Before starting new UC
git checkout -b backup-before-uc-XXX
git push origin backup-before-uc-XXX
```

### **Regression Testing**
After each UC implementation, verify:
- [ ] New UC functionality works
- [ ] Previous UC functionality still works
- [ ] App launches without errors
- [ ] No TypeScript errors
- [ ] Performance is maintained

---

## Integration Strategy

Each new UC specification must include:

### **Integration Section**
```markdown
## INTEGRATION WITH EXISTING CODE

**Current Codebase State:** (from CLAUDE.md - VERIFIED in Step 1)
[Summary from previous session summaries]

**Files to Preserve:**
- [File 1] - Contains [feature] that must not break
- [File 2] - Contains [customization] to maintain

**Integration Points:**
- [New UC] will integrate with [existing feature] by [method]
- [New UC] will extend [existing pattern]

**Claude Code Instructions:**
- DO NOT modify [file] without asking
- USE existing [pattern/component]
- EXTEND rather than replace
- ASK before overwriting customized files
```

---

## Common Pitfalls to Avoid

### **❌ Don't:**
- Start implementation without verifying CLAUDE.md accuracy first
- Start implementation without reading CLAUDE.md
- Start implementation without reading previous session summaries
- Create specifications that ignore existing code
- Skip the session summary step
- Skip updating CLAUDE.md (new UCs need this context!)
- Commit without detailed commit message
- Forget to update Use Case Registry
- Delete feature branch before verifying merge

### **✅ Do:**
- **Verify CLAUDE.md accuracy before creating each spec**
- Read CLAUDE.md before creating specifications
- Read all previous session summaries before creating new spec
- Include integration notes in specifications
- Get comprehensive summary from Claude Code
- Update CLAUDE.md after each UC acceptance
- Use descriptive commit messages with details
- Update all documentation
- Keep backup branches for safety

---

## Session Naming Convention

For Claude Chat sessions:
- **Pattern:** `UC-XXX Implementation Session`
- **Examples:**
  - "UC-200 Implementation Session"
  - "UC-100 Implementation Session"
  
Not: "Session 001", "Session 002" (too generic)

---

## Troubleshooting

### **If Claude Code Changes Something It Shouldn't:**
```bash
# Revert to before the change
git checkout feature/uc-XXX
git reset --hard HEAD~1

# Or start over from backup
git checkout backup-before-uc-XXX
git checkout -b feature/uc-XXX-retry
```

### **If New UC Breaks Previous UC:**
1. Don't merge feature branch
2. Review what changed
3. Check if CLAUDE.md had proper constraints listed
4. Update CLAUDE.md with better constraints
5. Update specification with better preservation instructions
6. Delete feature branch
7. Try again with improved spec

### **If Implementation Diverges Too Much from Spec:**
- That's okay! Document the divergence in session summary
- Update CLAUDE.md with the actual pattern that emerged
- Update spec for next similar UC if pattern emerges

### **If CLAUDE.md Contains Wrong Information:**
1. Stop current work immediately
2. Fix CLAUDE.md to match actual code
3. Commit fix separately with clear description
4. Resume work with corrected documentation
5. Consider if other UCs affected by same wrong info

---

## Quality Checklist

Before considering UC complete:

### **Code Quality**
- [ ] All TypeScript types defined (no `any`)
- [ ] No console errors or warnings
- [ ] Follows React Native best practices
- [ ] Performance is acceptable (60fps)

### **Testing**
- [ ] Tested in portrait orientation
- [ ] Tested in landscape orientation
- [ ] All use case scenarios verified
- [ ] Previous UCs still work (no regression)

### **Documentation**
- [ ] Specification saved in `specifications/`
- [ ] Session summary saved in `sessions/`
- [ ] **CLAUDE.md updated** ⭐ CRITICAL
- [ ] **CLAUDE.md verified accurate** ⭐ NEW in v1.3
- [ ] Git commit has detailed message
- [ ] README.md updated
- [ ] Use Case Registry updated

### **Git**
- [ ] All files committed
- [ ] Pushed to GitHub
- [ ] Branch merged to main
- [ ] No uncommitted changes

---

## Example: UC-200 Implementation

**Actual implementation of this process:**

1. ✅ Verified CLAUDE.md accuracy (none existed yet, created from scratch)
2. ✅ Created `specifications/UC-200-Specification.md`
3. ✅ Created feature branch (wave-1-fresh-start-uc200)
4. ✅ Gave spec to Claude Code
5. ✅ Iterated and enhanced (added tabs, sorting, list view, persistence)
6. ✅ Got implementation summary from Claude Code
7. ✅ Saved as `sessions/UC-200-Session-Summary.md`
8. ✅ Committed with detailed message
9. ✅ Created backup branch (backup-uc200-enhanced)
10. ✅ **Created initial CLAUDE.md with UC-200 patterns**
11. ✅ Updated documentation

**Result:** Successful first UC implementation with excellent documentation trail AND persistent context for next UCs

---

## Example: UC-202 Implementation (Using v1.3 Process)

**Following the v1.3 process:**

1. ✅ **Verified CLAUDE.md accuracy** - Found discrepancies:
   - Handler signatures wrong (documented `COIN` objects, actual uses `coinId: string`)
   - Non-existent utilities referenced (sortCOINs, loadCOINs, saveCOIN)
   - Component props incomplete (missing onRemove, showCreatedDate)
   - Wrong feedback pattern (documented toast, actual uses Alert.alert)

2. ✅ **Fixed CLAUDE.md immediately** - Committed corrections separately

3. ✅ Created `specifications/UC-202-Specification-v1.1.md` with accurate patterns

4. ✅ Ready for Claude Code implementation with correct information

**Result:** Specification based on verified reality, preventing implementation failures

---

## Future Improvements

As we implement more UCs, we may discover:
- Better specification templates
- Additional safety measures needed
- Process refinements
- Tool improvements
- Better CLAUDE.md maintenance strategies
- Better verification procedures

This document should be updated as we learn.

---

## Quick Reference

### **Starting New UC:**
```bash
# 1. Verify CLAUDE.md accuracy (Step 1) ⭐ NEW in v1.3
# Check handler signatures, utilities, patterns
# Fix any discrepancies found

# 2. Create spec in Claude Chat (reads CLAUDE.md)
# Save to specifications/

git checkout -b feature/uc-XXX
npm start  # Verify working state

# 3. Give spec to Claude Code (reads CLAUDE.md automatically)
npx @anthropic-ai/claude-code

# 4. After implementation, ask Claude Code for summary
# 5. Save to sessions/

# 6. Commit
git add .
git commit -m "feat: UC-XXX ..."
git push

# 7. Merge
git checkout main
git merge feature/uc-XXX
git push

# 7a. Update CLAUDE.md ⭐ CRITICAL
# Extract key info from session summary
# Add to "Implemented Use Cases" section
# Update "Current UC" section
git add CLAUDE.md
git commit -m "docs: Update CLAUDE.md after UC-XXX"
git push

# 7b. Update Use Case Registry & README
git add Use-Case-Registry.md README.md
git commit -m "docs: Update registry for UC-XXX completion"
git push
```

---

**This process ensures:**
- ✅ Complete documentation trail
- ✅ Safe integration of new features
- ✅ No regression of existing functionality
- ✅ Clear project history
- ✅ Easy onboarding for future contributors
- ✅ Reproducible development workflow
- ✅ **Persistent context across all UC implementations**
- ✅ **Accurate documentation that matches reality** ⭐ NEW in v1.3
