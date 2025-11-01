# Navigation Architecture Specification

## COIN iPad App \- Phase 1

**Version:** 1.1  
**Date:** October 24, 2025  
**Last Updated:** October 24, 2025 (UC-110 correction)  
**Target Platform:** iPad (React Native \+ Expo)  
**Navigation Library:** React Navigation 6.x

**CORRECTION NOTE (v1.1):** This version corrects references to UC-110, which was a fictional use case. The correct architecture uses UC-100 (Create New COIN) and UC-101 (Edit COIN), both sharing the same Canvas component. Previous references to "COIN Editor" as a separate use case have been clarified to reflect the shared Canvas architecture.

---

## Executive Summary

This specification defines the complete navigation architecture for the COIN iPad app, implementing a three-tab structure with canvas-centric editing. The architecture follows iOS conventions while optimizing for episodic business analyst workflows.

**Key Decisions:**

- ✅ Bottom tab bar with 3 tabs (Recents, Projects, Favorites)  
- ✅ Modal presentation for Canvas (full-screen, hides tabs)  
- ✅ **Canvas component shared by UC-100 (Create) and UC-101 (Edit)**  
- ✅ Stack navigation within tabs for hierarchical browsing  
- ✅ State preservation across tab switches  
- ✅ Gesture-based navigation (swipe-to-go-back)

**Research Foundation:**

- Organizational Patterns research (iOS conventions)  
- Canvas-Centric UI research (editor patterns)  
- Architecture Decision Document (technical constraints)

---

## 1\. Navigation Structure Overview

### 1.1 Three-Level Navigation Hierarchy

Root Navigator (Tab)

├── Recents Tab (Stack)

│   ├── RecentsScreen (default)

│   └── \[Future: filters, sorts\]

│

├── Projects Tab (Stack)

│   ├── ProjectsScreen (default)

│   ├── ProjectDetailScreen (push)

│   └── \[Future: project settings\]

│

└── Favorites Tab (Stack)

    ├── FavoritesScreen (default)

    └── \[Future: manage favorites\]

Global Modal Stack (overlays tabs)

├── Canvas (modal, full-screen) ← Shared by UC-100 & UC-101

├── CreateProjectScreen (modal, form sheet)

├── ParticipantLibraryScreen (modal, form sheet)

├── GlossaryScreen (modal, form sheet)

└── SettingsScreen (modal, form sheet)

**ARCHITECTURAL CLARIFICATION:**

- **Canvas** is a **component**, not a use case  
- **UC-100 (Create New COIN)** opens Canvas with empty COIN data  
- **UC-101 (Edit COIN)** opens Canvas with existing COIN data  
- Both use cases provide identical editing capabilities via the same Canvas component  
- There is NO separate "UC-110" or "COIN Editor" use case

### 1.2 Navigator Types

**Tab Navigator (Root)**

- Type: `@react-navigation/bottom-tabs`  
- Position: Bottom edge (iOS standard)  
- Always visible: Except when modal presented  
- Tab count: 3 (Recents, Projects, Favorites)

**Stack Navigators (Per Tab)**

- Type: `@react-navigation/stack`  
- Transition: Right-to-left push (iOS standard)  
- Back gesture: Swipe from left edge  
- Header: Large title on root, standard on detail

**Modal Stack (Global)**

- Type: `@react-navigation/stack` with modal presentation  
- Transition: Bottom-to-top slide  
- Dismissal: Swipe down or close button  
- Covers tab bar: Yes (full attention)

---

## 2\. Tab Bar Configuration

### 2.1 Tab Definitions

**Tab 1: Recents**

- Icon: Clock (SF Symbol: `clock.fill`)  
- Label: "Recents"  
- Default: Yes (app launches to this tab)  
- Purpose: Temporal access to recently-accessed COINs

**Tab 2: Projects**

- Icon: Folder (SF Symbol: `folder.fill`)  
- Label: "Projects"  
- Purpose: Organizational access via project hierarchy

**Tab 3: Favorites**

- Icon: Star (SF Symbol: `star.fill`)  
- Label: "Favorites"  
- Purpose: Quick access to starred/favorited COINs

### 2.2 Tab Bar Appearance

**Styling:**

tabBarStyle: {

  height: 83,                         // Standard iPad tab bar height

  backgroundColor: 'systemBackground',

  borderTopWidth: 0.5,

  borderTopColor: 'separator',

}

tabBarActiveTintColor: '\#007AFF',     // systemBlue

tabBarInactiveTintColor: '\#8E8E93',   // secondaryLabel

tabBarLabelStyle: {

  fontSize: 10,

  fontWeight: '500',

}

tabBarIconStyle: {

  marginBottom: \-2,

}

**Behavior:**

- Tab switches: Instant, no animation delay  
- Current tab indicator: Icon color \+ label color change  
- Badge support: Can show counts (Phase 2\)  
- Haptic feedback: Light impact on tab switch

