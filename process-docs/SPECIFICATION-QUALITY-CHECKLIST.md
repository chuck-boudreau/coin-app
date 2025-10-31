# Specification Quality Checklist

**Purpose:** This checklist helps ensure UC specifications are complete, clear, and set Claude Code up for successful implementation.

**Rating Scale:** Use this to assess specification quality before sending to Claude Code.

---

## ✅ Essential Elements (Must Have)

### 1. Context Setting
- [ ] Links to relevant prior UC session summaries
- [ ] References to CLAUDE.md for established patterns
- [ ] Identifies which components/utilities to reuse
- [ ] Specifies which files MUST NOT be modified

**Example (from UC-202):**
> "Read UC-200 Session Summary first. Reuse COINCard, COINListItem, SortSelector, ViewToggle. DO NOT modify src/types/index.ts unless spec says so."

### 2. Component Reuse Instructions
- [ ] Explicitly lists existing components to use
- [ ] Explains what modifications are needed (if any)
- [ ] Warns against creating duplicates
- [ ] Provides props/interfaces to extend

**Example (from UC-202):**
> "REUSE COINCard and COINListItem - add star icon toggle prop for favorites"

### 3. Step-by-Step Implementation
- [ ] Numbered steps in logical order
- [ ] Each step has clear acceptance criteria
- [ ] Integration points identified
- [ ] Dependencies between steps noted

**Example (from UC-202):**
> "Step 1: Add isFavorite to COIN interface
> Step 2: Create EmptyFavoritesState component
> Step 3: Implement FavoritesScreen..."

### 4. Data Model Changes
- [ ] Specifies exact fields to add/modify
- [ ] Provides TypeScript type definitions
- [ ] Explains field purpose and usage
- [ ] Notes which file contains the interface

**Example (from UC-202):**
> "Add to src/types/index.ts:
> isFavorite?: boolean  // Marks COIN as favorited by user"

### 5. Filter/Sort Logic
- [ ] Provides exact filter conditions
- [ ] Explains edge cases (e.g., archived + favorited)
- [ ] Specifies sort options to use
- [ ] Notes any new sort options needed

**Example (from UC-202):**
> "Filter: isFavorite === true && status !== 'archived'
> Auto-unfavorite when archiving a COIN"

### 6. Mock Data Strategy
- [ ] Specifies test data needed
- [ ] Notes which COINs should have feature enabled
- [ ] Explains coverage (edge cases, variety)
- [ ] Identifies mockData.ts modifications

**Example (from UC-202):**
> "Set isFavorite: true for 2 COINs initially"

### 7. Testing Checklist
- [ ] Lists all scenarios to verify
- [ ] Includes orientation testing
- [ ] Covers edge cases
- [ ] Specifies acceptance criteria

---

## 🎯 Quality Enhancements (Should Have)

### 8. State Management Strategy
- [ ] Explains where state lives (component, context, AsyncStorage)
- [ ] Notes shared state across tabs/screens
- [ ] Specifies persistence requirements
- [ ] Identifies state synchronization needs

**Example (from UC-202):**
> "Use COINContext for shared state. Sort preference should persist across Recents/Favorites tabs. Favorites toggle should update immediately in both views."

### 9. Default Behaviors
- [ ] Specifies default sort option
- [ ] Defines default view mode (grid/list)
- [ ] Notes initial state values
- [ ] Explains fallback behaviors

**Example (from UC-202):**
> "Default sort: 'name-asc' (alphabetical A-Z)
> Default view: 'grid' (card view)
> Load from AsyncStorage if available"

### 10. User Feedback Patterns
- [ ] Specifies visual feedback (animations, color changes)
- [ ] Notes haptic feedback requirements
- [ ] Defines confirmation dialogs (if needed)
- [ ] Explains undo/redo capabilities

**Example (from UC-202):**
> "Star toggle: Haptic feedback + scale animation
> No confirmation dialogs for reversible actions
> Visual feedback: Filled star = favorited"

### 11. Performance Considerations
- [ ] Notes list optimization needs (FlatList vs ScrollView)
- [ ] Specifies memoization requirements
- [ ] Identifies expensive computations
- [ ] Explains re-render optimization

**Example (from UC-202):**
> "Use useMemo for filtered favorites list
> Use useCallback for toggle handler
> FlatList with keyExtractor for performance"

### 12. Integration Impact Analysis
- [ ] Lists other UCs that might be affected
- [ ] Notes shared components being modified
- [ ] Warns about potential regressions
- [ ] Specifies regression test scenarios

**Example (from UC-202):**
> "Modifying COINCard affects UC-200 (Recents). Test that Recents tab still works after adding star toggle."

---

## 🚀 Excellent Specifications (Nice to Have)

### 13. Design Refinement Guidance
- [ ] Provides spacing/layout guidelines
- [ ] Notes responsive design considerations
- [ ] Specifies iPad optimization requirements
- [ ] Includes visual hierarchy notes

**Example (from UC-202):**
> "Simplified layout: 2 columns portrait, 3 landscape
> Title below preview for better diagram visibility
> 2-line title truncation for consistent heights"

### 14. Empty State Design
- [ ] Describes empty state message
- [ ] Notes icon/illustration to use
- [ ] Specifies call-to-action buttons
- [ ] Explains contextual variations

**Example (from UC-202):**
> "Empty state: 'No favorites yet' message
> Show star icon with prompt to favorite COINs
> No CTA buttons needed (unlike Recents empty state)"

