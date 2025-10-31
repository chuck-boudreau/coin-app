# UC-201: View Projects (Projects Tab) - Implementation Specification for Claude Code

**Version:** 1.1  
**Date:** October 30, 2025  
**Platform:** React Native + Expo (iPad)  
**Use Case Reference:** UC-201 elaboration document v1.1  
**Target:** 8-9/10 specification quality

---

## 📋 CRITICAL: Read These First

**Session Summaries (REQUIRED READING):**
- ✅ `sessions/UC-200-Session-Summary.md` - Recents tab patterns, all reusable components
- ✅ `sessions/UC-202-Session-Summary.md` - Favorites tab, shared state patterns, haptics

**Context Documents (REQUIRED READING):**
- ✅ `CLAUDE.md` - Current project state, established patterns, integration rules
- ✅ `CLAUDE_CODE_CONTEXT.md` - React Native fundamentals

**Process Document (REQUIRED READING):**
- ✅ `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` - Complete workflow for this UC

**Architecture References:**
- Navigation Architecture Specification (three-tab structure, stack navigation)
- Data Models Specification v2.0 (COIN interface, Project interface)
- Organizational Patterns Research (project-based BA work patterns)

---

## 🔀 Git Workflow - CRITICAL FIRST STEP

**⚠️ BEFORE implementing ANY code, you MUST create a feature branch.**

**Reference:** `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` (Step 2)

### Create Feature Branch First

```bash
cd ~/Projects/coin-app

# Create feature branch from main
git checkout -b feature/uc-201

# Verify clean state
git status

# Test that current code still works
npm start
```

**Branch Name:** `feature/uc-201`

**Verify:** Current app (UC-200 and UC-202) must work before starting implementation.

**Only proceed with implementation after branch is created and verified working.**

---

## 🎯 Project Overview

**What You're Building:** Projects Tab - Third tab in the three-tab bottom navigation

**Context:** This implements the hierarchical project organization view, complementing the temporal Recents view. Business Analysts organize their work by projects (2-4 major projects annually, 3-7 COINs per project). This view provides portfolio-level visibility and logical grouping.

**Platform:** Native iPad app using React Native + Expo
**Current Status:** UC-200 (Recents) and UC-202 (Favorites) ✔️ Complete
**Dependencies:** Builds on UC-200/UC-202 components and patterns

---

## 🔗 Integration with Existing Code

### Current Codebase (from CLAUDE.md - VERIFIED)

✅ **Already Implemented:**
- Three-tab navigation structure (App.tsx)
- COINContext for shared state management
- COINCard component (grid view, with star toggle)
- COINListItem component (list view, with star toggle)
- SortSelector component (6 sort options)
- ViewToggle component (grid/list toggle)
- Empty state pattern (EmptyRecentsState, EmptyFavoritesState)
- AsyncStorage persistence pattern (@design_the_what:* keys)
- Haptic feedback + animation pattern
- Responsive grid layout (2 cols portrait / 3 cols landscape)

✅ **Shared State Management:**
- COINContext provides: coins array, toggleFavorite, sortOption
- All COIN data is in shared context (no local COIN state needed)
- Sort preferences synced across tabs via context

### This UC Must

✅ **REUSE existing components (DO NOT recreate):**
- COINCard - Use exactly as-is for displaying COINs in project detail
- COINListItem - Use exactly as-is for list view of COINs
- SortSelector - Use exactly as-is (same 6 sort options)
- ViewToggle - Use exactly as-is (grid/list toggle)
- EmptyState pattern - Follow EmptyFavoritesState pattern for empty project/empty COIN states

✅ **REUSE existing context:**
- COINContext for accessing coins array and shared state
- Use sortOption from context (shared across all tabs)
- Use toggleFavorite from context (if enabled)

✅ **FOLLOW established patterns:**
- Same responsive grid layout (2 cols portrait / 3 cols landscape)
- Same AsyncStorage key prefix (@design_the_what:*)
- Same haptic feedback + animation pattern for interactive elements
- Same card layout (title below preview, 2-line truncation)
- Same navigation structure (stack navigation within tab)

### DO NOT

❌ **DO NOT modify these files unless spec explicitly says:**
- `src/types/index.ts` - Modify ONLY as specified in Data Model Changes section
- `src/utils/mockData.ts` - Modify ONLY as specified in Mock Data section
- `src/contexts/COINContext.tsx` - DO NOT modify (projects are view-level organization)
- `src/screens/RecentsScreen.tsx` - Must continue to work (no regressions)
- `src/screens/FavoritesScreen.tsx` - Must continue to work (no regressions)
- `src/components/COINCard.tsx` - DO NOT modify (use as-is)
- `src/components/COINListItem.tsx` - DO NOT modify (use as-is)
- `src/components/SortSelector.tsx` - DO NOT modify (use as-is)
- `src/components/ViewToggle.tsx` - DO NOT modify (use as-is)
- `App.tsx` - Navigation structure already set up, DO NOT modify

