# UC-201 Specification: View COIN List (Projects Tab)
**For Claude Code Implementation**

**Specification Version:** 1.0  
**Created:** October 22, 2025  
**Platform:** React Native (iPad - Phase 1)  
**Wave:** Wave 1  
**Target:** Expo + React Native + TypeScript  

---

## Source Use Case

**UC-201: View COIN List (Projects Tab)**  
Location: `UC-201-View-COIN-List-Projects-Tab-Elaboration.md`

**Summary:** Projects tab providing organizational access to ALL COINs through a shallow two-level hierarchy (Projects → COINs). Complements UC-200 Recents by offering organizational browsing (vs. temporal access). Supports BA portfolio management with visual browsing, project-based organization, and faceted access patterns.

---

## Implementation Overview

Create the "Projects" tab screen for the COIN iPad app, implementing the complementary organizational view to Recents. While Recents shows "what I recently worked on," Projects shows "where everything lives." This screen displays all projects as cards in a grid, with drill-down navigation to view COINs within each project. The design follows iOS conventions with hierarchical navigation, visual browsing optimization, and supports episodic BA work patterns.

**Key Requirements:**
- Projects grid (auto-adjusts for portrait/landscape)
- Two-level hierarchy: Projects → COINs (maximum depth)
- Project cards show name, color tag, COIN count, last modified
- Drill down to project detail showing COINs grid
- Shared COINCard component with UC-200
- Unassigned COINs section (COINs without project)
- Bottom tab bar navigation (Recents/Projects/Favorites)
- Floating "+" button for new COIN or project creation
- Stack navigation for hierarchical browsing

---

## Technical Architecture

### Screen Components

**`ProjectsScreen.tsx`** - Top-level projects list screen
- Uses React Navigation's Stack.Screen in Projects tab stack
- Displays all projects in grid format
- Manages project state
- Handles navigation to project detail
- Root screen in Projects tab stack

**`ProjectDetailScreen.tsx`** - Individual project's COINs view
- Pushed onto Projects stack when project tapped
- Displays all COINs in selected project
- Reuses COINCard component from UC-200
- Back navigation to ProjectsScreen
- Shows project header with name, color, metadata

### Key Components

**`ProjectCardGrid`** - Responsive grid for projects
- FlatList with numColumns based on orientation
- Similar to COINCardGrid but for projects
- Pull-to-refresh support
- Maintains 60fps scrolling

**`ProjectCard`** - Reusable project card component
- Props: `project`, `onPress`, `onLongPress`
- Displays project name, color tag, COIN count, last modified
- Long-press for context menu
- Touch feedback (opacity change on press)
- Color indicator (left edge bar or icon)

**`COINCardGrid`** - Reuses UC-200 component
- Same FlatList grid from Recents screen
- Displays COINs within selected project
- Lazy loading of thumbnails
- Pull-to-refresh support

**`COINCard`** - Reuses UC-200 component
- Identical component shared with Recents tab
- Same props, same behavior
- Different data source (filtered by project)

**`UnassignedCOINsSection`** - Special section component
- Displays COINs not assigned to any project
- Appears at top of projects list if unassigned COINs exist
- Collapsible section with header and count
- Grid of COIN cards below header

**`EmptyProjectsState`** - Zero state for projects list
- Shown when no projects exist
- Clear message and call-to-action
- Illustrative icon

**`EmptyProjectState`** - Zero state for project detail
- Shown when project has no COINs
- Project header still visible
- Call-to-action to add COINs

### Services

**`ProjectRepository`**
- `getAllProjects(): Promise<Project[]>`
- `getProjectById(id: string): Promise<Project | null>`
- `getCOINsByProject(projectId: string): Promise<COIN[]>`
- `getUnassignedCOINs(): Promise<COIN[]>`
- `createProject(project: Partial<Project>): Promise<Project>`
- `updateProject(id: string, updates: Partial<Project>): Promise<Project>`
- `deleteProject(id: string): Promise<void>`
- Manages AsyncStorage persistence

**`COINRepository`** (existing - from UC-200)
- Used to fetch COIN data for cards
- Provides thumbnails
- Filters COINs by project

### Data Models

```typescript
import { COIN } from '@shared/types';

interface Project {
  id: string;
  name: string;
  color: ProjectColor; // 8 predefined colors
  clientOrDepartment?: string;
  status?: string; // Draft | Active | Complete | Archived
  createdDate: Date;
  lastModifiedDate: Date;
  coinCount: number; // Calculated field
}

enum ProjectColor {
  Blue = '#007AFF',
  Green = '#34C759',
  Orange = '#FF9500',
  Red = '#FF3B30',
  Purple = '#AF52DE',
  Teal = '#5AC8FA',
  Pink = '#FF2D55',
  Gray = '#8E8E93',
}

interface ProjectSort {
  field: 'name' | 'lastModified' | 'coinCount' | 'createdDate';
  direction: 'asc' | 'desc';
}
```

### Navigation Structure (from Navigation Architecture Spec)

```
Projects Tab Stack
├── ProjectsScreen (root)
│   └── Project cards grid
└── ProjectDetailScreen (push)
    └── COINs grid for selected project

Both screens can open:
├── COINEditor (modal, global)
└── CreateProject (modal, global)
```

---

## Detailed Requirements

### Layout & Responsive Behavior

