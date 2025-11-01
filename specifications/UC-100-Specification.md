# UC-100: Create New COIN - Implementation Prompt for Claude Code

**IMPORTANT CONTEXT:** This UC creates the primary entry point for all COIN diagram work. UC-200 (Recents), UC-201 (Projects), and UC-202 (Favorites) are already implemented with "+" buttons in their headers ready to trigger this UC.

**Integration Required:** This implementation must work seamlessly with all three existing tabs and integrate with the established COINContext state management.

---

## BEFORE YOU START: Git Setup

**CRITICAL:** Follow these steps before writing any code.

```bash
cd ~/Projects/coin-app

# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Create feature branch for UC-100
git checkout -b feature/uc-100

# Verify clean state
git status

# You should see: "On branch feature/uc-100, nothing to commit, working tree clean"
```

**Only proceed with implementation after completing git setup above.**

---

## Project Overview

**Platform:** React Native + Expo (Phase 1: iPad only)  
**Current Status:** UC-200, UC-201, UC-202 complete - All tabs have "+" buttons ready  
**Your Task:** Implement COIN creation modal and canvas screen

**Current Codebase State (from CLAUDE.md):**
- ✅ COINContext manages shared COIN data and favorites
- ✅ Three main tabs implemented (Recents, Favorites, Projects)
- ✅ All tabs have "+" header buttons configured
- ✅ Data models defined in `src/types/index.ts`
- ✅ AsyncStorage persistence with `@design_the_what:` prefix
- ✅ Project data structure exists with mock projects

---

## INTEGRATION WITH EXISTING CODE

**Current Codebase:** (from CLAUDE.md - VERIFIED)

✅ **Established Components:**
- `COINCard` and `COINListItem` - Display COINs in grid/list views
- `COINContext` - Manages shared COIN data, favorites, sort preferences
- `FloatingActionButton` - Already used on all tabs
- All three tab screens have "+" buttons in headers

✅ **Established Patterns:**
- AsyncStorage persistence with `@design_the_what:` prefix
- COINContext for shared state (instant updates across tabs)
- Haptic feedback for interactive elements
- TypeScript interfaces in `src/types/index.ts`
- Mock data in `src/utils/mockData.ts`

**This UC Must:**
- ✅ Integrate "+" header button handlers on all three tabs
- ✅ Create new COINs that immediately appear in Recents tab
- ✅ Use COINContext to add new COINs to shared state
- ✅ Persist COINs to AsyncStorage
- ✅ Assign COINs to projects (use Project interface)
- ✅ Navigate to canvas screen after creation
- ✅ Use existing Project data from mock data
- ✅ Follow established navigation patterns

**DO NOT:**
- ❌ Modify COINContext.tsx unless adding new COIN creation function
- ❌ Break existing tab functionality
- ❌ Change established data models without explicit need
- ❌ Create duplicate components that already exist

---

## What You're Building

### Three New Screens

1. **Canvas Screen** (`src/screens/COINEditorScreen.tsx`)
   - Entry point for both UC-100 (create new) and UC-101 (edit existing)
   - Displays empty canvas with single process circle for new COINs
   - Canvas header with project picker and COIN name field
   - Canvas toolbar with Save/Cancel buttons
   - Full-screen canvas area (placeholder for future diagram work)
   - Supports both portrait and landscape orientations

2. **Project Picker Modal** (`src/modals/ProjectPickerModal.tsx`)
   - Bottom sheet modal showing all available projects
   - Lists projects with name and COIN count
   - Shows currently selected project with checkmark
   - "Create New Project" option at bottom
   - Tappable rows to select project
   - Dismisses on selection

3. **Create Project Modal** (`src/modals/CreateProjectModal.tsx`)
   - Inline project creation during COIN creation
   - Simple modal with name field only
   - Creates project with sensible defaults
   - Returns to Project Picker after creation
   - New project automatically selected

### Updated Files

1. **Navigation** (`App.tsx`)
   - Add COINEditorScreen to navigation stack
   - Configure header for canvas screen
   - Enable modal presentation for editor

2. **Context** (`src/contexts/COINContext.tsx`)
   - Add `createCOIN(name: string, projectId: string)` function
   - Add `updateCOIN(coin: COIN)` function
   - Add `createProject(name: string)` function
   - Persist COINs and Projects to AsyncStorage

3. **Tab Screens** (RecentsScreen, FavoritesScreen, ProjectsScreen)
   - Connect "+" header buttons to navigation
   - Pass `navigation.navigate('COINEditor', { mode: 'create' })`

4. **Types** (`src/types/index.ts`)
   - Ensure Project interface exists (should already)
   - Add navigation params types for COINEditor

---

## Data Model Requirements

### COIN Interface (Already Exists in src/types/index.ts)

```typescript
interface COIN {
  id: string;                    // UUID v4
  name: string;                  // Display name (1-100 chars)
  description?: string;          // Optional description
  projectId: string;             // REQUIRED - Must reference valid Project.id
  projectName?: string;          // Denormalized for display
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  lastAccessedAt?: string;      // ISO 8601
  thumbnailUrl?: string;        // Future: Canvas snapshot
  isFavorite?: boolean;         // From UC-202

  // Canvas data (minimal for Phase 1)
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}
```

### Project Interface (Should Already Exist from UC-201)