❌ **DO NOT create duplicate components:**
- DO NOT create ProjectCOINCard (use COINCard)
- DO NOT create new sort dropdown (use SortSelector)
- DO NOT create new view toggle (use ViewToggle)
- DO NOT create new empty state from scratch (follow pattern)

---

## 📊 Data Model Changes

### Step 1: Add Project Interface to src/types/index.ts

Add this NEW interface to `src/types/index.ts`:

```typescript
export interface Project {
  // ===== IDENTITY =====
  id: string;                          // UUID v4
  name: string;                        // Project name, max 100 chars
  description?: string;                // Optional description, max 500 chars
  
  // ===== ORGANIZATIONAL METADATA =====
  clientOrDepartment?: string;         // e.g., "HR", "Operations", max 100 chars
  status: ProjectStatus;               // active | on-hold | completed | archived
  colorTag: string;                    // Hex color for visual identification
  tags?: string[];                     // Optional tags for filtering
  
  // ===== DATES =====
  createdDate: string;                 // ISO 8601 timestamp
  lastModifiedDate: string;            // ISO 8601 timestamp
  startDate?: string;                  // Optional project start date
  endDate?: string;                    // Optional project end date
  
  // ===== RELATIONSHIPS =====
  coinCount: number;                   // Computed: number of COINs in this project
  
  // ===== USER METADATA =====
  owner: string;                       // User ID (Phase 1: single user, always same)
  
  // Phase 2+ fields (nullable in Phase 1)
  budget?: number;
  customFields?: Record<string, any>;
}

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
```

### Step 2: Update COIN Interface in src/types/index.ts

MODIFY the existing COIN interface (find it in the file, add these fields):

```typescript
export interface COIN {
  // ... existing fields ...
  
  // ===== ADD THESE FIELDS =====
  projectIds: string[];                // Array of Project IDs (multi-project support)
                                       // Empty array = root-level COIN (no project)
  projectName?: string;                // Denormalized for display (first project name)
                                       // Optional: may be undefined for root-level COINs
  
  // ... rest of existing fields ...
}
```

**CRITICAL NOTES:**
- `projectIds` is an ARRAY because Phase 3 supports linked COINs (COIN can appear in multiple projects)
- Phase 1 only uses single project per COIN: `projectIds.length <= 1`
- Empty array (`projectIds: []`) means root-level COIN (not in any project)
- `projectName` is denormalized for quick display without joining data

---

## 🗂️ Mock Data Strategy

### Step 3: Add Projects and Update COINs in src/utils/mockData.ts

**ADD these test projects to mockData.ts:**

```typescript
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Employee Onboarding Redesign',
    description: 'Streamline the employee onboarding process for HR department',
    clientOrDepartment: 'Human Resources',
    status: 'active',
    colorTag: '#007AFF',  // Blue
    tags: ['HR', 'Process Improvement'],
    createdDate: '2024-09-15T10:00:00.000Z',
    lastModifiedDate: '2025-10-25T14:30:00.000Z',
    startDate: '2024-09-15',
    endDate: '2025-03-31',
    coinCount: 3,  // Will be computed from COINs
    owner: 'user-001',
  },
  {
    id: 'proj-002',
    name: 'Supply Chain Optimization',
    description: 'Improve supply chain efficiency and reduce costs',
    clientOrDepartment: 'Operations',
    status: 'active',
    colorTag: '#34C759',  // Green
    tags: ['Operations', 'Cost Reduction'],
    createdDate: '2024-08-01T09:00:00.000Z',
    lastModifiedDate: '2025-10-28T16:00:00.000Z',
    startDate: '2024-08-01',
    endDate: '2025-06-30',
    coinCount: 4,
    owner: 'user-001',
  },
  {
    id: 'proj-003',
    name: 'Customer Support Portal',
    description: 'Design new self-service customer support portal',
    clientOrDepartment: 'Customer Service',
    status: 'on-hold',
    colorTag: '#FF9500',  // Orange
    tags: ['Customer Service', 'Digital Transformation'],
    createdDate: '2024-07-10T11:00:00.000Z',
    lastModifiedDate: '2025-09-15T10:00:00.000Z',
    startDate: '2024-07-10',
    coinCount: 2,
    owner: 'user-001',
  },
  {
    id: 'proj-004',
    name: 'IT Security Audit Process',
    description: 'Define security audit workflow and compliance checks',
    clientOrDepartment: 'IT Security',
    status: 'completed',
    colorTag: '#FF3B30',  // Red
    tags: ['Security', 'Compliance'],
    createdDate: '2024-06-01T08:00:00.000Z',
    lastModifiedDate: '2025-08-30T17:00:00.000Z',
    startDate: '2024-06-01',
    endDate: '2024-12-15',
    coinCount: 2,
    owner: 'user-001',
  },
  {
    id: 'proj-005',
    name: 'Sales Pipeline Automation',
    description: 'Automate lead qualification and follow-up processes',
    clientOrDepartment: 'Sales',
    status: 'active',
    colorTag: '#5856D6',  // Purple
    tags: ['Sales', 'Automation'],
    createdDate: '2024-10-01T09:30:00.000Z',
    lastModifiedDate: '2025-10-29T11:00:00.000Z',
    startDate: '2024-10-01',
    endDate: '2025-04-30',
    coinCount: 4,
    owner: 'user-001',
  },
];
```