**Portrait Orientation (ProjectsScreen):**
- 2 columns of project cards
- 16pt spacing between cards
- 24pt margins from screen edges
- Project cards: 150-180pt wide, auto-height

**Landscape Orientation (ProjectsScreen):**
- 3 columns of project cards
- Same spacing and margins
- Wider screen shows more content

**Portrait Orientation (ProjectDetailScreen):**
- Same as UC-200: 3 columns of COIN cards
- Consistent with Recents tab
- 16pt spacing between cards

**Landscape Orientation (ProjectDetailScreen):**
- Same as UC-200: 4 columns of COIN cards
- Consistent with Recents tab

**Card Sizing:**
- Project cards: Width fills columns, height auto-adjusts to content
- COIN cards: Same as UC-200 (2:3 aspect ratio)
- Minimum card width: 140pt (project), 200pt (COIN)

**Implementation Note:** Use FlatList with `numColumns` prop that updates based on screen width. Listen to Dimensions change event for orientation detection. ProjectDetailScreen reuses COINCardGrid component from UC-200.

### Project Card Content

Each project card displays:

**Color Indicator:**
- 6pt wide vertical bar on left edge of card
- Spans full height
- One of 8 predefined colors
- Provides quick visual recognition

**Project Name:**
- 18pt SFProText-Semibold, black
- Position: Top, 12pt from left (after color bar), 12pt from top
- Max 2 lines, truncate with ellipsis
- Main identification element