```typescript
interface Project {
  id: string;                    // UUID v4
  name: string;                  // Display name
  description?: string;
  status: 'active' | 'archived';
  colorTag?: string;             // Hex color
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  coinCount: number;            // Computed field
}
```

### New Type: COINEditorNavigationParams

```typescript
// Add to src/types/index.ts
export type COINEditorParams = {
  mode: 'create' | 'edit';
  coinId?: string;              // Required when mode='edit'
};
```

---

## Step-by-Step Implementation

### Phase 1: Navigation Setup

**File:** `App.tsx`

1. Import COINEditorScreen (will create in Phase 2)
2. Add to navigation stack after main tabs:
   ```typescript
   <Stack.Screen 
     name="COINEditor"
     component={COINEditorScreen}
     options={{
       presentation: 'fullScreenModal',
       headerShown: false,  // Canvas has its own header
       gestureEnabled: false,  // Prevent swipe-to-dismiss (UC requirement)
     }}
   />
   ```

**Files:** `RecentsScreen.tsx`, `FavoritesScreen.tsx`, `ProjectsScreen.tsx`

3. Connect "+" header button handlers:
   ```typescript
   // In each screen's header configuration
   headerRight: () => (
     <Pressable
       onPress={() => navigation.navigate('COINEditor', { mode: 'create' })}
       style={styles.headerButton}
     >
       <Ionicons name="add" size={28} color="#007AFF" />
     </Pressable>
   ),
   ```

---

### Phase 2: Canvas Screen (Entry Point)

**File:** `src/screens/COINEditorScreen.tsx`

**Purpose:** Main canvas screen for both creating and editing COINs

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ [Canvas Header]                         │  ← Custom header component
│  [Project] [Process Name___________]    │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│       [Empty Canvas with Circle]        │  ← SafeAreaView with white background
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [Canvas Toolbar]                        │  ← Save/Cancel buttons
│  [Cancel]                     [Save]    │
└─────────────────────────────────────────┘
```

**Implementation Steps:**

1. **Screen Setup**
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { View, StyleSheet, Platform, Dimensions } from 'react-native';
   import { SafeAreaView } from 'react-native-safe-area-context';
   import { useCOINs } from '../contexts/COINContext';
   import type { COINEditorParams } from '../types';
   
   interface Props {
     route: { params: COINEditorParams };
     navigation: any;
   }
   
   export default function COINEditorScreen({ route, navigation }: Props) {
     const { mode, coinId } = route.params;
     const { coins, projects, createCOIN, updateCOIN } = useCOINs();
     
     // Screen state
     const [coinName, setCoinName] = useState('');
     const [selectedProjectId, setSelectedProjectId] = useState('');
     const [showProjectPicker, setShowProjectPicker] = useState(false);
     const [showCreateProject, setShowCreateProject] = useState(false);
     const [validationError, setValidationError] = useState('');
     const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
     
     // Implementation continues...
   }
   ```

2. **Initial Data Loading**
   - For `mode === 'create'`: Start with empty COIN, select most recently used project
   - For `mode === 'edit'`: Load existing COIN data by coinId
   - Store "most recently used project" in AsyncStorage: `@design_the_what:last_project_id`

   ```typescript
   useEffect(() => {
     if (mode === 'create') {
       // Load most recently used project
       loadLastUsedProject();
     } else {
       // Load existing COIN
       const coin = coins.find(c => c.id === coinId);
       if (coin) {
         setCoinName(coin.name);
         setSelectedProjectId(coin.projectId);
       }
     }
   }, []);
   
   const loadLastUsedProject = async () => {
     try {
       const lastProjectId = await AsyncStorage.getItem('@design_the_what:last_project_id');
       if (lastProjectId && projects.find(p => p.id === lastProjectId)) {
         setSelectedProjectId(lastProjectId);
       } else if (projects.length > 0) {
         // Default to "My COINs" project or first project
         const myCoinsProject = projects.find(p => p.name === 'My COINs');
         setSelectedProjectId(myCoinsProject?.id || projects[0].id);
       }
     } catch (error) {
       console.log('Error loading last project:', error);
     }
   };
   ```

3. **Canvas Header Component**
   - Create `src/components/COINEditorHeader.tsx`
   - Shows Project name (tappable to open picker)
   - Shows COIN name TextInput (placeholder: "Process Name")
   - Show validation error inline below name field if present
   
   ```typescript
   // COINEditorHeader.tsx
   interface Props {
     projectName: string;
     coinName: string;
     validationError: string;
     onProjectPress: () => void;
     onNameChange: (text: string) => void;
   }
   
   export default function COINEditorHeader({
     projectName,
     coinName,
     validationError,
     onProjectPress,
     onNameChange,
   }: Props) {
     return (
       <View style={styles.header}>
         <Pressable onPress={onProjectPress} style={styles.projectButton}>
           <Text style={styles.projectLabel}>Project:</Text>
           <Text style={styles.projectName}>{projectName}</Text>
           <Ionicons name="chevron-down" size={20} color="#007AFF" />
         </Pressable>
         
         <TextInput
           value={coinName}
           onChangeText={onNameChange}
           placeholder="Process Name"
           style={styles.nameInput}
           maxLength={100}
           autoFocus={false}  // Don't auto-focus to avoid keyboard on open
         />
         
         {validationError ? (
           <Text style={styles.error}>{validationError}</Text>
         ) : null}
       </View>
     );
   }
   ```

