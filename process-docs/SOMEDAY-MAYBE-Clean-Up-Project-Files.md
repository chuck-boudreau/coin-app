# Someday/Maybe: Clean Up Project Files

**Version:** 1.0  
**Created:** October 27, 2025  
**Purpose:** Track potential file organization improvements that are deferred to maintain velocity

---

## Philosophy

This document tracks file organization improvements that would be "nice to have" but are not critical to development velocity. We defer these cleanups to avoid losing momentum during active development.

**Decision Criteria for Deferral:**
- ✅ **Do Now:** Organization that directly impacts workflow (finding files, confusion about status)
- ⏸️ **Do Later:** Organization that is purely aesthetic or involves moving many stable files
- ❌ **Don't Do:** Organization that creates more complexity than it solves

---

## Deferred Cleanup Tasks

### 1. **Google Drive Folder Structure Alignment**

**Current State:**  
Google Drive has evolved organically with folders like:
- `COIN App Vibe Coding/`
- `01 - Use Cases/`
- `02 - Specifications/`
- `03 - Architecture/`
- Various loose documents in root

**Potential Cleanup:**  
- Consider standardizing folder naming (with/without prefixes)
- Consider creating `04 - Research/` for research documents
- Consider creating `00 - Project Management/` for core process docs
- Review which documents belong where

**Why Deferred:**  
- Current structure is functional and everyone knows where things are
- Moving many established documents risks breaking mental models
- Time spent organizing doesn't add features
- Can revisit when natural inflection point occurs (phase change, major milestone)

**Status:** Deferred indefinitely, revisit at Phase 2 planning

---

### 2. **Local Project Documentation Structure**

**Current State:**  
`~/Projects/coin-app/` has:
- `specifications/` folder
- `sessions/` folder
- Potential for more docs as project grows

**Potential Cleanup:**  
- Create `docs/` folder with subfolders:
  - `docs/process/` (for DEVELOPMENT-PROCESS.md and similar)
  - `docs/specifications/` (move current specifications/)
  - `docs/sessions/` (move current sessions/)
  - `docs/architecture/` (for local architecture decisions)
- Update all references in code/docs to new paths

**Why Deferred:**  
- Current flat structure works fine for current scale
- Moving folders during active development could break relative paths
- Claude Code specifications reference current paths
- Better to establish pattern first, organize later

**Status:** Deferred until Phase 1 MVP complete (10+ UCs implemented)

---

### 3. **Document Naming Convention Review**

**Current State:**  
Mixed conventions exist:
- Some files: `UC-XXX-Specification.md`
- Some files: `UC-XXX-Session-Summary.md`
- Some files: `Architecture-Decision.md`
- Some files: Use underscores vs hyphens

**Potential Cleanup:**  
- Standardize on hyphens vs underscores
- Decide on capitalization convention
- Apply consistently across all documents

**Why Deferred:**  
- Current names are descriptive and findable
- Renaming breaks existing references in documentation
- Inconsistency doesn't prevent finding documents
- Can standardize during major documentation review

**Status:** Deferred until Phase 2 (when web app needs documentation structure)

---

### 4. **Archive Strategy for Obsolete Documents**

**Current State:**  
Some documents may become obsolete as project evolves:
- Early session summaries might reference deprecated code
- Initial specifications might not reflect evolved implementation
- Research documents might be superseded by decisions

**Potential Cleanup:**  
- Create `archive/` folders in both Google Drive and local project
- Move obsolete but historically valuable documents there
- Update references to point to current versions

**Why Deferred:**  
- Nothing is truly obsolete yet (still in Phase 1)
- Historical documents provide valuable context
- Archiving premature - need more time to know what's truly obsolete
- Can revisit when significant divergence occurs

**Status:** Deferred until Phase 2 complete (when implementation diverges significantly from early specs)

---

### 5. **Consolidate Duplicate Information**

**Current State:**  
Some information exists in multiple places:
- Project context in multiple documents
- Architecture decisions split across docs
- Use case information in registry + elaborations + specs

**Potential Cleanup:**  
- Create single source of truth documents
- Add references instead of duplicating content
- Standardize "what goes where"

**Why Deferred:**  
- Different documents serve different purposes (overview vs detail)
- Slight redundancy aids discoverability
- Consolidation without clear patterns risks losing important context
- Better to let natural patterns emerge first

**Status:** Deferred until patterns are clearer (end of Wave 2 or 3)

---

### 6. **Version Control for Google Drive Documents**

**Current State:**  
Google Drive has built-in version history, but:
- No formal versioning scheme on documents
- Some docs have version numbers, some don't
- No changelog tracking major revisions

**Potential Cleanup:**  
- Add version numbers to all major documents
- Create CHANGELOG.md approach for tracking doc changes
- Establish process for "releasing" new versions

**Why Deferred:**  
- Google Drive version history works adequately
- Adding versioning to 30+ documents is tedious
- Velocity more important than formal versioning right now
- Can implement when document stability increases

**Status:** Deferred until Phase 1 complete (when docs stabilize)

---

## Criteria for Promoting to "Do Now"

A deferred cleanup task should be promoted to immediate action if:

1. **Blocks Development:** Can't find files, confusion impedes progress
2. **Quality Risk:** Disorganization causing errors or incorrect implementations
3. **Team Onboarding:** New team member needs clear structure
4. **Natural Inflection Point:** Phase change, major milestone, or forced reorganization
5. **Quick Win:** Takes <1 hour and provides significant benefit

---

## Review Schedule

Review this document:
- ✅ After each Phase completion (1, 2, 3)
- ✅ If file organization pain points emerge
- ✅ Before onboarding new team members
- ✅ During major project retrospectives

---

## Notes

**Key Insight:** Organization is important, but shipping working code is more important. Perfect organization can wait; functional features cannot.

**Balance:** We maintain "good enough" organization that supports velocity while deferring "perfect" organization that would slow us down.

**Future Self:** This document exists so future Chuck doesn't forget these ideas but also doesn't feel obligated to do them until it makes sense.

---

**Last Review:** October 27, 2025  
**Next Review:** After Phase 1 MVP complete (10+ UCs implemented)