**COIN Count:**
- 14pt SFProText-Regular, gray (#666666)
- Format: "5 COINs" or "1 COIN"
- Position: Below project name, 4pt spacing

**Last Modified:**
- 12pt SFProText-Regular, light gray (#999999)
- Format: "2 hours ago", "3 days ago", "Oct 15", etc.
- Position: Bottom of card, 12pt from edges

**Client/Department (Optional):**
- 14pt SFProText-Regular, gray (#666666)
- Shown if present in metadata
- Position: Between COIN count and last modified

**Card Styling:**
- Background: White
- Corner radius: 12pt
- Shadow: iOS standard card shadow (subtle)
- Padding: 12pt all sides (except left with color bar)

### COIN Card Content (in ProjectDetailScreen)

**Identical to UC-200 specification:**
- Thumbnail with name overlay
- Project name, last accessed time
- Status badge
- Same 2:3 aspect ratio
- Same touch interactions

See UC-200 specification for complete COIN card details.

### Unassigned COINs Section

**When Shown:**
- At least one COIN exists without project assignment
- Appears at TOP of projects list (before projects)

**Section Header:**
- Text: "Unassigned COINs (5)" - count dynamically updated
- 18pt SFProText-Semibold, black
- Chevron icon (down when expanded, right when collapsed)
- Tap header to toggle expand/collapse
- Background: Light gray (#F5F5F5)
- Height: 50pt

**Section Content (When Expanded):**
- Grid of COIN cards (same format as UC-200)
- Same column count as Recents (3 portrait, 4 landscape)
- COINs shown without project context
- Tap COIN card opens editor
- Long-press shows context menu (including "Assign to Project")

**Default State:**
- Expanded on first view
- State persists across sessions (AsyncStorage)
- Visual indicator shows expanded/collapsed state

### Navigation Bar (ProjectsScreen)

**Header Configuration:**
```typescript
{
  headerLargeTitle: true,              // iOS 11+ large title
  headerTitle: 'Projects',
  headerRight: () => <AddButton />,    // Plus icon
  headerLeft: undefined,               // No back (root screen)
  headerSearchBarOptions: {            // iOS 13+ search bar
    placeholder: 'Search projects',
    hideWhenScrolling: false,
  },
}
```

**Add Button (+):**
- Opens action sheet with options:
  - "New Project" (primary)
  - "New COIN" (secondary)
- SF Symbol: plus.circle.fill
- Size: 28pt
- Color: Primary blue
- Haptic: Medium impact on tap

**Search Bar (Phase 2):**
- Placeholder only in Phase 1
- Full search functionality deferred to Phase 2
- UI present but disabled with toast "Coming in Phase 2"

### Navigation Bar (ProjectDetailScreen)

**Header Configuration:**
```typescript
{
  headerLargeTitle: false,             // Standard title on detail
  headerTitle: project.name,           // Dynamic project name
  headerBackTitle: 'Projects',         // Custom back button text
  headerRight: () => <MenuButton />,   // Three-dot menu
  headerTintColor: project.color,      // Back button uses project color
}
```

**Back Button:**
- Standard iOS back button with "< Projects"
- Swipe from left edge also works (gesture)
- Returns to ProjectsScreen
- Preserves scroll position on ProjectsScreen

**Menu Button (Three Dots):**
- Opens context menu with options:
  - "Edit Project Details"
  - "Add COIN to Project"
  - "Delete Project" (confirmation required)
- SF Symbol: ellipsis.circle
- Same styling as Add button

### Project Context Menu (Long-Press)

**Trigger:** Long-press on project card in ProjectsScreen

**Menu Options:**
- "Open Project" (default action)
- "Edit Project Details"
- "Create COIN in Project"
- "Delete Project" (destructive, confirmation required)
- "Cancel"

**Visual Style:**
- iOS 13+ context menu style
- Blur background
- Rounded corners
- Haptic: Medium impact when menu appears

### Interaction Behaviors

**Tap Project Card (ProjectsScreen):**
- Visual feedback: Opacity 0.6 during press
- Haptic: Light impact on press
- Action: Push to ProjectDetailScreen
- Animation: Standard iOS right-to-left push (300ms)
- Back gesture available (swipe from left)

**Long-Press Project Card:**
- Shows context menu after 400ms hold
- Haptic: Medium impact when menu appears
- No action on release if menu shown
- Menu dismisses on tap outside or selection

**Tap COIN Card (ProjectDetailScreen):**
- Identical to UC-200 behavior
- Navigate to COIN editor (modal, global stack)
- Records access time
- Updates last modified on project

**Tap + Button (ProjectsScreen):**
- Shows action sheet:
  - "New Project" → Opens CreateProjectModal
  - "New COIN" → Opens UC-100 CreateCOINModal
  - "Cancel"
- Button: 56x56pt circle, bottom-right corner (24pt from edges)
- Background: App primary color (blue)
- Icon: Plus symbol, white, 28pt
- Shadow: Standard iOS button shadow
- Haptic: Medium impact on tap

**Back Navigation:**
- Tap back button or swipe from left edge
- Returns to ProjectsScreen from ProjectDetailScreen
- Standard iOS animation (right-to-left slide, 300ms)
- Preserves ProjectsScreen scroll position

**Pull to Refresh (Both Screens):**
- Standard iOS refresh control
- Spinner appears when pulled past threshold
- Refreshes projects list or COINs in project
- Updates metadata (counts, timestamps)
- Animation completes smoothly

### Empty States

**Empty Projects List (ProjectsScreen):**

**Shown when:**
- User has never created any projects
- User deleted all projects

**Content:**
- SF Symbol: folder.fill, 80pt, light gray
- Headline: "No Projects Yet" (24pt, Semibold)
- Subtext: "Organize your COINs into projects for easier management" (16pt, Regular, gray)
- CTA Button: "Create Your First Project" (primary style)
- Secondary Button: "Create COIN" (secondary style)

**Layout:**
- Centered vertically and horizontally
- Content max width: 400pt
- 16pt spacing between elements

**Empty Project Detail (ProjectDetailScreen):**

**Shown when:**
- Project exists but has no COINs assigned

**Content:**
- Project header remains visible (name, color, metadata)
- SF Symbol: doc.text.magnifyingglass, 60pt, light gray
- Headline: "No COINs in [Project Name]" (20pt, Semibold)
- Subtext: "Add COINs to this project to organize your work" (16pt, Regular, gray)
- CTA Button: "Create COIN in This Project" (primary style)

**Layout:**
- Centered in available space below header
- Content max width: 400pt

### Bottom Tab Bar

**Same as UC-200:**
- Three tabs: Recents, Projects (active), Favorites
- Projects tab shows folder.fill icon
- Active state: Primary color, filled icon
- Tab labels: 11pt SFProText-Medium
- Tapping active Projects tab scrolls to top
- State preservation: Each tab maintains scroll position

### Sort Options (ProjectsScreen)

**Sort Button:**
- Located in navigation bar (left of + button)
- SF Symbol: arrow.up.arrow.down.circle
- Opens action sheet with sort options

**Sort Options:**
- "Last Modified" (default)
- "Name (A-Z)"
- "Name (Z-A)"
- "COIN Count (Most First)"
- "COIN Count (Least First)"
- "Date Created (Newest)"
- "Date Created (Oldest)"

**Behavior:**
- Selected option shown with checkmark
- Projects list re-sorts immediately
- Sort preference persisted (AsyncStorage)
- Smooth animation during re-sort

### Performance Requirements

**Scrolling:**
- Maintain 60fps during scroll
- No jank or frame drops
- Smooth deceleration

**Project List Loading:**
- Load projects list <300ms
- Show skeleton placeholders while loading
- Smooth transition from skeleton to content

**Navigation:**
- Push to ProjectDetailScreen <200ms
- Back navigation <200ms
- No lag or stuttering

**COIN Thumbnail Loading (ProjectDetailScreen):**
- Same as UC-200: Lazy load thumbnails
- Show placeholder immediately
- Swap in thumbnail when loaded (fade transition)
- Cache loaded thumbnails in memory

**Animations:**
- Card press: <100ms response time
- Push/pop navigation: 300ms ease-out
- All animations use native driver (60fps guarantee)

**Memory:**
- Projects list: Keep all projects in memory (expected max 50)
- COINs in project: Same as UC-200 (max 20 visible)
- Release thumbnails when scrolled far off-screen
- No memory leaks from listeners

---

## Implementation Scenarios

### Main Success Scenario (from UC-201)

**User Flow:**
1. User taps "Projects" tab in bottom tab bar
2. ProjectsScreen displays with projects grid
3. Optional: Unassigned COINs section at top (if any exist)
4. Projects shown as cards (2 wide in portrait)
5. User taps a project card
6. Navigation pushes to ProjectDetailScreen
7. COINs in project shown as grid (3 wide in portrait)
8. User taps a COIN card
9. COIN editor opens (modal)

**Test:** Launch app, navigate to Projects tab, tap project, verify COINs shown, tap COIN, verify editor opens

### AS-1: Empty Projects State

**Scenario:** New user with no projects

**Implementation:**
- Check projects list length
- If empty, show EmptyProjectsState component
- Display "Create Your First Project" CTA
- Tap CTA opens CreateProjectModal
- After creating project, projects list shows new project

**Test:** New install, navigate to Projects, verify empty state, create project, verify appears in list

### AS-2: Empty Project Detail

**Scenario:** User taps project with no COINs

**Implementation:**
- ProjectDetailScreen renders with project header
- COINs list empty
- Show EmptyProjectState component
- Display "Create COIN in This Project" CTA
- Tap CTA opens UC-100 with project pre-filled
- After creating COIN, returns to ProjectDetailScreen with COIN shown

**Test:** Create project (no COINs), tap project, verify empty state, create COIN in project, verify appears

### AS-3: Unassigned COINs Section

**Scenario:** User has COINs not assigned to projects

**Implementation:**
- Query for COINs with no project assignment
- If any exist, render UnassignedCOINsSection at top of ProjectsScreen
- Section header shows count: "Unassigned COINs (5)"
- Tap header toggles expand/collapse
- When expanded, show grid of unassigned COIN cards
- Persistence: Save expanded/collapsed state to AsyncStorage

**Test:** Create COIN without project, navigate to Projects, verify unassigned section appears, tap COIN, verify opens editor

### AS-4: Long-Press Context Menu

**Scenario:** User wants to perform action on project without opening it

**Implementation:**
- Detect long-press on project card (react-native-gesture-handler)
- After 400ms hold, show context menu (iOS style)
- Menu options: Open, Edit, Create COIN, Delete
- Tap option executes action
- Tap outside dismisses menu

**Test:** Long-press project card, verify menu appears, select "Edit", verify edit modal opens

### AS-5: Navigation Flow

**Scenario:** User navigates Projects → Project Detail → COIN Editor → Back → Back

**Implementation:**
- ProjectsScreen (root in Projects tab stack)
- Tap project → Push ProjectDetailScreen
- Back button shows "< Projects"
- Tap COIN → Open COINEditor (modal, global stack)
- Close editor → Returns to ProjectDetailScreen
- Tap back or swipe → Pop to ProjectsScreen
- ProjectsScreen scroll position preserved

**Test:** Complete navigation flow, verify all transitions smooth, verify scroll position preserved

### AS-6: Sort Projects

**Scenario:** User wants to sort projects by name

**Implementation:**
- Tap sort button in navigation bar
- Action sheet appears with sort options
- User selects "Name (A-Z)"
- Projects list re-sorts with smooth animation
- Sort preference saved to AsyncStorage
- On next launch, same sort order applied

**Test:** Change sort order, verify list re-sorts, restart app, verify sort persisted

### AS-7: Create Project Flow

**Scenario:** User creates new project from Projects tab

**Implementation:**
- Tap + button in ProjectsScreen
- Action sheet: "New Project" or "New COIN"
- Select "New Project"
- CreateProjectModal opens (form sheet modal)
- Form fields: Name (required), Color (required), Client/Department (optional)
- Tap Save: Validates, creates project, dismisses modal
- Returns to ProjectsScreen with new project visible
- New project appears at top (most recent)

**Test:** Create project via + button, verify modal opens, fill form, save, verify project appears in list

### AS-8: Delete Project

**Scenario:** User deletes project with confirmation

**Implementation:**
- Long-press project card, select "Delete Project" from context menu
- Alert appears: "Delete [Project Name]?" with message "This will not delete the COINs in this project. They will become unassigned."
- Two buttons: "Cancel" (default), "Delete" (destructive red)
- Tap Delete: Removes project, COINs become unassigned
- Project card animates out
- Brief toast: "Project Deleted"
- If COINs existed, unassigned section appears/updates

**Test:** Delete project with COINs, verify confirmation, confirm delete, verify COINs now in unassigned section

---

## Data Management

### Project Storage

**AsyncStorage Keys:**
```typescript
'@projects': JSON.stringify(projects[])
'@projects_sort': JSON.stringify(sortPreference)
'@unassigned_section_expanded': JSON.stringify(boolean)
```

### Project CRUD Operations

**Create Project:**
```typescript
async createProject(project: Partial<Project>): Promise<Project> {
  const newProject = {
    id: uuid(),
    name: project.name,
    color: project.color,
    clientOrDepartment: project.clientOrDepartment,
    status: 'Active',
    createdDate: new Date(),
    lastModifiedDate: new Date(),
    coinCount: 0,
  };
  
  const projects = await getProjects();
  projects.push(newProject);
  await AsyncStorage.setItem('@projects', JSON.stringify(projects));
  
  return newProject;
}
```

**Update Project:**
```typescript
async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) throw new Error('Project not found');
  
  projects[index] = {
    ...projects[index],
    ...updates,
    lastModifiedDate: new Date(),
  };
  
  await AsyncStorage.setItem('@projects', JSON.stringify(projects));
  return projects[index];
}
```

**Delete Project:**
```typescript
async deleteProject(id: string): Promise<void> {
  // Get all COINs in project and clear their projectReferences
  const coins = await COINRepository.getCOINsByProject(id);
  
  for (const coin of coins) {
    const updatedReferences = coin.projectReferences.filter(ref => ref !== id);
    await COINRepository.updateCOIN(coin.id, { 
      projectReferences: updatedReferences 
    });
  }
  
  // Delete project
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== id);
  await AsyncStorage.setItem('@projects', JSON.stringify(filtered));
}
```

### Query Operations

**Get Projects with Counts:**
```typescript
async getProjectsWithCounts(): Promise<Project[]> {
  const projects = await getProjects();
  const coins = await COINRepository.getAllCOINs();
  
  // Calculate COIN count for each project
  return projects.map(project => ({
    ...project,
    coinCount: coins.filter(coin => 
      coin.projectReferences.includes(project.id)
    ).length,
  }));
}
```

**Get Unassigned COINs:**
```typescript
async getUnassignedCOINs(): Promise<COIN[]> {
  const coins = await COINRepository.getAllCOINs();
  return coins.filter(coin => 
    !coin.projectReferences || coin.projectReferences.length === 0
  );
}
```

**Sort Projects:**
```typescript
function sortProjects(projects: Project[], sort: ProjectSort): Project[] {
  const sorted = [...projects];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'lastModified':
        comparison = b.lastModifiedDate.getTime() - a.lastModifiedDate.getTime();
        break;
      case 'coinCount':
        comparison = b.coinCount - a.coinCount;
        break;
      case 'createdDate':
        comparison = b.createdDate.getTime() - a.createdDate.getTime();
        break;
    }
    
    return sort.direction === 'desc' ? comparison : -comparison;
  });
  
  return sorted;
}
```

---

## Integration Points

### With UC-200 (Recents Tab)

**Shared Components:**
- COINCard component (identical rendering and behavior)
- COINCardGrid component (same grid layout logic)
- StatusBadge component
- EmptyState styling patterns

**Navigation:**
- Both accessible via bottom tab bar
- Independent scroll state preservation
- Cross-reference: COIN in Recents also exists in a Project (or unassigned)

**Data Sharing:**
- Both query COINRepository for COIN data
- Changes in one reflected in other
- Project assignment visible in both views

### With UC-100 (Create COIN)

**Integration:**
- Projects tab + button can launch UC-100
- Context passed: Current project ID (if in ProjectDetailScreen)
- UC-100 form pre-fills project field
- After COIN creation, new COIN appears in project
- If no project context, COIN becomes unassigned

**Navigation Flow:**
- ProjectsScreen → + button → Action sheet → "New COIN" → UC-100 modal
- ProjectDetailScreen → + button → UC-100 modal (project pre-filled)

### With UC-110 (COIN Editor)

**Integration:**
- Tap COIN card opens editor (modal, global stack)
- Editor receives COIN ID
- Editor knows project context (for breadcrumb/header)
- Close editor returns to ProjectDetailScreen
- Updates project's last modified timestamp

**Navigation Flow:**
- ProjectDetailScreen → Tap COIN card → UC-110 modal
- Edit COIN → Close → Returns to ProjectDetailScreen
- ProjectDetailScreen refreshes data

### With UC-130 (Edit COIN Metadata)

**Future Integration (Phase 2):**
- Long-press COIN card in ProjectDetailScreen
- Context menu includes "Edit Details"
- Opens UC-130 for metadata editing
- Can change project assignment from UC-130
- Changes reflected immediately in ProjectDetailScreen

### With Navigation Architecture

**Tab Structure:**
```
MainTabs (Bottom Tab Navigator)
├── RecentsTab (UC-200)
├── ProjectsTab (UC-201) ← This specification
│   └── ProjectsStack
│       ├── ProjectsScreen (root)
│       └── ProjectDetailScreen (push)
└── FavoritesTab (Future)

Global Modals (overlay tabs)
├── COINEditor (UC-110)
├── CreateCOIN (UC-100)
└── CreateProject (New)
```

**State Preservation:**
- ProjectsScreen scroll position preserved when switching tabs
- ProjectDetailScreen state preserved when opening COIN editor
- Sort preferences persisted across app restarts
- Unassigned section expand/collapse state persisted

---

## Navigation Implementation Details

### ProjectsScreen Navigation Options

```typescript
// In Projects tab stack navigator
<Stack.Screen 
  name="ProjectsScreen"
  component={ProjectsScreen}
  options={{
    headerLargeTitle: true,
    headerTitle: 'Projects',
    headerRight: () => <AddButton />,
    headerSearchBarOptions: {
      placeholder: 'Search projects',
      hideWhenScrolling: false,
    },
  }}
/>
```

### ProjectDetailScreen Navigation Options

```typescript
<Stack.Screen 
  name="ProjectDetailScreen"
  component={ProjectDetailScreen}
  options={({ route }) => ({
    headerLargeTitle: false,
    headerTitle: route.params.project.name,
    headerBackTitle: 'Projects',
    headerRight: () => <MenuButton project={route.params.project} />,
    headerTintColor: route.params.project.color,
  })}
/>
```

### Navigation Params

```typescript
// TypeScript types for navigation
type ProjectsStackParamList = {
  ProjectsScreen: undefined;
  ProjectDetailScreen: {
    project: Project;
  };
};

// Usage in components
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type ProjectDetailProps = NativeStackScreenProps<
  ProjectsStackParamList,
  'ProjectDetailScreen'
>;

function ProjectDetailScreen({ navigation, route }: ProjectDetailProps) {
  const { project } = route.params;
  
  // Navigate back
  const handleBack = () => {
    navigation.goBack();
  };
  
  // Open COIN editor
  const handleCOINPress = (coin: COIN) => {
    navigation.navigate('COINEditor', { coinId: coin.id });
  };
}
```

### Gesture Configuration

```typescript
// Enable swipe-back gesture
screenOptions={{
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animation: 'slide_from_right',
}}

// Custom gesture responder for long-press
import { LongPressGestureHandler } from 'react-native-gesture-handler';

<LongPressGestureHandler
  onHandlerStateChange={handleLongPress}
  minDurationMs={400}
>
  <ProjectCard project={project} />
</LongPressGestureHandler>
```

---

## Implementation Libraries & Dependencies

### Required Packages (Same as UC-200)

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/stack": "^6.4.1",
    "react-native-screens": "^3.34.0",
    "react-native-safe-area-context": "^4.10.5",
    "react-native-gesture-handler": "^2.17.1",
    "@react-native-async-storage/async-storage": "^1.24.0",
    "expo-haptics": "^13.0.1"
  }
}
```

### Gesture Handler

**For Long-Press Context Menu:**
- Use react-native-gesture-handler's LongPressGestureHandler
- Minimum duration: 400ms
- Haptic feedback: Medium impact when menu appears

**For Swipe-Back:**
- Built into React Navigation Stack
- Native driver for smooth animation

### Performance

- Lazy load project thumbnails (if/when added in future)
- Use React.memo for ProjectCard component
- Avoid unnecessary re-renders
- Use FlatList optimization props (windowSize, maxToRenderPerBatch, etc.)
- Reuse COINCard component from UC-200 (already optimized)

---

## Acceptance Criteria Checklist

### Functional Requirements
- [ ] Projects tab accessible from bottom tab bar
- [ ] Projects screen displays as grid (2 columns portrait, 3 landscape)
- [ ] Each project card shows: name, color tag, COIN count, last modified
- [ ] Tap project card navigates to project detail screen
- [ ] Project detail screen shows COINs in grid format (same as Recents)
- [ ] Tap COIN card opens COIN editor
- [ ] Unassigned COINs section appears when COINs exist without projects
- [ ] Unassigned section can expand/collapse
- [ ] Unassigned section state persists across sessions
- [ ] Long-press project card shows context menu
- [ ] Context menu options: Open, Edit, Create COIN, Delete
- [ ] + button opens action sheet: New Project or New COIN
- [ ] Sort button opens action sheet with sort options
- [ ] Selected sort option persists across sessions
- [ ] Back button returns from project detail to projects list
- [ ] Swipe from left edge also navigates back
- [ ] Pull-to-refresh updates projects list
- [ ] Pull-to-refresh in project detail updates COINs list
- [ ] Empty state shown when no projects exist
- [ ] Empty state in project detail when no COINs in project
- [ ] Delete project moves COINs to unassigned

### User Experience
- [ ] Navigation feels natural and hierarchical
- [ ] Visual scanning easy with color tags and counts
- [ ] Touch feedback on all interactions (opacity, haptics)
- [ ] Long-press menu feels natural (400ms delay)
- [ ] Back navigation preserves scroll position
- [ ] Tab switching preserves scroll position
- [ ] Orientation changes handled smoothly
- [ ] Tapping active Projects tab scrolls to top
- [ ] Sort changes animate smoothly
- [ ] Project detail header shows project context clearly

### Visual Design
- [ ] Project cards visually distinct from COIN cards
- [ ] Color tags prominent and recognizable
- [ ] COIN count clearly visible
- [ ] Typography hierarchy clear
- [ ] Consistent with UC-200 Recents visual design
- [ ] COINCard component renders identically in both tabs
- [ ] Empty states friendly and helpful
- [ ] Context menus use iOS 13+ style
- [ ] Navigation headers follow iOS conventions

### Performance
- [ ] Projects list loads in <300ms
- [ ] Grid scrolling maintains 60fps
- [ ] Navigation transitions smooth (<300ms)
- [ ] No lag when tapping cards
- [ ] Large projects list (50 projects) performs well
- [ ] Project with many COINs (20+) scrolls smoothly
- [ ] Memory usage reasonable
- [ ] No memory leaks from listeners

### iPad-Specific
- [ ] Works flawlessly in portrait orientation
- [ ] Works flawlessly in landscape orientation
- [ ] Orientation changes smooth and non-disruptive
- [ ] Touch targets meet 44×44pt minimum
- [ ] Gestures feel natural (tap, long-press, swipe-back)
- [ ] Haptic feedback appropriate and consistent
- [ ] Respects safe area insets

### Navigation Architecture Compliance
- [ ] Projects tab in bottom tab bar (middle position)
- [ ] Stack navigation for Projects → Project Detail
- [ ] Modal presentation for COIN editor (global)
- [ ] Back button and swipe-back both work
- [ ] Navigation state preserved correctly
- [ ] Header configuration matches specification
- [ ] Integration with tab bar navigation
- [ ] Deep linking support (Phase 2 consideration)

### Data Integrity
- [ ] Project and COIN counts accurate
- [ ] Metadata displays correctly (dates, names, colors)
- [ ] Changes immediately reflected across views
- [ ] Scroll position preserved correctly
- [ ] Sort order applied correctly
- [ ] No duplicate items displayed
- [ ] Deleted projects removed from view immediately
- [ ] Unassigned COINs appear when project deleted

### Integration
- [ ] ProjectRepository persists to AsyncStorage
- [ ] COINRepository provides COIN data
- [ ] Navigation to editor (UC-110) works
- [ ] Navigation to create COIN (UC-100) works
- [ ] Navigation to create project works
- [ ] Shared COINCard component works identically
- [ ] Tab navigation to Recents (UC-200) works
- [ ] State restoration works correctly

---

## Testing Guidance

### Manual Testing Scenarios

**Test 1: Fresh Install - Empty Projects**
1. Install app (no prior data)
2. Navigate to Projects tab
3. Verify empty state appears
4. Verify "Create Your First Project" button present
5. Tap button, create project
6. Return to Projects
7. Verify project appears in grid

**Test 2: Create Multiple Projects**
1. Create 5 projects with different colors
2. Verify each appears in list
3. Verify COIN counts all show "0 COINs"
4. Tap a project
5. Verify empty project state
6. Create COIN in that project
7. Go back to Projects
8. Verify project now shows "1 COIN"

**Test 3: Unassigned COINs Section**
1. From Recents or elsewhere, create COIN without project
2. Navigate to Projects tab
3. Verify "Unassigned COINs" section appears at top
4. Verify section shows correct count
5. Tap section header
6. Verify section collapses
7. Tap again, verify expands
8. Restart app
9. Verify section state persisted

**Test 4: Project Hierarchy Navigation**
1. Tap project with COINs
2. Verify project detail shows COINs grid
3. Verify back button shows "< Projects"
4. Tap COIN
5. Verify editor opens (modal)
6. Close editor
7. Verify returns to project detail
8. Tap back button
9. Verify returns to projects list
10. Verify scroll position preserved

**Test 5: Long-Press Context Menu**
1. Long-press project card
2. Verify context menu appears after 400ms
3. Verify haptic feedback
4. Select "Edit Project Details"
5. Verify edit modal opens
6. Cancel edit
7. Long-press again
8. Select "Delete Project"
9. Verify confirmation alert
10. Confirm delete
11. Verify project removed

**Test 6: Sort Projects**
1. Create projects with various names and dates
2. Tap sort button
3. Select "Name (A-Z)"
4. Verify projects sort alphabetically
5. Select "COIN Count (Most First)"
6. Verify sort by count
7. Restart app
8. Verify sort persisted

**Test 7: Orientation Change**
1. View Projects in portrait (2 columns)
2. Rotate to landscape
3. Verify 3 columns
4. Verify layout reflows smoothly
5. Tap project, view detail
6. Verify COINs show 4 columns (landscape)
7. Rotate to portrait
8. Verify 3 columns
9. No navigation disruption

**Test 8: Cross-Tab Consistency**
1. In Projects, note a specific COIN in a project
2. Switch to Recents tab
3. Find same COIN in Recents
4. Verify project name shown
5. Tap COIN in Recents, edit it
6. Return, switch back to Projects
7. Navigate to that project
8. Verify COIN shows updates

**Test 9: Delete Project with COINs**
1. Create project with 3 COINs
2. Long-press project, select Delete
3. Verify warning about COINs becoming unassigned
4. Confirm delete
5. Verify project removed
6. Verify "Unassigned COINs" section appears/updates
7. Verify all 3 COINs now in unassigned section

**Test 10: Performance with Many Projects**
1. Create 30 projects
2. Add 5 COINs to various projects
3. Scroll rapidly through projects list
4. Verify smooth 60fps scrolling
5. Tap project with many COINs
6. Verify detail view loads quickly
7. Scroll through COINs
8. Verify smooth performance

### Automated Testing

**Unit Tests:**
- ProjectRepository CRUD methods
- Sort projects function
- Calculate COIN counts function
- Project color assignment

**Integration Tests:**
- Full flow: Launch → Projects → Tap Project → View COINs → Open COIN → Return
- Create project flow → Appears in list
- Delete project flow → COINs become unassigned
- Sort persistence across app restart
- Navigation state preservation

**E2E Tests:**
- Complete user journey through Projects tab
- Cross-tab navigation (Projects ↔ Recents)
- Create project → Add COINs → View in project
- Unassigned section behavior

---

## Common Pitfalls to Avoid

1. **Don't forget to calculate COIN counts** - Must query COINs for each project
2. **Don't hard-code project colors** - Use enum of 8 predefined colors
3. **Don't skip unassigned section logic** - Critical for UX when COINs have no project
4. **Don't forget navigation state preservation** - Scroll position must persist
5. **Don't mix ProjectCard and COINCard components** - They have different layouts
6. **Don't skip context menu on long-press** - iOS users expect this pattern
7. **Don't forget back button customization** - "< Projects" not generic "Back"
8. **Don't hard-code stack navigation** - Follow Navigation Architecture Spec patterns
9. **Don't skip empty states** - Both projects list and project detail need empty states
10. **Don't forget haptic feedback** - iOS users expect tactile responses
11. **Don't skip sort persistence** - Sort preference must survive app restart
12. **Don't forget COINCard reuse** - Must be identical to UC-200 rendering
13. **Don't skip orientation handling** - Test both portrait and landscape thoroughly
14. **Don't forget safe area insets** - Especially for tab bar and navigation bars

---

## Implementation Notes

### Suggested Component Structure

```
src/screens/ProjectsScreen.tsx             (Projects list screen)
src/screens/ProjectDetailScreen.tsx        (Project detail screen)
src/components/projects/ProjectCardGrid.tsx  (Grid container for projects)
src/components/projects/ProjectCard.tsx      (Project card component)
src/components/projects/UnassignedCOINsSection.tsx
src/components/projects/EmptyProjectsState.tsx
src/components/projects/EmptyProjectState.tsx
src/components/shared/COINCard.tsx         (Reused from UC-200)
src/components/shared/COINCardGrid.tsx     (Reused from UC-200)
src/services/ProjectRepository.ts
src/utils/projectColors.ts                 (Color enum and helpers)
```

### Suggested Navigation Setup

```typescript
// Projects tab stack
<Stack.Navigator>
  <Stack.Screen 
    name="ProjectsScreen" 
    component={ProjectsScreen}
    options={{
      headerLargeTitle: true,
      headerTitle: 'Projects',
      headerRight: () => <AddButton />,
    }}
  />
  <Stack.Screen 
    name="ProjectDetailScreen" 
    component={ProjectDetailScreen}
    options={({ route }) => ({
      headerTitle: route.params.project.name,
      headerBackTitle: 'Projects',
      headerTintColor: route.params.project.color,
    })}
  />
</Stack.Navigator>
```

### Suggested FlatList for Projects

```typescript
<FlatList
  data={sortedProjects}
  renderItem={({item}) => (
    <ProjectCard 
      project={item} 
      onPress={() => navigateToDetail(item)}
      onLongPress={() => showContextMenu(item)}
    />
  )}
  keyExtractor={item => item.id}
  numColumns={isLandscape ? 3 : 2}
  key={isLandscape ? 'landscape' : 'portrait'}
  contentContainerStyle={styles.gridContainer}
  columnWrapperStyle={styles.row}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  ListHeaderComponent={unassignedCOINs.length > 0 ? <UnassignedCOINsSection /> : null}
  ListEmptyComponent={<EmptyProjectsState />}
  windowSize={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

### Suggested Long-Press Implementation

```typescript
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { ActionSheetIOS } from 'react-native';

const handleLongPress = ({ nativeEvent }) => {
  if (nativeEvent.state === State.ACTIVE) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Open Project', 'Edit Project Details', 'Create COIN in Project', 'Delete Project', 'Cancel'],
      destructiveButtonIndex: 3,
      cancelButtonIndex: 4,
    }, (buttonIndex) => {
      switch (buttonIndex) {
        case 0: navigateToProject(project); break;
        case 1: openEditModal(project); break;
        case 2: createCOINInProject(project); break;
        case 3: deleteProject(project); break;
      }
    });
  }
};
```

---

## Success Metrics

**Implementation Complete When:**
- All acceptance criteria pass
- Manual testing scenarios pass
- Performance meets 60fps target
- Navigation feels natural and iOS-standard
- Visual design matches specification
- Integration with UC-200 seamless (shared components)
- Chuck approves on actual iPad

**Quality Indicators:**
- Zero crashes during testing
- Smooth animations throughout
- Intuitive hierarchical navigation
- Feels native to iOS
- Works in both orientations
- Project and COIN counts always accurate
- Scroll position preservation works reliably

---

## Summary for Claude Code

**What to Build:**
Projects tab with two-level hierarchy (Projects → COINs). Grid of project cards with drill-down navigation to view COINs within each project. Reuses COINCard component from UC-200 for consistency. Includes unassigned COINs section, long-press context menus, sort options, and empty states. Follows iOS hierarchical navigation patterns with stack-based navigation.

**Key Technologies:**
- React Native FlatList (responsive grid for projects and COINs)
- react-native-gesture-handler (long-press context menu)
- expo-haptics (touch feedback)
- AsyncStorage (project storage and preferences)
- React Navigation Stack (hierarchical navigation)
- React Navigation Bottom Tabs (tab bar)

**Critical Requirements:**
- 60fps scrolling performance
- Two-level maximum hierarchy (Projects → COINs)
- Reuse COINCard component from UC-200 (identical rendering)
- 2 columns portrait, 3 landscape (projects)
- 3 columns portrait, 4 landscape (COINs in project detail)
- Unassigned COINs section (expandable/collapsible)
- Long-press context menu (400ms delay)
- Sort persistence across sessions
- Navigation state preservation
- iOS-standard back navigation (button + swipe)

**Test Focus:**
- Navigation flow (Projects → Detail → Editor → Back → Back)
- Scroll position preservation across navigation and tabs
- COINCard rendering identical to UC-200
- Unassigned section behavior
- Project COIN counts accuracy
- Sort persistence
- Orientation handling
- Performance with 30+ projects

**Integration Points:**
- Shares COINCard, COINCardGrid, StatusBadge with UC-200
- Integrates with UC-100 (Create COIN) via + button
- Integrates with UC-110 (COIN Editor) via COIN card tap
- Complements UC-200 (Recents) in bottom tab bar
- Follows Navigation Architecture Specification patterns

---

**This specification provides everything needed to implement UC-201: View COIN List (Projects Tab) for iPad. Follow iOS conventions, maintain 60fps, reuse components from UC-200, and focus on intuitive hierarchical navigation that supports BA organizational workflows.**