**UPDATE existing COINs in mockData.ts:**

Assign each COIN to a project by adding `projectIds` and `projectName` fields:

```typescript
// Example assignments (distribute 18 existing COINs across 5 projects):

// Project 1 (Employee Onboarding Redesign) - 3 COINs
{
  ...existingCOIN1,
  projectIds: ['proj-001'],
  projectName: 'Employee Onboarding Redesign',
},
{
  ...existingCOIN2,
  projectIds: ['proj-001'],
  projectName: 'Employee Onboarding Redesign',
},
{
  ...existingCOIN3,
  projectIds: ['proj-001'],
  projectName: 'Employee Onboarding Redesign',
},

// Project 2 (Supply Chain Optimization) - 4 COINs
{
  ...existingCOIN4,
  projectIds: ['proj-002'],
  projectName: 'Supply Chain Optimization',
},
// ... (3 more)

// Project 3 (Customer Support Portal) - 2 COINs
// Project 4 (IT Security Audit Process) - 2 COINs
// Project 5 (Sales Pipeline Automation) - 4 COINs

// Root-level COINs (not in any project) - 3 COINs
{
  ...existingCOIN16,
  projectIds: [],          // Empty array = no project
  projectName: undefined,  // No project name
},
```

**Distribution strategy:**
- Proj-001: 3 COINs (HR onboarding workflows)
- Proj-002: 4 COINs (supply chain processes)
- Proj-003: 2 COINs (customer support workflows)
- Proj-004: 2 COINs (security audit procedures)
- Proj-005: 4 COINs (sales automation processes)
- Root-level: 3 COINs (not assigned to any project)

**Total:** 18 COINs (15 in projects, 3 root-level)

---

## 🏗️ Implementation Steps

### Step 4: Create ProjectCard Component

**File:** `src/components/ProjectCard.tsx`

**Purpose:** Display project in grid or list view (similar to COINCard pattern)

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onPress: () => void;
}
```

**Layout:**

**Grid Mode:**
```
┌─────────────────────────┐
│  [Color Tag Bar]        │
│                         │
│  Project Name           │
│  (2-line truncation)    │
│                         │
│  Client/Department      │
│  (1-line, gray)         │
│                         │
│  [Status Badge]         │
│  XX COINs               │
└─────────────────────────┘
```

**List Mode:**
```
┌────────────────────────────────────┐
│ [Color] Project Name               │
│ [Tag]   Client/Department          │
│         [Status Badge] XX COINs    │
└────────────────────────────────────┘
```

**Implementation Notes:**
- Color tag: 4px left border (grid) or 12px circle (list)
- Status badge: Small pill with background color
  - active: green background
  - on-hold: orange background
  - completed: blue background
  - archived: gray background (these are filtered out anyway)
- COIN count: `{coinCount} COIN{coinCount !== 1 ? 's' : ''}`
- Truncation: `numberOfLines={2}` for name in grid
- Same shadow/border/spacing as COINCard
- Same responsive behavior (2 cols portrait / 3 cols landscape)

---

### Step 5: Create Empty State Components

#### EmptyProjectListState Component

**File:** `src/components/EmptyProjectListState.tsx`

**Purpose:** Show when user has no projects yet

**Layout:**
```
      [Icon: Folder]
      
   No Projects Yet
   
   Projects help you organize
   your COINs by client, initiative,
   or any way that makes sense
   for your work.
   
   [Create Your First Project]
```

**Implementation Notes:**
- Follow EmptyFavoritesState pattern
- Icon: SF Symbol `folder` or `folder.badge.plus`
- Button handler: `onCreateProject()` - will show Alert for now (UC-203 will implement)
- Show Alert: "Project creation coming in next update!"

#### EmptyProjectDetailState Component

**File:** `src/components/EmptyProjectDetailState.tsx`

**Purpose:** Show when project has no COINs

**Props:**
```typescript
interface EmptyProjectDetailStateProps {
  projectName: string;
  onAddFromRecents: () => void;   // Future: UC-210
  onCreateNew: () => void;         // Future: UC-100 with project context
}
```

**Layout:**
```
    [Icon: Circle Outline]
    
    No COINs in this project yet
    
    Add COINs from your Recents,
    or create a new COIN for
    [Project Name].
    
    [Add from Recents]  [Create New COIN]