4. **Canvas Area (Placeholder)**
   - For Phase 1: Show empty white area with centered "COIN Canvas" text
   - Show single process circle in center (using SVG or View)
   - Add comment: `// Future: Full canvas with participants and interactions`
   
   ```typescript
   <View style={styles.canvasArea}>
     <View style={styles.emptyCanvas}>
       {/* Placeholder process circle */}
       <View style={styles.processCircle}>
         <Text style={styles.processCircleText}>Process Circle</Text>
       </View>
       <Text style={styles.canvasPlaceholder}>
         Canvas implementation coming in future UC
       </Text>
     </View>
   </View>
   ```

5. **Canvas Toolbar Component**
   - Create `src/components/COINEditorToolbar.tsx`
   - Cancel button (left side) - Shows confirmation if unsaved changes
   - Save button (right side) - Primary action button style
   - Both use haptic feedback on press
   
   ```typescript
   interface Props {
     onCancel: () => void;
     onSave: () => void;
     isSaving: boolean;
   }
   
   export default function COINEditorToolbar({ onCancel, onSave, isSaving }: Props) {
     return (
       <View style={styles.toolbar}>
         <Pressable onPress={onCancel} style={styles.cancelButton}>
           <Text style={styles.cancelText}>Cancel</Text>
         </Pressable>
         
         <Pressable 
           onPress={onSave} 
           style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
           disabled={isSaving}
         >
           <Text style={styles.saveText}>
             {isSaving ? 'Saving...' : 'Save'}
           </Text>
         </Pressable>
       </View>
     );
   }
   ```

6. **Save Logic**
   ```typescript
   const handleSave = async () => {
     // Clear previous errors
     setValidationError('');
     
     // Validate name
     if (!coinName.trim()) {
       setValidationError('Please enter a name for this COIN');
       return;
     }
     
     // Validate project
     if (!selectedProjectId) {
       setValidationError('Please select a project');
       return;
     }
     
     // Check for duplicate name within project
     const duplicateExists = coins.some(
       c => c.projectId === selectedProjectId && 
            c.name.toLowerCase() === coinName.trim().toLowerCase() &&
            c.id !== coinId  // Exclude current COIN when editing
     );
     
     if (duplicateExists) {
       const project = projects.find(p => p.id === selectedProjectId);
       setValidationError(
         `A COIN with this name already exists in ${project?.name}. Please choose a unique name.`
       );
       return;
     }
     
     // Haptic feedback
     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     
     try {
       if (mode === 'create') {
         // Create new COIN
         await createCOIN(coinName.trim(), selectedProjectId);
         
         // Save as last used project
         await AsyncStorage.setItem('@design_the_what:last_project_id', selectedProjectId);
         
         // Navigate back
         navigation.goBack();
       } else {
         // Update existing COIN
         const updatedCoin = {
           ...coins.find(c => c.id === coinId)!,
           name: coinName.trim(),
           projectId: selectedProjectId,
           updatedAt: new Date().toISOString(),
         };
         await updateCOIN(updatedCoin);
         navigation.goBack();
       }
     } catch (error) {
       setValidationError('Error saving COIN. Please try again.');
       console.error('Save error:', error);
     }
   };
   ```

7. **Cancel Logic**
   ```typescript
   const handleCancel = async () => {
     // Check if there are unsaved changes
     if (mode === 'create' && (coinName.trim() || hasUnsavedChanges)) {
       // Show confirmation alert
       Alert.alert(
         'Discard New COIN?',
         'This COIN has not been saved and will be lost.',
         [
           {
             text: 'Cancel',
             style: 'cancel',
           },
           {
             text: 'Save',
             onPress: handleSave,
           },
           {
             text: 'Discard',
             style: 'destructive',
             onPress: () => {
               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
               navigation.goBack();
             },
           },
         ]
       );
     } else {
       navigation.goBack();
     }
   };
   ```

---

### Phase 3: Project Picker Modal

**File:** `src/modals/ProjectPickerModal.tsx`

**Purpose:** Bottom sheet showing all projects for selection

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│  Select Project                         │  ← Header
│                                         │
│  ✓ Project A          (3 COINs)        │  ← Selected project
│    Project B          (5 COINs)        │
│    My COINs           (12 COINs)       │
│                                         │
│  ─────────────────────────────────      │
│  + Create New Project                   │  ← Bottom action
│                                         │
└─────────────────────────────────────────┘
```

**Implementation:**

```typescript
import React from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Project } from '../types';

interface Props {
  visible: boolean;
  projects: Project[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export default function ProjectPickerModal({
  visible,
  projects,
  selectedProjectId,
  onSelect,
  onCreateNew,
  onClose,
}: Props) {
  const handleSelect = (projectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(projectId);
    onClose();
  };

  const handleCreateNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCreateNew();
  };

  // Sort: Active projects alphabetically, then "My COINs" always first if it exists
  const sortedProjects = [...projects]
    .filter(p => p.status === 'active')
    .sort((a, b) => {
      if (a.name === 'My COINs') return -1;
      if (b.name === 'My COINs') return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Project</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#007AFF" />
          </Pressable>
        </View>

        <FlatList
          data={sortedProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item.id)}
              style={styles.projectRow}
            >
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectCoinCount}>
                  ({item.coinCount} COIN{item.coinCount !== 1 ? 's' : ''})
                </Text>
              </View>
              {item.id === selectedProjectId && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </Pressable>
          )}
          ListFooterComponent={() => (
            <>
              <View style={styles.divider} />
              <Pressable onPress={handleCreateNew} style={styles.createNewButton}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.createNewText}>Create New Project</Text>
              </Pressable>
            </>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    minHeight: 60,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
  },
  projectCoinCount: {
    fontSize: 13,
    color: '#666666',
  },
  divider: {
    height: 8,
    backgroundColor: '#F2F2F7',
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 60,
  },
  createNewText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#007AFF',
    marginLeft: 12,
  },
});
```

---

### Phase 4: Create Project Modal

**File:** `src/modals/CreateProjectModal.tsx`

**Purpose:** Simple inline project creation (name only)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Create New Project                     │  ← Header with Cancel/Create buttons
│                                         │
│  Project Name                           │
│  [_____________________________]        │  ← Name input
│                                         │
│  (validation error here if any)         │
│                                         │
└─────────────────────────────────────────┘
```