### 15. Code Quality Standards
- [ ] References existing patterns to follow
- [ ] Notes TypeScript strictness requirements
- [ ] Specifies naming conventions
- [ ] Identifies code organization preferences

**Example (from UC-202):**
> "Follow RecentsScreen pattern for consistency
> Use same responsive grid calculation
> Same AsyncStorage key prefix: @design_the_what:*"

---

## 📊 Specification Quality Rating Guide

### 10/10 - Exceptional
- All Essential + Quality + Excellent elements present
- No ambiguity, no questions needed
- Perfect balance of detail and flexibility
- Implementation proceeds smoothly with zero iterations

### 8-9/10 - Excellent (Target Range)
- All Essential elements present
- Most Quality elements present
- Minor gaps that emerge naturally during implementation
- 1-2 refinement iterations expected (normal and healthy)

**UC-202 scored 8.5/10** - Hit this target range perfectly.

### 6-7/10 - Good
- All Essential elements present
- Some Quality elements missing
- Requires clarification questions before starting
- 3-4 refinement iterations expected

### 4-5/10 - Acceptable
- Most Essential elements present
- Many Quality elements missing
- Significant ambiguity requiring discussion
- 5+ refinement iterations expected

### 1-3/10 - Needs Rework
- Essential elements missing
- Unclear requirements
- Cannot proceed without major clarification
- Should be rewritten before implementation

---

## 🎓 Lessons from UC-202 (Reference Examples)

### What Worked Exceptionally Well

1. **Component Reuse Clarity**
   - Explicitly listed: "REUSE COINCard, COINListItem..."
   - Warned: "DO NOT create FavoriteCOINCard"
   - Result: Zero duplicate components created

2. **Mock Data Strategy**
   - "Set isFavorite: true for 2 COINs"
   - Clear, specific, actionable
   - Result: Perfect test data on first try

3. **Archival Rules Upfront**
   - "Filter: isFavorite === true && status !== 'archived'"
   - "Auto-unfavorite when archiving"
   - Result: Correct implementation from the start

4. **Integration Constraints**
   - "DO NOT modify RecentsScreen.tsx"
   - "Must continue to work"
   - Result: Zero regressions

### What Could Have Been Better

1. **State Management Strategy**
   - What happened: Flicker when switching tabs
   - What would help: "Use COINContext for shared state across tabs"
   - Result: Emerged during testing, fixed with iteration

2. **Default Sort Option**
   - What happened: Discovered 'name-asc' made most sense during implementation
   - What would help: "Default sort: 'name-asc'"
   - Result: Minor decision point, easily resolved

3. **User Feedback Patterns**
   - What happened: Discovered haptic feedback + animation improved UX
   - What would help: "Add haptic feedback on star toggle"
   - Result: Enhancement beyond spec (good outcome)

4. **Responsive Layout Refinement**
   - What happened: 3/4 column grid made preview too small
   - What would help: "Prioritize preview size: 2 portrait / 3 landscape"
   - Result: Multiple iterations to find optimal layout

**Key Insight:** UC-202's spec was in the "Goldilocks zone" - detailed enough to guide, flexible enough to allow improvements. The 15% that emerged through iteration made it better.

---

## 📝 How to Use This Checklist

### For Claude Chat (Creating Specifications)

**Prompt Template:**
```
I need to create a specification for UC-XXX [Feature Name].

Before you generate the spec, review this checklist:
[Paste SPECIFICATION-QUALITY-CHECKLIST.md]

Ensure the specification includes:
1. All Essential Elements (Must Have)
2. Most Quality Enhancements (Should Have)
3. At least some Excellent Specifications (Nice to Have)

Target rating: 8-9/10 (Excellent range)

Here's the feature overview:
[Describe feature...]

Generate a complete UC-XXX specification following the checklist.
```

### For Self-Assessment (Before Sending to Claude Code)

1. Print this checklist
2. Review your draft specification
3. Check off each item present
4. Calculate completeness:
   - Essential: Must have 100%
   - Quality: Should have 70%+
   - Excellent: Nice to have 30%+
5. If below target, add missing elements
6. Aim for 8-9/10 range (not 10/10 - too prescriptive)

### For Claude Code (Understanding Spec Quality)

Claude Code can use this checklist to:
- Identify gaps in specification before starting
- Ask targeted questions about missing elements
- Recognize when specification is in "Goldilocks zone"
- Understand what level of refinement is expected

**Example:**
> "I notice the spec doesn't mention default sort option (Quality Enhancement #9). Should I choose based on UC-200 pattern, or would you like to specify?"

---

## 🎯 Success Metrics

**You know the spec is ready when:**
- ✅ All Essential Elements checked off
- ✅ 70%+ Quality Enhancements present
- ✅ You can answer "what happens if...?" questions
- ✅ No obvious ambiguities remaining
- ✅ Integration points clearly defined

**You know the spec worked when:**
- ✅ Claude Code implements without major questions
- ✅ 1-2 refinement iterations (normal)
- ✅ No regressions in prior UCs
- ✅ Code follows established patterns
- ✅ Testing reveals enhancements, not errors

---

## 📚 Reference Documents

- **UC-200 Session Summary:** Established patterns to follow
- **UC-202 Session Summary:** Example of spec that scored 8.5/10
- **CLAUDE.md:** Current project state and patterns
- **DEVELOPMENT-PROCESS.md:** Overall workflow

---

**Last Updated:** October 30, 2025 after UC-202 completion
**Based on:** UC-202 specification quality assessment (8.5/10)
**Purpose:** Guide specification creation for UC-201 and beyond