```

**Implementation Notes:**
- Both buttons show Alert for now
- "Add from Recents" → "Coming soon: Select COINs to add to project"
- "Create New COIN" → "Coming soon: Create COIN in this project"

---

### Step 6: Implement ProjectsScreen

**File:** `src/screens/ProjectsScreen.tsx`

**Purpose:** Main projects list view (similar to RecentsScreen structure)

**State:**
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [sortOption, setSortOption] = useState<ProjectSortOption>('name-asc');
const [refreshing, setRefreshing] = useState(false);
const [projects, setProjects] = useState<Project[]>(mockProjects);
```

**Sort Options:**
```typescript
type ProjectSortOption = 
  | 'name-asc'           // Name (A-Z)
  | 'name-desc'          // Name (Z-A)
  | 'modified-desc'      // Last Modified (Newest First)
  | 'modified-asc'       // Last Modified (Oldest First)
  | 'created-desc'       // Created (Newest First)
  | 'created-asc';       // Created (Oldest First)
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Projects                    [+]     │ ← Header with Create button
├─────────────────────────────────────┤
│ [Sort Dropdown ▼]  [Grid/List]     │ ← Controls bar
├─────────────────────────────────────┤
│                                     │
│  [Project Card]    [Project Card]  │ ← Grid/List of projects
│  [Project Card]    [Project Card]  │
│  [Project Card]    [Project Card]  │
│                                     │
└─────────────────────────────────────┘
```

**Filtering Logic:**
```typescript
// Filter out archived projects (they're not shown in Phase 1)
const visibleProjects = useMemo(() => {
  return projects.filter(p => p.status !== 'archived');
}, [projects]);

// Then sort the visible projects
const sortedProjects = useMemo(() => {
  const sorted = [...visibleProjects];
  switch (sortOption) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'modified-desc':
      return sorted.sort((a, b) => 
        new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
      );
    case 'modified-asc':
      return sorted.sort((a, b) => 
        new Date(a.lastModifiedDate).getTime() - new Date(b.lastModifiedDate).getTime()
      );
    case 'created-desc':
      return sorted.sort((a, b) => 
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    case 'created-asc':
      return sorted.sort((a, b) => 
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
  }
}, [visibleProjects, sortOption]);
```

**Navigation:**
```typescript
const handleProjectPress = (project: Project) => {
  navigation.navigate('ProjectDetail', { 
    projectId: project.id,
    projectName: project.name 
  });
};
```

**Header Actions:**
```typescript
// "+" button in header
const handleCreateProject = () => {
  Alert.alert(
    'Coming Soon',
    'Project creation will be available in the next update!',
    [{ text: 'OK' }]
  );
};

// Set in useLayoutEffect
React.useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity onPress={handleCreateProject} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>+</Text>
      </TouchableOpacity>
    ),
  });
}, [navigation]);
```

**Persistence Pattern:**
```typescript
// Load preferences on mount
useEffect(() => {
  const loadData = async () => {
    try {
      const savedView = await AsyncStorage.getItem('@design_the_what:projects_view_mode');
      if (savedView) setViewMode(savedView as 'grid' | 'list');
      
      const savedSort = await AsyncStorage.getItem('@design_the_what:projects_sort_option');
      if (savedSort) setSortOption(savedSort as ProjectSortOption);
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };
  loadData();
}, []);

// Save on change
const handleViewModeChange = async (mode: 'grid' | 'list') => {
  setViewMode(mode);  // Instant UI update
  try {
    await AsyncStorage.setItem('@design_the_what:projects_view_mode', mode);
  } catch (error) {
    console.log('Error saving view mode:', error);
  }
};
```

---

### Step 7: Implement ProjectDetailScreen

**File:** `src/screens/ProjectDetailScreen.tsx`

**Purpose:** Show project metadata and filtered list of COINs in that project

**Props (from navigation):**
```typescript
type ProjectDetailScreenProps = {
  route: {
    params: {
      projectId: string;
      projectName: string;
    };
  };
};
```

**State:**
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const { coins, sortOption } = useContext(COINContext);  // Use shared context
const [refreshing, setRefreshing] = useState(false);
```

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Project Name                      │ ← Header (back button + name)
├─────────────────────────────────────┤
│ Client/Department                   │ ← Project metadata bar
│ [Status Badge] • XX COINs           │
├─────────────────────────────────────┤
│ [Sort Dropdown ▼]  [Grid/List]     │ ← Controls bar (same as Recents)
├─────────────────────────────────────┤
│                                     │
│  [COIN Card]       [COIN Card]     │ ← Filtered COINs (reuse COINCard)
│  [COIN Card]       [COIN Card]     │
│                                     │
└─────────────────────────────────────┘
```