**Implementation:**

```typescript
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  existingProjects: string[];  // Array of existing project names
  onCreateProject: (name: string) => void;
  onCancel: () => void;
}

export default function CreateProjectModal({
  visible,
  existingProjects,
  onCreateProject,
  onCancel,
}: Props) {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    // Validate
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    // Check for duplicate (case-insensitive)
    const duplicate = existingProjects.some(
      name => name.toLowerCase() === projectName.trim().toLowerCase()
    );

    if (duplicate) {
      setError('A project with this name already exists');
      return;
    }

    // Create
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreateProject(projectName.trim());
    setProjectName('');
    setError('');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProjectName('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Create New Project</Text>
            <Pressable onPress={handleCreate} style={styles.createButton}>
              <Text style={styles.createText}>Create</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              value={projectName}
              onChangeText={(text) => {
                setProjectName(text);
                setError('');  // Clear error on change
              }}
              placeholder="Enter project name"
              style={styles.input}
              maxLength={100}
              autoFocus={true}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    width: 60,
    height: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  createButton: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  createText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  error: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
  },
});
```

---

### Phase 5: Context Updates

**File:** `src/contexts/COINContext.tsx`

**Add Functions:**

```typescript
// Add to COINContext

const createCOIN = async (name: string, projectId: string): Promise<void> => {
  const newCOIN: COIN = {
    id: generateUUID(),
    name,
    description: '',
    projectId,
    projectName: projects.find(p => p.id === projectId)?.name,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
    isFavorite: false,
    
    // Empty canvas data
    circles: [{
      id: generateUUID(),
      centerX: 400,  // Center of standard canvas
      centerY: 300,
      radius: 200,
      label: '',
    }],
    participants: [],
    interactions: [],
  };

  // Add to state
  const updatedCoins = [...coins, newCOIN];
  setCoins(updatedCoins);

  // Persist to AsyncStorage
  try {
    await AsyncStorage.setItem(
      '@design_the_what:coins',
      JSON.stringify(updatedCoins)
    );
    
    // Update project coin count
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedProject = {
        ...project,
        coinCount: project.coinCount + 1,
        updatedAt: new Date().toISOString(),
      };
      const updatedProjects = projects.map(p =>
        p.id === projectId ? updatedProject : p
      );
      setProjects(updatedProjects);
      await AsyncStorage.setItem(
        '@design_the_what:projects',
        JSON.stringify(updatedProjects)
      );
    }
  } catch (error) {
    console.error('Error creating COIN:', error);
    throw error;
  }
};

const updateCOIN = async (updatedCoin: COIN): Promise<void> => {
  const updatedCoins = coins.map(c => c.id === updatedCoin.id ? updatedCoin : c);
  setCoins(updatedCoins);

  try {
    await AsyncStorage.setItem(
      '@design_the_what:coins',
      JSON.stringify(updatedCoins)
    );
  } catch (error) {
    console.error('Error updating COIN:', error);
    throw error;
  }
};

const createProject = async (name: string): Promise<string> => {
  const newProject: Project = {
    id: generateUUID(),
    name,
    description: '',
    status: 'active',
    colorTag: '#007AFF',  // Default blue
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coinCount: 0,
  };

  const updatedProjects = [...projects, newProject];
  setProjects(updatedProjects);

  try {
    await AsyncStorage.setItem(
      '@design_the_what:projects',
      JSON.stringify(updatedProjects)
    );
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return newProject.id;
};

// Add to context value
return (
  <COINContext.Provider
    value={{
      coins,
      projects,
      favorites,
      sortOption,
      projectSortOption,
      setSortOption,
      setProjectSortOption,
      toggleFavorite,
      createCOIN,      // ← NEW
      updateCOIN,      // ← NEW
      createProject,   // ← NEW
    }}
  >
    {children}
  </COINContext.Provider>
);
```

---

## Styling Guidelines

### Colors
- Primary blue: `#007AFF` (buttons, links, selected states)
- Success green: `#34C759` (save button)
- Destructive red: `#FF3B30` (delete, discard)
- Background: `#F2F2F7` (iOS light gray)
- Card background: `#FFFFFF`
- Text primary: `#000000`
- Text secondary: `#666666`
- Error red: `#FF3B30`
- Border: `#E5E5EA`

### Typography
- Header title: 17pt, semibold
- Body text: 17pt, regular
- Button text: 17pt, semibold (actions)
- Caption: 13pt, regular
- Input placeholder: 17pt, regular, #999999