### 2.3 Tab Bar Visibility Rules

**Always Visible:**

- When on any tab's root or detail screens  
- When scrolling within tabs  
- When keyboard is shown (does not hide)

**Hidden:**

- When Canvas modal presented (full-screen focus)  
- When any modal sheet presented (Create Project, Settings, etc.)  
- Never hidden programmatically during normal navigation

---

## 3\. Stack Navigation Within Tabs

### 3.1 Recents Tab Stack

**Screen Hierarchy:**

RecentsScreen (root)

  ↓ (future: can push to filters, but Phase 1 stays flat)

**Navigation Patterns:**

- Tap COIN card → Opens Canvas modal (not push)  
- Pull-to-refresh → Reloads recent items  
- No deep stack needed in Phase 1

**Header Configuration:**

{

  headerLargeTitle: true,              // iOS 11+ large title

  headerTitle: 'Recents',

  headerRight: () \=\> \<SettingsButton /\>,  // Gear icon

  headerLeft: undefined,               // No back button on root

  headerSearchBarOptions: {            // iOS 13+ search bar

    placeholder: 'Search COINs',

    hideWhenScrolling: false,

  },

}

### 3.2 Projects Tab Stack

**Screen Hierarchy:**

ProjectsScreen (root)

  ↓ push

ProjectDetailScreen (shows COINs in project)

  ↓ (tap COIN card opens modal, doesn't push)

**Navigation Patterns:**

- Tap project card → Push to ProjectDetailScreen  
- Back button/gesture → Pop to ProjectsScreen  
- Tap COIN within project → Opens Canvas modal  
- Tab bar remains visible throughout stack

**ProjectsScreen Header:**

{

  headerLargeTitle: true,

  headerTitle: 'Projects',

  headerRight: () \=\> \<AddProjectButton /\>,  // Plus icon

  headerSearchBarOptions: {

    placeholder: 'Search projects',

  },

}

**ProjectDetailScreen Header:**

{

  headerLargeTitle: false,             // Standard title on detail

  headerTitle: project.name,           // Dynamic project name

  headerBackTitle: 'Projects',         // Custom back button text

  headerRight: () \=\> \<ProjectMenuButton /\>,  // Three-dot menu

}

### 3.3 Favorites Tab Stack

**Screen Hierarchy:**

FavoritesScreen (root)

  ↓ (future: manage favorites, but Phase 1 stays flat)

**Navigation Patterns:**

- Tap COIN card → Opens Canvas modal  
- Similar to Recents, stays flat in Phase 1

**Header Configuration:**

{

  headerLargeTitle: true,

  headerTitle: 'Favorites',

  headerRight: () \=\> \<SettingsButton /\>,

  headerSearchBarOptions: {

    placeholder: 'Search favorites',

  },

}

---

## 4\. Modal Navigation (Global)

### 4.1 Modal Presentation Patterns

**Two Modal Types:**

**1\. Full-Screen Modals (Canvas)**

- Presentation: Covers entire screen including tab bar  
- Transition: Vertical slide from bottom  
- Dismissal: Close button (X) in nav bar OR swipe down  
- Navigation: Internal UI panels, not hierarchical navigation  
- Use case: Canvas (UC-100 & UC-101), any immersive editing

**2\. Form Sheet Modals (Settings, Forms)**

- Presentation: Centered card on iPad, respects safe areas  
- Transition: Zoom \+ fade in  
- Dismissal: Cancel/Done buttons OR tap outside  
- Navigation: Usually single screen, no stack  
- Use case: Create Project, Settings, Quick Forms

### 4.2 Canvas Modal (Shared by UC-100 & UC-101)

**CRITICAL ARCHITECTURAL UNDERSTANDING:**

The Canvas is a **shared component**, not a separate use case. Both UC-100 (Create New COIN) and UC-101 (Edit COIN) open the same Canvas component with different data states:

- **UC-100:** Canvas receives empty/new COIN data → User creates from scratch  
- **UC-101:** Canvas receives existing COIN data → User edits existing diagram

**Navigator Type:** Root Modal Stack with `presentation: 'fullScreenModal'`

**Screen Name:** `Canvas` (previously called "COINEditor" \- clarified for v1.1)

**Navigation from Anywhere:**

// From UC-100 (Create New COIN)

navigation.navigate('Canvas', {

  mode: 'create',

  coinId: newCoinId,

  projectId: selectedProjectId,

});

// From UC-101 (Edit COIN) \- tap COIN card anywhere

navigation.navigate('Canvas', {

  mode: 'edit',

  coinId: coin.id,

});

**Internal Canvas UI (NOT Navigation):**

Canvas Component

  ├─→ Parking Lot (slide-in panel overlay)

  ├─→ To-Do List (bottom panel overlay)

  ├─→ Glossary (slide-in panel overlay)

  └─→ Settings menu (dropdown menu)

**CRITICAL DECISION:** Parking Lot, To-Do, Glossary, and Settings menu are **UI overlays/panels on the Canvas**, NOT separate navigated screens. See Canvas-Centric UI Research for rationale (prevents context loss for episodic users returning to app after weeks/months).   
**IMPORTANT \- Create COIN Flow:** UC-100 (Create COIN) opens the canvas IMMEDIATELY when user taps "+ New COIN" button. There is NO pre-modal form. COIN name and project are editable inline in the canvas header. This differs from UC-XXX (Create Project) which DOES use a form sheet modal before opening any view. The canvas-first approach eliminates friction and gets business analysts working immediately.

**Canvas Header Configuration:**

{

  headerTitle: coin.name,              // Editable via tap (inline editing)

  headerLeft: () \=\> \<CloseButton /\>,   // X to dismiss modal

  headerRight: () \=\> \<ExportButton /\>, // Export/Share menu

  headerBackVisible: false,            // No back button (modal root)

  headerStyle: {

    backgroundColor: 'systemBackground',

  },

}

**Canvas Bottom Toolbar:**

- Not part of React Navigation (custom component)  
- Contains: Add Participant, Add Interaction, Parking Lot, To-Do, Glossary buttons  
- Three visibility modes: Normal (all buttons), Compact (icons only), Hidden (editing focus)  
- See Canvas UI specification for complete details

### 4.3 Create Project Modal

**Screen:** `CreateProjectScreen`  
**Type:** Form sheet modal  
**Transition:** Zoom \+ fade

**Navigation Configuration:**

{

  presentation: 'formSheet',           // iPad: centered card

  headerShown: true,

  headerTitle: 'New Project',

  headerLeft: () \=\> \<CancelButton /\>,

  headerRight: () \=\> \<SaveButton /\>,

  gestureEnabled: true,                // Swipe down to dismiss

}

**Dismissal Behavior:**

- Save button → Validates, saves, dismisses  
- Cancel button → Confirms if dirty, dismisses  
- Swipe down → Same as Cancel  
- Tap outside → Not available (iOS doesn't support for form sheets)

**NOTE \- Contrast with Create COIN:** Unlike Create COIN (UC-100) which opens canvas immediately with no pre-modal, Create Project uses a traditional form sheet modal. This is appropriate because:

- Project creation requires deliberate name/description setup  
- Projects are organizational containers (less frequent creation)  
- COINs are created rapidly during workshops (needs immediate canvas access)  
- Form-before-view pattern works well for project-level operations

### 4.4 Settings Modal

**Screen:** `SettingsScreen`  
**Type:** Form sheet modal  
**Transition:** Standard modal slide

**Navigation Configuration:**

{

  presentation: 'modal',               // Standard modal

  headerShown: true,

  headerTitle: 'Settings',

  headerLeft: () \=\> \<CloseButton /\>,

  headerLargeTitle: false,

}

---

## 5\. State Preservation

### 5.1 Per-Tab State Preservation

**Requirement:** Each tab must preserve its navigation state independently when switching tabs.

**Implementation:**

- React Navigation 6 handles this automatically with `unmountOnBlur: false`  
- Each tab stack maintains its own navigation state  
- Scroll positions preserved via React Navigation's state persistence

**Example User Flow:**

1. User on Projects tab, drills down to ProjectDetailScreen  
2. User switches to Recents tab  
3. User switches back to Projects tab  
4. ✅ User sees ProjectDetailScreen exactly as left (scroll position, etc.)

**Configuration:**

\<Tab.Navigator

  screenOptions={{

    unmountOnBlur: false,      // Don't unmount screens when tab hidden

    lazy: true,                // Load tabs lazily on first access

  }}

\>

### 5.2 Modal State Preservation

**Requirement:** Canvas modal must preserve editing state if user switches apps.

**Implementation:**

- Auto-save every 30 seconds  
- Save on app backgrounding (iOS lifecycle event)  
- Restore on app foregrounding if modal was open  
- Use AsyncStorage for draft state persistence

**Edge Case Handling:**

- User opens Canvas → Switches to Mail app → Returns  
- ✅ Canvas still open with all changes preserved  
- iOS may have terminated app → Restore from AsyncStorage draft

### 5.3 Deep Link State Restoration

**Requirement:** Deep links (URL schemes, notifications) must work from any app state.

**Implementation:**

- Parse deep link URL  
- If COIN ID provided → Open Canvas modal directly  
- If Project ID provided → Navigate to Projects tab → Push ProjectDetail  
- Preserve previous navigation state (can go back)

**Example URL:** `coinapp://coin/{coinId}`

- Opens Canvas modal  
- User can close modal → Returns to previous screen  
- If app was cold start → Opens to Recents tab underneath

---

## 6\. Navigation Gestures

### 6.1 Standard iOS Gestures

**Swipe from Left Edge (Back Gesture):**

- Behavior: Pop current screen from stack  
- Availability: All stack screens except roots  
- Implementation: React Navigation's `gestureEnabled: true` (default)  
- Cancellation: Swipe \<50% → Cancels, returns to current

**Swipe Down (Dismiss Modal):**

- Behavior: Dismiss current modal  
- Availability: All modals with `gestureEnabled: true`  
- Implementation: React Navigation modal gesture  
- Cancellation: Swipe \<50% → Cancels

**Double-Tap Tab Bar Icon:**

- Behavior: Scroll to top of current tab's root screen  
- Availability: When on any screen in that tab's stack  
- Implementation: Custom listener on tab bar

### 6.2 Custom Canvas Gestures

**In Canvas Only:**

- Pinch to zoom (canvas viewport)  
- Two-finger pan (canvas viewport move)  
- Single-finger drag (move participant bubble)  
- Long-press (context menu on elements)

**Important:** Canvas gestures must NOT interfere with navigation gestures. Specifically:

- Swipe down from top edge → Dismisses Canvas modal (must work)  
- Canvas drag gestures confined to canvas area only  
- Toolbar/header remain non-canvas zones

---

## 7\. Navigation State Persistence

### 7.1 Persistent Navigation State

**Requirement:** App must restore navigation state after force-quit and relaunch.

**Implementation:**

import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE\_KEY \= 'NAVIGATION\_STATE\_V1';

\<NavigationContainer

  onStateChange={(state) \=\> 

    AsyncStorage.setItem(PERSISTENCE\_KEY, JSON.stringify(state))

  }

  initialState={await AsyncStorage.getItem(PERSISTENCE\_KEY)}

\>

**What Gets Persisted:**

- Current tab selection  
- Stack history per tab  
- Modal state (if Canvas open, restore to tab underneath)  
- Scroll positions (React Navigation handles)

**What Does NOT Persist:**

- Canvas editing state (handled separately by auto-save)  
- Transient UI state (search queries, filters)  
- Animation states

### 7.2 Canvas State Persistence (Separate from Navigation)

**Requirement:** Canvas edits must not be lost if app terminates.

**Implementation:**

- Separate from navigation state persistence  
- Auto-save draft COIN to AsyncStorage every 30 seconds  
- Save on Canvas modal dismissal  
- Restore draft if app reopens with unsaved changes

**Draft Recovery Flow:**

1. User opens Canvas, makes edits  
2. App crashes or is force-quit  
3. User relaunches app  
4. System detects unsaved draft  
5. Shows alert: "You have unsaved changes to \[COIN Name\]. Restore?"  
6. If yes → Opens Canvas with draft restored  
7. If no → Discards draft, shows Recents tab

---

## 8\. React Navigation Implementation

### 8.1 Navigator Structure Code

**Root Navigator:**

// App.tsx

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createStackNavigator } from '@react-navigation/stack';

const Tab \= createBottomTabNavigator();

const Stack \= createStackNavigator();

const RecentsStack \= createStackNavigator();

const ProjectsStack \= createStackNavigator();

const FavoritesStack \= createStackNavigator();

// Root Modal Stack (wraps Tab Navigator)

function RootNavigator() {

  return (

    \<Stack.Navigator

      screenOptions={{

        presentation: 'modal',

        headerShown: false,

      }}

    \>

      \<Stack.Screen name="MainTabs" component={MainTabNavigator} /\>

      \<Stack.Screen 

        name="Canvas"  // Shared by UC-100 & UC-101

        component={CanvasScreen}

        options={{

          presentation: 'fullScreenModal',

          headerShown: true,

          gestureEnabled: true,

        }}

      /\>

      \<Stack.Screen 

        name="CreateProject" 

        component={CreateProjectScreen}

        options={{

          presentation: 'formSheet',

          headerShown: true,

        }}

      /\>

      \<Stack.Screen 

        name="Settings" 

        component={SettingsScreen}

        options={{

          presentation: 'modal',

          headerShown: true,

        }}

      /\>

    \</Stack.Navigator\>

  );

}

// Main Tab Navigator

function MainTabNavigator() {

  return (

    \<Tab.Navigator

      screenOptions={{

        headerShown: false,  // Stacks show their own headers

        unmountOnBlur: false,

        lazy: true,

        tabBarActiveTintColor: '\#007AFF',  // systemBlue

        tabBarInactiveTintColor: '\#8E8E93',  // secondaryLabel

        tabBarStyle: {

          height: 83,

          backgroundColor: 'systemBackground',

        },

      }}

    \>

      \<Tab.Screen 

        name="RecentsTab" 

        component={RecentsStackNavigator}

        options={{

          tabBarLabel: 'Recents',

          tabBarIcon: ({ color, size }) \=\> (

            \<Icon name="clock" size={size} color={color} /\>

          ),

        }}

      /\>

      \<Tab.Screen 

        name="ProjectsTab" 

        component={ProjectsStackNavigator}

        options={{

          tabBarLabel: 'Projects',

          tabBarIcon: ({ color, size }) \=\> (

            \<Icon name="folder" size={size} color={color} /\>

          ),

        }}

      /\>

      \<Tab.Screen 

        name="FavoritesTab" 

        component={FavoritesStackNavigator}

        options={{

          tabBarLabel: 'Favorites',

          tabBarIcon: ({ color, size }) \=\> (

            \<Icon name="star" size={size} color={color} /\>

          ),

        }}

      /\>

    \</Tab.Navigator\>

  );

}

// Recents Tab Stack

function RecentsStackNavigator() {

  return (

    \<RecentsStack.Navigator

      screenOptions={{

        headerLargeTitle: true,

      }}

    \>

      \<RecentsStack.Screen 

        name="Recents" 

        component={RecentsScreen}

        options={{

          headerTitle: 'Recents',

          headerSearchBarOptions: {

            placeholder: 'Search COINs',

          },

        }}

      /\>

    \</RecentsStack.Navigator\>

  );

}

// Projects Tab Stack

function ProjectsStackNavigator() {

  return (

    \<ProjectsStack.Navigator

      screenOptions={{

        headerLargeTitle: true,

      }}

    \>

      \<ProjectsStack.Screen 

        name="Projects" 

        component={ProjectsScreen}

        options={{

          headerTitle: 'Projects',

          headerSearchBarOptions: {

            placeholder: 'Search projects',

          },

        }}

      /\>

      \<ProjectsStack.Screen 

        name="ProjectDetail" 

        component={ProjectDetailScreen}

        options={({ route }) \=\> ({

          headerTitle: route.params.project.name,

          headerLargeTitle: false,

          headerBackTitle: 'Projects',

        })}

      /\>

    \</ProjectsStack.Navigator\>

  );

}

// Favorites Tab Stack

function FavoritesStackNavigator() {

  return (

    \<FavoritesStack.Navigator

      screenOptions={{

        headerLargeTitle: true,

      }}

    \>

      \<FavoritesStack.Screen 

        name="Favorites" 

        component={FavoritesScreen}

        options={{

          headerTitle: 'Favorites',

        }}

      /\>

    \</FavoritesStack.Navigator\>

  );

}

// App Entry Point

export default function App() {

  return (

    \<NavigationContainer\>

      \<RootNavigator /\>

    \</NavigationContainer\>

  );

}

### 8.2 TypeScript Type Definitions

**Navigation Param Lists:**

// types/navigation.ts

import { NavigationProp, RouteProp } from '@react-navigation/native';

// Root Modal Stack

export type RootStackParamList \= {

  MainTabs: undefined;

  Canvas: { 

    mode: 'create' | 'edit';

    coinId: string;

    projectId?: string;

  };

  CreateProject: undefined;

  Settings: undefined;

};

// Tab Navigator

export type TabParamList \= {

  RecentsTab: undefined;

  ProjectsTab: undefined;

  FavoritesTab: undefined;

};

// Recents Stack

export type RecentsStackParamList \= {

  Recents: undefined;

};

// Projects Stack

export type ProjectsStackParamList \= {

  Projects: undefined;

  ProjectDetail: { projectId: string; project: Project };

};

// Favorites Stack

export type FavoritesStackParamList \= {

  Favorites: undefined;

};

// Typed Navigation Props

export type RootStackNavigationProp \= NavigationProp\<RootStackParamList\>;

export type ProjectsStackNavigationProp \= NavigationProp\<ProjectsStackParamList\>;

// Typed Route Props

export type ProjectDetailRouteProp \= RouteProp\<ProjectsStackParamList, 'ProjectDetail'\>;

export type CanvasRouteProp \= RouteProp\<RootStackParamList, 'Canvas'\>;

### 8.3 Navigation Actions

**Opening Canvas from UC-100 (Create New COIN):**

import { useNavigation } from '@react-navigation/native';

function CreateCOINButton() {

  const navigation \= useNavigation\<RootStackNavigationProp\>();

  

  const handleCreateCOIN \= async () \=\> {

    // Create new COIN in storage

    const newCoin \= await createNewCOIN(selectedProjectId);

    

    // Open Canvas in create mode

    navigation.navigate('Canvas', {

      mode: 'create',

      coinId: newCoin.id,

      projectId: selectedProjectId,

    });

  };

  

  return \<Button title="New COIN" onPress={handleCreateCOIN} /\>;

}

**Opening Canvas from UC-101 (Edit COIN) \- Any COIN Card:**

function COINCard({ coin }: { coin: COIN }) {

  const navigation \= useNavigation\<RootStackNavigationProp\>();

  

  const handlePress \= () \=\> {

    // Open Canvas in edit mode

    navigation.navigate('Canvas', {

      mode: 'edit',

      coinId: coin.id,

    });

  };

  

  return (

    \<TouchableOpacity onPress={handlePress}\>

      {/\* Card UI \*/}

    \</TouchableOpacity\>

  );

}

**Creating New Project:**

function ProjectsScreen() {

  const navigation \= useNavigation\<RootStackNavigationProp\>();

  

  const handleCreateProject \= () \=\> {

    navigation.navigate('CreateProject');

  };

  

  return (

    \<View\>

      \<Button title="New Project" onPress={handleCreateProject} /\>

      {/\* Projects list \*/}

    \</View\>

  );

}

**Drilling Down in Projects Tab:**

function ProjectsScreen() {

  const navigation \= useNavigation\<ProjectsStackNavigationProp\>();

  

  const handleProjectPress \= (project: Project) \=\> {

    // Push to detail screen within Projects stack

    navigation.navigate('ProjectDetail', { 

      projectId: project.id,

      project,

    });

  };

  

  return (

    \<FlatList

      data={projects}

      renderItem={({ item }) \=\> (

        \<ProjectCard project={item} onPress={() \=\> handleProjectPress(item)} /\>

      )}

    /\>

  );

}

---

## 9\. Unsaved Changes Handling

### 9.1 Canvas Dismissal with Unsaved Changes

**Scenario:** User makes edits in Canvas, then tries to close modal without saving.

**Implementation:**

function CanvasScreen({ route }) {

  const \[hasUnsavedChanges, setHasUnsavedChanges\] \= useState(false);

  const navigation \= useNavigation();

  // Intercept back/close action

  useEffect(() \=\> {

    const unsubscribe \= navigation.addListener('beforeRemove', (e) \=\> {

      if (\!hasUnsavedChanges) {

        // No unsaved changes, allow navigation

        return;

      }

      // Prevent default navigation

      e.preventDefault();

      // Show confirmation alert

      Alert.alert(

        'Discard Changes?',

        'You have unsaved changes. Are you sure you want to close?',

        \[

          { text: "Don't Leave", style: 'cancel', onPress: () \=\> {} },

          {

            text: 'Discard',

            style: 'destructive',

            onPress: () \=\> navigation.dispatch(e.data.action),

          },

        \]

      );

    });

    return unsubscribe;

  }, \[navigation, hasUnsavedChanges\]);

  return (

    \<View\>

      {/\* Canvas UI \*/}

    \</View\>

  );

}

### 9.2 Form Modals with Dirty State

**Scenario:** User fills out Create Project form, then tries to dismiss.

**Same pattern as Canvas:**

- Detect dirty state (any field changed)  
- Intercept dismissal  
- Show confirmation if dirty  
- Allow dismissal if pristine

---

## 10\. Deep Linking

### 10.1 URL Scheme Registration

**Scheme:** `coinapp://`

**iOS Configuration (app.json):**

{

  "expo": {

    "ios": {

      "bundleIdentifier": "com.yourcompany.coinapp",

      "infoPlist": {

        "CFBundleURLTypes": \[

          {

            "CFBundleURLSchemes": \["coinapp"\]

          }

        \]

      }

    }

  }

}

### 10.2 Supported Deep Links

**Open Specific COIN:**

coinapp://coin/{coinId}

- Opens Canvas modal with that COIN  
- Works from any app state (cold/warm/background)

**Open Specific Project:**

coinapp://project/{projectId}

- Switches to Projects tab  
- Pushes ProjectDetail screen

**Open Tab:**

coinapp://tab/recents

coinapp://tab/projects

coinapp://tab/favorites

- Switches to specified tab  
- No additional navigation

### 10.3 Deep Link Handling

import { Linking } from 'react-native';

const linking \= {

  prefixes: \['coinapp://'\],

  config: {

    screens: {

      MainTabs: {

        screens: {

          RecentsTab: 'tab/recents',

          ProjectsTab: 'tab/projects',

          FavoritesTab: 'tab/favorites',

        },

      },

      Canvas: 'coin/:coinId',

      // Add more routes as needed

    },

  },

};

\<NavigationContainer linking={linking}\>

  \<RootNavigator /\>

\</NavigationContainer\>

---

## 11\. Accessibility

### 11.1 VoiceOver Support

**Tab Bar:**

- Each tab has clear accessibility label: "Recents tab", "Projects tab", "Favorites tab"  
- Selected state announced: "Recents tab, selected"  
- Tab switches trigger haptic \+ audio feedback

**Navigation Headers:**

- Back buttons: "Back to \[Previous Screen Name\]"  
- Close buttons: "Close"  
- Action buttons: Descriptive labels ("Export COIN", "Create Project")

**Canvas:**

- Canvas area: "COIN diagram canvas, editable"  
- Participants: "\[Participant Name\], movable button"  
- Interactions: "Interaction \[number\] from \[source\] to \[target\]"  
- Toolbar: Each button clearly labeled

### 11.2 Dynamic Type

**Text Scaling:**

- All text respects iOS Dynamic Type settings  
- Minimum sizes honored even at largest type  
- Layout adapts to accommodate larger text

**Navigation Headers:**

- Large titles scale appropriately  
- Never truncated even at largest sizes

---

## 12\. Performance Considerations

### 12.1 Tab Switching Performance

**Target:** \< 100ms to switch tabs

**Optimization:**

- `unmountOnBlur: false` keeps tabs mounted  
- `lazy: true` defers initial render until first access  
- FlatList with optimized render for COIN cards

### 12.2 Modal Animation Performance

**Target:** 60 FPS during modal open/close

**Optimization:**

- Native driver enabled for animations  
- Minimal component updates during transition  
- Deferred data loading until modal fully visible

### 12.3 Canvas Performance

**Target:** 60 FPS during pan, zoom, drag operations

**Optimization:**

- Canvas rendering separate from React (separate document)  
- Debounced state updates  
- Incremental saves (not full COIN on every change)

---

## 13\. Phase 2 & 3 Considerations

### 13.1 Phase 2: Cloud Sync & Collaboration

**Navigation Impact:**

- Pull-to-refresh on tabs to sync from cloud  
- Conflict resolution modal: Appears on top of Canvas  
- "Syncing..." indicator in navigation header  
- Real-time collaboration indicators on COIN cards

### 13.2 Phase 3: Advanced Features

**Potential New Screens:**

- Version history browser (modal from Canvas)  
- Comparison view (two COINs side-by-side)  
- Templates library (modal from Create flow)  
- Analytics dashboard (new tab? Or push screen?)

**Navigation Decisions Deferred:**

- Whether analytics is a 4th tab or modal  
- Whether templates are in-line or separate screen  
- Whether version history is push or modal

---

## 14\. Implementation Checklist

### Wave 1: Basic Navigation (Current)

- [ ] Install React Navigation packages (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`)  
- [ ] Create root navigator structure (Tab → Stacks → Screens)  
- [ ] Implement 3 tab screens (Recents, Projects, Favorites)  
- [ ] Configure tab bar styling (icons, colors, accessibility)  
- [ ] Implement Projects stack navigation (ProjectDetail push)  
- [ ] Add modal stack for Canvas (full-screen modal)  
- [ ] Configure navigation persistence (AsyncStorage)  
- [ ] Test state preservation across tab switches

### Wave 2: Advanced Navigation

- [ ] Implement Create Project modal (form sheet)  
- [ ] Implement Settings modal  
- [ ] Add search bars to tab screens (iOS search bar component)  
- [ ] Implement double-tap to scroll-to-top on tabs  
- [ ] Add deep link handling (URL scheme registration)  
- [ ] Implement "unsaved changes" confirmation logic  
- [ ] Add navigation accessibility labels

### Wave 3: Polish & Testing

- [ ] Performance testing (tab switch, modal open, scrolling)  
- [ ] Accessibility testing (VoiceOver, Dynamic Type)  
- [ ] Edge case testing (non-existent IDs, offline, errors)  
- [ ] Navigation gesture refinement  
- [ ] Animation timing polish  
- [ ] State persistence testing (force-quit, background, deep link)

---

## 15\. Dependencies

### 15.1 Required Packages

{

  "dependencies": {

    "@react-navigation/native": "^6.1.18",

    "@react-navigation/bottom-tabs": "^6.6.1",

    "@react-navigation/stack": "^6.4.1",

    "react-native-screens": "^3.34.0",

    "react-native-safe-area-context": "^4.10.5",

    "react-native-gesture-handler": "^2.17.1",

    "@react-native-async-storage/async-storage": "^1.24.0"

  }

}

### 15.2 Expo Configuration

{

  "expo": {

    "plugins": \[

      "react-native-gesture-handler"

    \],

    "ios": {

      "supportsTablet": true,

      "infoPlist": {

        "CFBundleURLTypes": \[

          {

            "CFBundleURLSchemes": \["coinapp"\]

          }

        \]

      }

    }

  }

}

---

## 16\. References

### 16.1 Research Documents

- **Organizational Patterns for Business Analyst Apps** (`03 - Architecture/Organizational-Patterns-BA-Research.md`)  
    
  - iOS navigation conventions (tab bar, modal patterns)  
  - Three-tab structure justification  
  - State preservation requirements


- **Canvas-Centric UI Research** (`03 - Architecture/Canvas-Centric-UI-Research.md`)  
    
  - Modal vs. overlay patterns  
  - Context switching optimization  
  - Canvas navigation principles


- **Architecture Decision Document** (`03 - Architecture/Architecture-Decision.md`)  
    
  - Phase 1 technical constraints  
  - React Native \+ Expo stack  
  - Cloud-ready data models

### 16.2 Use Case References

- **UC-100: Create New COIN** \- Opens Canvas in create mode with new COIN  
- **UC-101: Edit COIN** \- Opens Canvas in edit mode with existing COIN  
- **UC-200: View Recent COINs** \- Recents tab implementation  
- **UC-201: View COIN List (Projects Tab)** \- Projects tab implementation

### 16.3 External Resources

- React Navigation 6 Documentation: [https://reactnavigation.org/docs/getting-started](https://reactnavigation.org/docs/getting-started)  
- iOS Human Interface Guidelines (Navigation): [https://developer.apple.com/design/human-interface-guidelines/navigation](https://developer.apple.com/design/human-interface-guidelines/navigation)  
- React Native Gesture Handler: [https://docs.swmansion.com/react-native-gesture-handler/](https://docs.swmansion.com/react-native-gesture-handler/)

---

## Appendix A: Navigation State Structure

**Example Navigation State JSON:**

{

  "routes": \[

    {

      "name": "MainTabs",

      "state": {

        "index": 1,

        "routes": \[

          {

            "name": "RecentsTab",

            "state": {

              "index": 0,

              "routes": \[{ "name": "Recents" }\]

            }

          },

          {

            "name": "ProjectsTab",

            "state": {

              "index": 1,

              "routes": \[

                { "name": "Projects" },

                { 

                  "name": "ProjectDetail",

                  "params": { 

                    "projectId": "proj-123",

                    "project": { /\* project data \*/ }

                  }

                }

              \]

            }

          },

          {

            "name": "FavoritesTab",

            "state": {

              "index": 0,

              "routes": \[{ "name": "Favorites" }\]

            }

          }

        \]

      }

    }

  \]

}

**Interpretation:**

- Currently on ProjectsTab (index: 1\)  
- ProjectsTab stack has 2 screens (index: 1 \= ProjectDetail)  
- Can navigate back to Projects screen  
- Other tabs' states preserved

---

## Appendix B: Modal vs. Push Decision Matrix

**When to use MODAL:**

- ✅ Full-screen immersive experience (Canvas)  
- ✅ Self-contained task with clear start/end (Create Project)  
- ✅ User needs to focus without tab bar distraction  
- ✅ Task can be "cancelled" (returns to previous context)

**When to use PUSH:**

- ✅ Drill-down into details (Project → Project Detail)  
- ✅ Hierarchical navigation (list → detail → sub-detail)  
- ✅ User should see breadcrumbs/back navigation  
- ✅ Tab bar remains relevant (can switch to other tabs)

**Example Decisions:**

| Screen | Pattern | Rationale |
| :---- | :---- | :---- |
| Canvas (UC-100/UC-101) | Modal (full-screen) | Immersive editing, hide tabs |
| Project Detail | Push | Hierarchical, part of Projects browsing |
| Create Project | Modal (form sheet) | Self-contained form, cancel/save |
| Parking Lot | Overlay (NOT navigation) | Contextual to canvas, no separation |
| Settings | Modal | Self-contained configuration |

---

## Appendix C: Performance Benchmarks

**Target Performance Metrics (Phase 1 MVP):**

| Metric | Target | Measurement Method |
| :---- | :---- | :---- |
| Tab switch time | \< 100ms | Time from tap to content visible |
| Modal open time | \< 300ms | Time from trigger to animation complete |
| Back navigation | \< 100ms | Time from gesture to previous screen visible |
| Scroll performance | 60 FPS | FlatList with 100+ items |
| State restore time | \< 500ms | Cold start to navigation restored |
| Memory usage | \< 200 MB | iPad Pro (all tabs mounted) |

**Optimization Priorities:**

1. Lazy loading tabs (done by default)  
2. FlatList optimization (windowSize, removeClippedSubviews)  
3. Image caching for COIN thumbnails  
4. Debounced search (300ms)  
5. Minimal re-renders (React.memo on cards)

---

## Document Control

**Version History:**

- **v1.0** (2025-10-22): Initial specification based on research  
- **v1.1** (2025-10-24): UC-110 correction \- clarified Canvas as shared component for UC-100 & UC-101

**Next Review:** After Wave 1 implementation and testing

**Approval Required From:**

- Chuck Boudreau (Developer & Product Owner)  
- Collin Boudreau (UX Designer)

**Implementation Target:** Wave 1 (Phase 1\)

**Related Specifications:**

- Data Models Specification (Session 2\)  
- Canvas Component Specification (TBD)  
- Visual Design System (TBD)  
- UC-100: Create New COIN (Elaboration v2.1)  
- UC-101: Edit COIN (Elaboration v1.0)

---

**END OF NAVIGATION ARCHITECTURE SPECIFICATION v1.1**  