**Filtering Logic:**
```typescript
// Get project details
const project = useMemo(() => {
  return mockProjects.find(p => p.id === projectId);
}, [projectId]);

// Filter COINs that belong to this project
const projectCoins = useMemo(() => {
  return coins.filter(coin => 
    coin.projectIds.includes(projectId)
  );
}, [coins, projectId]);

// Apply sorting (uses shared sortOption from COINContext)
const sortedCoins = useMemo(() => {
  // Use same sorting logic as RecentsScreen
  // (sorts projectCoins using sortOption from context)
}, [projectCoins, sortOption]);
```

**Components:**
- Reuse `COINCard` component for displaying COINs
- Reuse `SortSelector` component (same 6 sort options as Recents)
- Reuse `ViewToggle` component
- Use `EmptyProjectDetailState` when `projectCoins.length === 0`

**Persistence:**
```typescript
// Save/load view mode preference (project detail has its own)
const handleViewModeChange = async (mode: 'grid' | 'list') => {
  setViewMode(mode);
  try {
    await AsyncStorage.setItem('@design_the_what:project_detail_view_mode', mode);
  } catch (error) {
    console.log('Error saving view mode:', error);
  }
};
```

**Note on Sort:** Project detail uses shared `sortOption` from COINContext (same as Recents/Favorites), but has its own independent `viewMode` preference.

---

## 🚀 Implementation Order

**Recommended sequence:**

1. ✅ **Step 1:** Add Project interface and update COIN interface in types
2. ✅ **Step 2:** Add mock projects and update COINs in mockData
3. ✅ **Step 3:** Create ProjectCard component
4. ✅ **Step 4:** Create EmptyProjectListState component
5. ✅ **Step 5:** Create EmptyProjectDetailState component
6. ✅ **Step 6:** Implement ProjectsScreen (list view)
7. ✅ **Step 7:** Implement ProjectDetailScreen (COIN list within project)
8. ✅ **Step 8:** Add navigation configuration in App.tsx
9. ✅ **Step 9:** Test thoroughly (all checklists below)
10. ✅ **Step 10:** Verify no regressions in UC-200/UC-202

**Development approach:**
- Build components bottom-up (cards → empty states → screens)
- Test each component in isolation before integration
- Verify navigation works before implementing interactions
- Test orientation changes early and often

---

## 🎯 When to Initiate Session Closeout

**Claude Code: When you believe implementation is complete, proactively ask Chuck:**

```
I believe UC-201 is complete and ready for closeout. Here's what I've verified:

✅ All acceptance criteria met (see checklist below)
✅ Tested in portrait and landscape orientations
✅ No regressions in UC-200 (Recents tab)
✅ No regressions in UC-202 (Favorites tab)
✅ All TypeScript compilation errors resolved
✅ App runs without console errors or warnings
✅ Mock data properly configured (5 projects, 18 COINs assigned)
✅ Navigation between projects list and detail works smoothly
✅ All reusable components (COINCard, SortSelector, ViewToggle) working correctly
✅ Persistence working (view mode, sort preferences)

Would you like me to begin the session closeout process?
This includes:
- Step 4a: Generate comprehensive session summary
- Step 4b: Update CLAUDE.md with UC-201 patterns
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
6. **Integration Verification** - UC-200/UC-202 still working
7. **Current Application State** - What works now
8. **Key Design Decisions** - Important choices made
9. **Testing Completed** - What was verified
10. **Future UC Integration Points** - What's ready for UC-203+

Save as: `~/Projects/coin-app/sessions/UC-201-Session-Summary.md`
```

**Wait for Chuck to review summary before proceeding to Step 4b.**

---

### Step 4b: Update CLAUDE.md (CRITICAL - Atomic with Code)

**After session summary is approved, update CLAUDE.md immediately:**

```
Now update CLAUDE.md with UC-201 patterns:

1. Mark UC-201 as implemented in "Implemented Use Cases" section
2. Update "Current UC Being Implemented" to next UC (if known)
3. Add new components to "Current Structure" section:
   - ProjectCard
   - EmptyProjectListState
   - EmptyProjectDetailState
   - ProjectsScreen
   - ProjectDetailScreen
4. Document Project data model in "Key Interfaces" section
5. Add projectIds pattern to COIN interface notes
6. Document new AsyncStorage keys:
   - @design_the_what:projects_view_mode
   - @design_the_what:projects_sort_option
   - @design_the_what:project_detail_view_mode
7. Add integration notes for future UCs (UC-203, UC-204, UC-210)
8. Update header metadata (date, last UC completed)

Make changes directly to CLAUDE.md file.
```