### Spacing
- Padding: 16px standard
- Between elements: 8-16px
- Section spacing: 24px
- Touch targets: 44x44px minimum

### Canvas Header
- Height: ~120px (flexible)
- Background: #FFFFFF
- Border bottom: 1px #E5E5EA
- Project button: Full-width, left-aligned, chevron right
- Name input: Full-width, bordered, placeholder text

### Canvas Area
- Background: #FFFFFF
- Process circle: 400px diameter, centered
- Gray stroke, white fill
- Label: "Process Circle" centered

### Canvas Toolbar
- Height: 60px
- Background: #FFFFFF
- Border top: 1px #E5E5EA
- Cancel: Left, gray text
- Save: Right, blue background button

---

## Testing Checklist

### Basic Functionality
- [ ] "+" button on Recents tab opens canvas
- [ ] "+" button on Favorites tab opens canvas
- [ ] "+" button on Projects tab opens canvas
- [ ] Canvas displays with empty diagram
- [ ] Project picker shows all active projects
- [ ] Most recently used project is selected by default
- [ ] Can select different project from picker
- [ ] Can create new project inline
- [ ] Project name validates (no empty, no duplicates)
- [ ] COIN name validates (no empty, no duplicates within project)
- [ ] Save creates new COIN in selected project
- [ ] New COIN appears immediately in Recents tab
- [ ] Cancel without name shows discard confirmation
- [ ] Cancel with name shows 3-option alert (Discard/Save/Cancel)
- [ ] Discard removes unsaved COIN
- [ ] Save from alert validates and saves

### Data Persistence
- [ ] New COIN persisted to AsyncStorage
- [ ] Last used project saved to AsyncStorage
- [ ] Project coin count updates correctly
- [ ] Created COIN has correct timestamps
- [ ] Created COIN has empty canvas data (1 circle, 0 participants, 0 interactions)

### Validation
- [ ] Empty name shows inline error
- [ ] Duplicate name shows inline error with project name
- [ ] Same name in different projects is allowed
- [ ] Empty project name shows error in create project modal
- [ ] Duplicate project name shows error
- [ ] Error clears when user types

### Navigation
- [ ] Canvas opens as full-screen modal
- [ ] Cannot swipe to dismiss canvas (gestureEnabled: false)
- [ ] Must use Cancel or Save to dismiss
- [ ] Navigation returns to originating tab
- [ ] Project picker opens as bottom sheet
- [ ] Create project opens as form sheet

### Orientation Support
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] Layout adjusts appropriately
- [ ] No clipping or overflow

### Haptic Feedback
- [ ] Light haptic on project selection
- [ ] Medium haptic on COIN save
- [ ] Light haptic on cancel/discard
- [ ] Light haptic on project creation

### Integration
- [ ] UC-200 (Recents) still works
- [ ] UC-201 (Projects) still works
- [ ] UC-202 (Favorites) still works
- [ ] New COIN appears in correct project in Projects tab
- [ ] Project detail screen shows new COIN
- [ ] Context state updates instantly across tabs

---

## Implementation Notes

### UUID Generation
```typescript
// Use expo-crypto or uuid library
import * as Crypto from 'expo-crypto';

const generateUUID = (): string => {
  return Crypto.randomUUID();
};
```

### AsyncStorage Keys Used
- `@design_the_what:coins` - Array of all COINs
- `@design_the_what:projects` - Array of all projects
- `@design_the_what:last_project_id` - Most recently used project ID

### Default "My COINs" Project
- Should already exist in mock data from UC-201
- If not, create on first app launch in COINContext initialization
- Always appears first in project picker list

### Canvas Data Structure
- Single process circle in center (400x300 on standard 800x600 canvas)
- Empty participants array (future UC will add participants)
- Empty interactions array (future UC will add interactions)
- Prepare for future: Canvas will be scrollable/pannable/zoomable

### Error Handling
- All AsyncStorage operations in try/catch
- Show user-friendly error messages
- Log errors to console for debugging
- Don't crash on errors, gracefully degrade

---

## Success Criteria

This implementation is complete when:

1. ✅ All three tabs have working "+" buttons that open canvas
2. ✅ Canvas screen displays with header, canvas area, and toolbar
3. ✅ Project picker shows all projects and allows selection
4. ✅ Create project modal allows inline project creation
5. ✅ Validation works for both COIN names and project names
6. ✅ Save creates COIN and adds to correct project
7. ✅ New COIN immediately appears in Recents tab
8. ✅ Cancel confirmation works correctly
9. ✅ Most recently used project is remembered
10. ✅ All tests pass in both portrait and landscape
11. ✅ No regression in UC-200, UC-201, UC-202
12. ✅ Chuck says "Perfect, approved!"

---

## Files Summary

**New Files to Create:**
1. `src/screens/COINEditorScreen.tsx` - Main canvas screen
2. `src/components/COINEditorHeader.tsx` - Canvas header with project/name
3. `src/components/COINEditorToolbar.tsx` - Canvas toolbar with save/cancel
4. `src/modals/ProjectPickerModal.tsx` - Project selection bottom sheet
5. `src/modals/CreateProjectModal.tsx` - Inline project creation