**Chuck will review CLAUDE.md changes for accuracy before commit.**

---

### Step 5: Commit Everything Together

**Pre-commit verification checklist:**

Before running commit command, verify:
- [ ] Session summary generated and saved to `sessions/`
- [ ] CLAUDE.md updated with UC-201 patterns
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
git commit -m "feat: UC-201 Projects Tab with hierarchical view

Implemented:
- Projects grid/list view with 2/3 column responsive layout
- Project cards with status indicators and COIN count
- Project detail screen showing filtered COINs
- Empty states for no projects and no COINs in project
- View mode and sort preferences with AsyncStorage
- Pull-to-refresh on both screens
- Project filtering and COIN filtering by projectIds

Data model changes:
- Added Project interface (id, name, status, colorTag, etc.)
- Updated COIN interface with projectIds array support
- Created 5 mock projects with 18 COINs assigned

Components created:
- ProjectCard (grid/list variants with color tags, status badges)
- EmptyProjectListState (no projects yet state)
- EmptyProjectDetailState (project has no COINs state)
- ProjectsScreen (main projects list with filtering)
- ProjectDetailScreen (COIN list within project)

Integration:
- Reused COINCard, COINListItem, SortSelector, ViewToggle components
- No regressions in UC-200 (Recents) or UC-202 (Favorites)
- Consistent with established patterns (haptics, persistence, responsive)

AsyncStorage keys added:
- @design_the_what:projects_view_mode
- @design_the_what:projects_sort_option
- @design_the_what:project_detail_view_mode

Testing:
- Verified portrait and landscape orientations
- Tested all navigation flows
- Verified empty states display correctly
- Confirmed persistence working across app restarts
- No console errors or TypeScript warnings

Documentation:
- Session summary: sessions/UC-201-Session-Summary.md
- CLAUDE.md updated with UC-201 patterns (atomic with code)

Future UCs ready:
- UC-203: Create Project (modal + form)
- UC-204: Edit Project Metadata (context menu + modal)
- UC-210: Move COIN Between Projects (selection workflow)"

# Push to feature branch
git push origin feature/uc-201
```

**After push completes, confirm to Chuck:**

```
✅ Step 5 Complete:

All changes committed to feature branch `feature/uc-201` and pushed to GitHub.

Commit includes:
- Implementation code (all new files and modifications)
- Session summary (sessions/UC-201-Session-Summary.md)
- CLAUDE.md updates (atomic with code changes)

Branch: feature/uc-201
Ready for: Step 6 (merge to main)

Waiting for your approval to merge to main...
```

---

### Step 6: Merge to Main (REQUIRES EXPLICIT APPROVAL)

**⚠️ STOP - Request explicit approval before merging:**

```
Feature branch `feature/uc-201` is ready to merge.

Changes summary:
- [X] files modified
- [X] files created
- Session summary saved
- CLAUDE.md updated

All changes committed and pushed to feature/uc-201.

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
git merge feature/uc-201

# Push to GitHub
git push origin main
```

**After successful merge, confirm:**

```
✅ UC-201 Session Complete!

Branch merged: feature/uc-201 → main
All changes pushed to GitHub
Documentation updated and committed atomically with code

Remaining manual steps for Chuck:
- [ ] Update Use Case Registry (mark UC-201 as ✔️ Implemented with date)
- [ ] Update README.md (if needed)

Session closeout complete! 🚀

Feature branch `feature/uc-201` can be kept for reference or deleted.
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
- [ ] Projects display in both grid view and list view
- [ ] Project cards show: name, client/department, status badge, COIN count, color tag
- [ ] Color tags visible (4px border in grid, 12px circle in list)
- [ ] Status badges display correctly with appropriate colors
- [ ] Empty states display correctly:
  - [ ] EmptyProjectListState when no projects
  - [ ] EmptyProjectDetailState when project has no COINs
- [ ] Project detail shows project metadata bar with status and COIN count
- [ ] Layout is responsive in both portrait and landscape orientations
- [ ] Grid uses 2 columns (portrait) and 3 columns (landscape)
- [ ] Visual consistency with UC-200/UC-202 (same card styling)

### ✅ Functional Requirements
- [ ] Tap project card navigates to ProjectDetailScreen
- [ ] Back button returns from project detail to projects list
- [ ] View toggle switches between grid and list layouts instantly
- [ ] Sort dropdown changes sort order correctly (6 options)
- [ ] Pull-to-refresh works on both ProjectsScreen and ProjectDetailScreen
- [ ] Archived projects are hidden (filtered out automatically)
- [ ] Projects list shows only non-archived projects
- [ ] Project detail shows only COINs assigned to that project (projectIds filtering)
- [ ] "+" button in header shows "Coming Soon" alert
- [ ] Empty state buttons show "Coming Soon" alerts
- [ ] Sort preference synced across tabs (uses COINContext sortOption)