**Files to Modify:**
1. `App.tsx` - Add COINEditor to navigation stack
2. `src/contexts/COINContext.tsx` - Add createCOIN, updateCOIN, createProject
3. `src/screens/RecentsScreen.tsx` - Connect "+" button handler
4. `src/screens/FavoritesScreen.tsx` - Connect "+" button handler
5. `src/screens/ProjectsScreen.tsx` - Connect "+" button handler
6. `src/types/index.ts` - Add COINEditorParams type

**Total:** 5 new files, 6 modified files

---

## AFTER IMPLEMENTATION: Session Close-Out

Once all code is working and tested, follow these steps in order:

### Step 1: Generate Session Summary

Create a comprehensive session summary document following this template:

**File:** `sessions/UC-100-Session-Summary.md`

```markdown
# Session Implementation Summary: UC-100 (Create New COIN)

**Date:** [Today's date]
**Duration:** [Implementation time]
**Status:** ✅ Complete

---

## 1. Files Created

**New Screens:**
- `src/screens/COINEditorScreen.tsx` - Main canvas screen for creating/editing COINs

**New Components:**
- `src/components/COINEditorHeader.tsx` - Canvas header with project picker and name field
- `src/components/COINEditorToolbar.tsx` - Canvas toolbar with Save/Cancel buttons

**New Modals:**
- `src/modals/ProjectPickerModal.tsx` - Project selection bottom sheet
- `src/modals/CreateProjectModal.tsx` - Inline project creation modal

**Total:** 5 new files created

---

## 2. Files Modified

**Navigation:**
- `App.tsx` - Added COINEditor screen to navigation stack

**Context:**
- `src/contexts/COINContext.tsx` - Added createCOIN, updateCOIN, createProject functions

**Screens:**
- `src/screens/RecentsScreen.tsx` - Connected "+" header button
- `src/screens/FavoritesScreen.tsx` - Connected "+" header button
- `src/screens/ProjectsScreen.tsx` - Connected "+" header button

**Types:**
- `src/types/index.ts` - Added COINEditorParams navigation type

**Total:** 6 files modified

---

## 3. Core Features Built

### COIN Creation Flow
- Tap "+" button on any tab → Opens canvas screen
- Canvas displays with empty diagram (single process circle)
- Header shows project picker and name input field
- Toolbar provides Save/Cancel actions
- Most recently used project selected by default
- Project selection persisted across sessions

### Project Management
- Project picker modal shows all active projects
- Inline project creation without leaving COIN creation flow
- Project name validation (no empty, no duplicates)
- New projects automatically selected after creation
- "My COINs" project always appears first in list

### Validation
- COIN name required (1-100 characters)
- Duplicate names within same project prevented
- Same name allowed in different projects
- Inline error messages below name field
- Errors clear when user types

### Save/Cancel Logic
- Save validates and creates COIN in selected project
- New COIN appears immediately in Recents tab
- Last used project saved to AsyncStorage
- Cancel shows confirmation if unsaved changes
- 3-option alert: Discard/Save/Cancel

### Data Persistence
- COINs persisted to AsyncStorage
- Projects persisted to AsyncStorage
- Last project ID saved separately
- Project coin counts auto-update
- All timestamps set correctly

---

## 4. Enhancements Beyond Original Specification

[List any intelligent additions you made beyond the spec]

Example:
- Added haptic feedback on all interactive elements
- Improved error messages with project names
- Optimized project list sorting (My COINs first)
- Added loading states during save operations

---

## 5. Integration Points Verified

✅ **UC-200 (Recents Tab):**
- "+" button opens canvas
- New COINs appear immediately after save
- No regression in existing functionality

✅ **UC-201 (Projects Tab):**
- "+" button opens canvas
- New COINs appear in correct project
- Project coin counts update correctly

✅ **UC-202 (Favorites Tab):**
- "+" button opens canvas
- New COINs can be favorited after creation
- No regression in existing functionality

✅ **Context State Management:**
- createCOIN function adds to shared state
- Updates propagate instantly to all tabs
- AsyncStorage persistence works correctly

---

## 6. Testing Results

### Orientation Testing
- ✅ Portrait orientation works correctly
- ✅ Landscape orientation works correctly
- ✅ No layout issues when rotating

### Navigation Testing
- ✅ Canvas opens from all three tabs
- ✅ Full-screen modal presentation works
- ✅ Cannot swipe to dismiss (gestureEnabled: false)
- ✅ Returns to originating tab after save/cancel

### Validation Testing
- ✅ Empty name shows error
- ✅ Duplicate name within project shows error
- ✅ Same name in different projects allowed
- ✅ Empty project name shows error
- ✅ Duplicate project name shows error

### Data Persistence Testing
- ✅ COINs saved to AsyncStorage
- ✅ Projects saved to AsyncStorage
- ✅ Last project ID persisted
- ✅ Data survives app restart

### Integration Testing
- ✅ UC-200, UC-201, UC-202 still work
- ✅ No regressions detected
- ✅ Context updates work across tabs

---

## 7. Current State of Application

**Implemented Use Cases:**
- ✅ UC-200: View Recent COINs (Recents Tab)
- ✅ UC-201: View Projects (Projects Tab)
- ✅ UC-202: View Favorites (Favorites Tab)
- ✅ UC-100: Create New COIN (Canvas Entry Point)

**Navigation Structure:**
- Tab Bar with 3 tabs (Recents, Projects, Favorites)
- Full-screen modal for COIN Editor
- Bottom sheet for Project Picker
- Form sheet for Create Project

**Data Management:**
- COINContext manages all shared state
- AsyncStorage for persistence
- Instant updates across all tabs

**Ready for Next UC:**
- UC-101 (Edit COIN) - Canvas already built, just needs edit mode
- UC-110+ (Canvas Interactions) - Add participants, interactions, etc.

---

## 8. Key Design Decisions

**Canvas as Placeholder:**
- Implemented single process circle placeholder
- Ready for future UC to add full canvas functionality
- Layout and navigation structure complete

**Project Selection UX:**
- Most recently used project as default
- "My COINs" always appears first
- Inline project creation for seamless workflow

**Validation Strategy:**
- Inline errors below fields
- Errors clear on typing
- No disruptive alerts for validation

**Modal Presentations:**
- Full-screen for canvas (primary workspace)
- Bottom sheet for project picker (quick selection)
- Form sheet for create project (focused task)

---

## 9. Known Limitations / Future Work

**Canvas Functionality:**
- Current implementation is placeholder
- Future UC will add:
  - Participant management
  - Interaction drawing
  - Pan/zoom controls
  - Canvas persistence

**Edit Mode:**
- UC-100 creates the canvas screen
- UC-101 will add edit mode functionality
- Navigation parameters already support mode: 'edit'

---

## 10. Files to Update Next

**CLAUDE.md Updates Needed:**
- Add UC-100 to "Implemented Use Cases" section
- Update "Current UC Being Implemented" to next UC
- Document new patterns established
- Add new files to project structure

**Use Case Registry Updates Needed (Chuck does this):**
- Change UC-100 status: 📝 Planned → ✔️ Implemented
- Add implementation date: [today's date]
- Add link: sessions/UC-100-Session-Summary.md

---

**END OF SESSION SUMMARY**
```