### ✅ Data Requirements
- [ ] Project interface defined correctly in `src/types/index.ts`
- [ ] ProjectStatus type defined with 4 values
- [ ] COIN interface updated with projectIds array field
- [ ] COIN interface updated with optional projectName field
- [ ] Mock data includes exactly 5 projects in `mockData.ts`
- [ ] Mock projects have realistic data (names, clients, dates, colors)
- [ ] All 18 existing COINs updated with projectIds
- [ ] Distribution correct: 15 COINs in projects, 3 root-level
- [ ] coinCount computed correctly for each project

### ✅ Integration Requirements
- [ ] UC-200 (Recents tab) still works perfectly
- [ ] UC-202 (Favorites tab) still works perfectly
- [ ] No flicker when switching between tabs
- [ ] Shared sort preference works (COINContext)
- [ ] Reused components working:
  - [ ] COINCard displays correctly in project detail
  - [ ] COINListItem works in list view
  - [ ] SortSelector shows 6 sort options
  - [ ] ViewToggle switches layouts
- [ ] No modifications to components that shouldn't be changed
- [ ] No duplicate components created

### ✅ Persistence Requirements
- [ ] View mode persists for ProjectsScreen
- [ ] Sort option persists for ProjectsScreen
- [ ] View mode persists for ProjectDetailScreen (separate from list)
- [ ] Preferences survive app restart
- [ ] AsyncStorage keys follow naming convention:
  - [ ] @design_the_what:projects_view_mode
  - [ ] @design_the_what:projects_sort_option
  - [ ] @design_the_what:project_detail_view_mode

### ✅ Performance Requirements
- [ ] Smooth 60fps scrolling in projects list
- [ ] Smooth 60fps scrolling in project detail
- [ ] Instant tab switching (no lag)
- [ ] No lag on view mode changes
- [ ] No lag on sort option changes
- [ ] Pull-to-refresh animation smooth

### ✅ Code Quality Requirements
- [ ] All TypeScript types defined (no `any` types)
- [ ] No console errors in terminal
- [ ] No console warnings in terminal
- [ ] Follows React Native best practices
- [ ] Follows established patterns from UC-200/UC-202
- [ ] Component props properly typed with interfaces
- [ ] useMemo used for expensive computations (sorting, filtering)
- [ ] Proper key props on FlatList items

### ✅ Documentation Requirements
- [ ] Specification saved to `specifications/` folder
- [ ] Session summary saved to `sessions/` folder
- [ ] CLAUDE.md updated with UC-201 patterns (committed atomically)
- [ ] Git commit message detailed and descriptive
- [ ] Use Case Registry updated (Chuck does this manually)
- [ ] README.md updated if needed (Chuck does this manually)

### ✅ Git Requirements
- [ ] Feature branch created before implementation
- [ ] All files committed to feature branch
- [ ] Pushed to GitHub
- [ ] Merged to main (after approval)
- [ ] No uncommitted changes remaining

---

## 🔄 Future UC Integration Notes

### UC-203: Create Project (Next UC)

**This UC establishes:**
- ✅ Project data model
- ✅ Project card display pattern
- ✅ Empty state with "Create Project" CTA
- ✅ Navigation structure for project management
- ✅ "+" button in header (ready for implementation)

**UC-203 will add:**
- Create Project modal (form sheet presentation)
- Project form (name, client, color tag, dates)
- Save new project to AsyncStorage
- Add project to list immediately
- Proper form validation

**Integration points ready:**
- `handleCreateProject` handler in ProjectsScreen header
- EmptyProjectListState "Create First Project" button
- Modal presentation pattern

### UC-204: Edit Project Metadata (Future)

**Integration points ready:**
- Long-press on project card (context menu)
- Edit Project modal (similar to Create Project)
- Update project in list
- Change project status
- Archive project workflow
- Delete project with confirmation

### UC-210: Move COIN Between Projects (Future)

**Integration points ready:**
- EmptyProjectDetailState "Add from Recents" button
- COIN context menu in project detail
- Multi-select COINs workflow
- Update projectIds array
- Refresh project and detail views

---

## ⚠️ Known Limitations (Intentional Deferrals)

**Phase 1 Scope (These are NOT bugs):**
- ✅ Projects are local only (no cloud sync until Phase 2)
- ✅ Single project per COIN (projectIds.length <= 1)
- ✅ No linked COINs across projects (Phase 3 feature)
- ✅ No project favorites toggle (could add in future UC)
- ✅ No project search (list is short enough to scroll)
- ✅ No "Show Archived" toggle (future UC if needed)
- ✅ No multi-select COINs (Phase 2 feature)
- ✅ No batch COIN operations (Phase 2 feature)
- ✅ No project templates (Phase 2 feature)
- ✅ No project duplication (future UC)