**Save this file, then proceed to Step 2.**

---

### Step 2: Update CLAUDE.md

Update the persistent context file to document UC-100 patterns.

**File:** `CLAUDE.md`

**Changes to make:**

1. **Update header:**
```markdown
**Last Updated:** [Today's date] after UC-100 implementation
**Current Branch:** main (UC-100 complete)
```

2. **Add to "Implemented Use Cases" section:**

```markdown
### UC-100: Create New COIN (Canvas Entry Point) ✔️ COMPLETE

**Status:** Implemented and Accepted
**Date:** [Today's date]
**Session Summary:** `sessions/UC-100-Session-Summary.md`

**Files Created:**
- 1 screen (`COINEditorScreen`)
- 2 components (`COINEditorHeader`, `COINEditorToolbar`)
- 2 modals (`ProjectPickerModal`, `CreateProjectModal`)

**Files Modified:**
- Navigation (`App.tsx` - added COINEditor screen)
- Context (`COINContext.tsx` - added createCOIN, updateCOIN, createProject)
- All three tab screens (connected "+" buttons)
- Types (`types/index.ts` - added COINEditorParams)

**Patterns Established:**

1. **Canvas Entry Point Pattern**
   - Single screen for both create and edit modes
   - Mode determined by navigation params: `{ mode: 'create' | 'edit', coinId?: string }`
   - Canvas has custom header (not navigation header)
   - Full-screen modal presentation
   - Cannot swipe to dismiss (gestureEnabled: false)
   - **REUSE THIS** for other full-screen editing screens

2. **Project Picker Pattern**
   - Bottom sheet modal for selection
   - Shows coin counts in list
   - Selected item shows checkmark
   - "Create New" action at bottom
   - **REUSE THIS** for other entity pickers

3. **Inline Creation Pattern**
   - Create related entities without leaving flow
   - Form sheet presentation for focused creation
   - Automatically selects new entity after creation
   - **FOLLOW THIS PATTERN** for other inline creation needs

4. **Most Recently Used Persistence**
   - Save user's last selection to AsyncStorage
   - Use as default for next creation
   - Key pattern: `@design_the_what:last_[entity]_id`
   - **FOLLOW THIS PATTERN** for other user preferences

5. **Context CRUD Pattern**
   - createCOIN, updateCOIN, createProject functions in context
   - Update in-memory state first (instant UI)
   - Persist to AsyncStorage in background
   - Update related entities (project coin count)
   - **FOLLOW THIS PATTERN** for all entity management

6. **Validation Error Display Pattern**
   - Inline errors below input fields
   - Errors clear when user types
   - Context-aware error messages (include entity names)
   - No disruptive alerts for validation
   - **FOLLOW THIS PATTERN** for form validation

**Integration Points for Future UCs:**

✅ **UC-101 (Edit COIN) can reuse:**
- COINEditorScreen (mode: 'edit' already supported)
- Same header, toolbar, validation logic
- Just needs to load existing COIN data

✅ **UC-110+ (Canvas Features) integration ready:**
- Canvas placeholder in COINEditorScreen
- Canvas area ready for participant/interaction components
- Data models support full canvas structure

**Critical Constraints (DO NOT BREAK):**

⚠️ **Canvas screen specifications:**
- MUST be full-screen modal (presentation: 'fullScreenModal')
- MUST have gestureEnabled: false (UC requirement)
- MUST use custom header (headerShown: false)
- Canvas header must show project + name
- Toolbar must have Cancel (left) and Save (right)

⚠️ **COIN creation rules:**
- MUST validate name (no empty, no duplicates within project)
- MUST assign to project (projectId required)
- MUST create with single process circle
- MUST update project coin count
- MUST save last used project

⚠️ **Project creation rules:**
- MUST validate name (no empty, no duplicates globally)
- MUST auto-select after creation
- MUST return to project picker after creation

**Dependencies Added:**
```json
{
  "expo-crypto": "~13.0.0"  // For UUID generation (if not already present)
}
```

---
```