**Deferred to Future UCs:**
- AS-2: Add COIN from Another Project (complex workflow → UC-210)
- AS-3: Create New Project (separate UC-203)
- AS-4: Edit Project Metadata (separate UC-204)
- AS-5: Change Project Status (part of UC-204)
- AS-6: Archive Project (part of UC-204)
- AS-7: Delete Project (part of UC-204)
- AS-8: Move COIN to Different Project (separate UC-210)
- AS-9: Unassign COIN from Project (part of UC-210)

---

## 📚 References

**Session Summaries (Pattern Reference):**
- `sessions/UC-200-Session-Summary.md` - Reusable components, responsive patterns
- `sessions/UC-202-Session-Summary.md` - Shared state, haptics, optional handlers

**Architecture Documents:**
- Navigation-Architecture-Specification.md - Three-tab structure, stack navigation
- Data-Models-Specification-v2.0.md - Complete data models with Phase 1/2/3 fields
- Organizational-Patterns-Research.md - BA work patterns (project-based organization)

**Process Documents:**
- `~/Projects/coin-app/process-docs/DEVELOPMENT-PROCESS.md` - Complete workflow
- SPECIFICATION-QUALITY-CHECKLIST.md - This spec targets 8-9/10 quality

---

## ✅ Specification Quality Self-Assessment

**Essential Elements (Must Have - 10/10):**
- ✅ Context setting (links to UC-200/UC-202, CLAUDE.md, DEVELOPMENT-PROCESS.md)
- ✅ Git workflow (Step 2 upfront, Steps 4-6 at end)
- ✅ Component reuse (explicit list: COINCard, SortSelector, ViewToggle, etc.)
- ✅ Step-by-step implementation (7 detailed steps)
- ✅ Data model changes (Project interface, COIN updates)
- ✅ Filter/sort logic (project filtering, COIN filtering by projectIds)
- ✅ Mock data strategy (5 projects, 18 COIN assignments)
- ✅ Testing checklist (comprehensive, organized by category)
- ✅ Acceptance criteria (complete, testable)
- ✅ Session closeout protocol (proactive, with verification gates)

**Quality Enhancements (Should Have 70%+ - 8/10):**
- ✅ State management strategy (local vs shared, persistence patterns)
- ✅ Default behaviors (sort: name-asc, view: grid, empty states)
- ✅ User feedback patterns (Alerts for coming soon features)
- ✅ Performance considerations (useMemo, FlatList, key props)
- ✅ Integration impact analysis (must not break UC-200/UC-202)
- ✅ Proactive closeout initiation (Claude Code asks when complete)
- ✅ Pre-commit verification checklist
- ✅ Approval gates for risky operations (merge)

**Excellent Specifications (Nice to Have 30%+ - 7/10):**
- ✅ Design refinement guidance (project card layout, metadata bar)
- ✅ Empty state design (two types: list empty, project empty)
- ✅ Code quality standards (follows UC-200/UC-202 patterns)
- ✅ Future UC integration notes (UC-203, UC-204, UC-210)
- ✅ Known limitations section (Phase 1 scope, intentional deferrals)
- ✅ Escape hatch guidance (what to do if issues arise)
- ✅ Success confirmation message

**Target:** 8-9/10 ✅ Achieved
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
- Reference UC-200/UC-202 patterns first (in session summaries)
- Check CLAUDE.md for established patterns
- Ask Chuck for clarification
- Don't guess - it's better to ask than implement incorrectly

**Success looks like:**
- Projects tab fully functional with smooth navigation
- No regressions in Recents or Favorites tabs
- All 18 COINs properly assigned to projects
- Empty states working correctly
- Consistent with established app patterns
- Complete documentation trail (summary + CLAUDE.md)
- Clean git history with atomic commits

**Remember:**
- ✅ CREATE feature branch FIRST (before any code)
- ✅ REUSE components (don't recreate)
- ✅ FOLLOW patterns (don't invent new ones)
- ✅ TEST thoroughly (all orientations, all scenarios)
- ✅ ASK questions (when spec is unclear)
- ✅ DETECT completion (offer closeout proactively)
- ✅ VERIFY before committing (run checklist)
- ✅ REQUEST approval before merging (don't assume)

Good luck! 🚀

---

**End of UC-201 Specification v1.1**

---

## 📋 Version History

**v1.0** (October 30, 2025)
- Initial specification

**v1.1** (October 30, 2025)
- Added Git workflow section (Step 2 upfront)
- Added proactive closeout initiation guidance
- Added session closeout protocol (Steps 4a, 4b, 5, 6)
- Added pre-commit verification checklist
- Added explicit approval gate for merge
- Added escape hatch guidance for issues
- Added success confirmation message
- Integrated DEVELOPMENT-PROCESS.md references throughout