3. **Update "Current UC Being Implemented" section:**
```markdown
### Next UC: UC-101 or Canvas Features

**Possible next UCs:**
- **UC-101**: Edit COIN - Reuse UC-100 canvas, add edit mode logic
- **UC-110**: Add Participants - Extend canvas with participant management
- **UC-115**: Add Interactions - Extend canvas with interaction drawing

All three core tabs are complete, UC-100 provides canvas entry point. Next focus is canvas content management or COIN editing.
```

4. **Update "Project Structure" section:**
Add new files:
```markdown
│   ├── modals/                  # Modal dialogs
│   │   ├── ProjectPickerModal.tsx    # [UC-100] Project selection
│   │   └── CreateProjectModal.tsx     # [UC-100] Inline project creation
```

**Save CLAUDE.md changes, then proceed to Step 3.**

---

### Step 3: Git Commit

Commit all changes with detailed message following established pattern.

```bash
cd ~/Projects/coin-app

# Stage all changes
git add .

# Verify what's being committed
git status

# Commit with comprehensive message
git commit -m "feat: UC-100 Create New COIN - Complete with enhancements

Implemented UC-100 with canvas entry point, project management, and validation.

Core Features:
- Canvas screen with header, canvas area, and toolbar
- Project picker modal with inline project creation
- COIN name and project validation
- Save/Cancel logic with unsaved changes confirmation
- Most recently used project persistence

Enhancements Beyond Spec:
- Haptic feedback on all interactive elements
- Context-aware error messages with entity names
- Optimized project list sorting (My COINs first)
- Loading states during save operations

Files Created:
- src/screens/COINEditorScreen.tsx
- src/components/COINEditorHeader.tsx
- src/components/COINEditorToolbar.tsx
- src/modals/ProjectPickerModal.tsx
- src/modals/CreateProjectModal.tsx

Files Modified:
- App.tsx (added COINEditor to navigation)
- src/contexts/COINContext.tsx (added CRUD functions)
- src/screens/RecentsScreen.tsx (connected + button)
- src/screens/FavoritesScreen.tsx (connected + button)
- src/screens/ProjectsScreen.tsx (connected + button)
- src/types/index.ts (added COINEditorParams)

Documentation:
- specifications/UC-100-Specification.md
- sessions/UC-100-Session-Summary.md
- CLAUDE.md (updated with UC-100 patterns)

Integration: Works seamlessly with UC-200, UC-201, UC-202. No regressions.

🤖 Generated with Claude Code"

# Push feature branch to GitHub
git push origin feature/uc-100
```

**After push succeeds, proceed to Step 4.**

---

### Step 4: Merge to Main

**IMPORTANT:** Chuck must verify and approve before merging.

Once Chuck says "UC-100 is approved", execute merge:

```bash
# Switch to main branch
git checkout main

# Merge feature branch
git merge feature/uc-100 --no-edit

# Push to GitHub
git push origin main

# Optional: Delete feature branch locally (ask Chuck first)
# git branch -D feature/uc-100

# Optional: Delete feature branch remotely (ask Chuck first)  
# git push origin --delete feature/uc-100
```

**Note:** All documentation (session summary, CLAUDE.md) was committed in Step 3, so this merge includes everything.

---

### Step 5: Notify Chuck

**Tell Chuck:**

```
✅ UC-100 IMPLEMENTATION COMPLETE

Summary:
✅ Specification followed completely
✅ 5 new files created (canvas screen, modals, components)
✅ 6 files modified (navigation, context, tab screens, types)
✅ Session summary saved to sessions/UC-100-Session-Summary.md
✅ CLAUDE.md updated with UC-100 patterns
✅ Code committed to feature/uc-100 branch
✅ Feature branch pushed to GitHub

Testing:
✅ All tests pass in both portrait and landscape
✅ All three tabs' "+" buttons work
✅ COIN creation flow works end-to-end
✅ Validation works correctly
✅ Data persists across app restart
✅ No regressions in UC-200, UC-201, UC-202

Ready for:
1. Chuck to test on iPad simulator
2. Chuck to approve: "UC-100 is approved"
3. Merge to main (commands provided above)

Next UC suggestion: UC-101 (Edit COIN) - Canvas already built, just needs edit mode
```

---

### Step 6: Chuck Updates Registry (Manual)

**Chuck will manually update:**

`process-docs/Use-Case-Registry.md`

Changes:
- UC-100 status: 📝 Planned → ✔️ Implemented  
- Implementation date: [today's date]
- Link: sessions/UC-100-Session-Summary.md

**Chuck will commit:**
```bash
git add process-docs/Use-Case-Registry.md
git commit -m "docs: Update registry for UC-100 completion"
git push
```

---

## Implementation Complete! 🎉

This UC is officially done when:
1. ✅ All code implemented and tested
2. ✅ Session summary created
3. ✅ CLAUDE.md updated
4. ✅ Code committed and pushed
5. ✅ Chuck approves
6. ✅ Merged to main
7. ✅ Registry updated by Chuck

**Total workflow: Specification → Implementation → Testing → Documentation → Commit → Merge → Registry**

Good luck! 🚀
