import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCOINs } from '../contexts/COINContext';
import COINEditorHeader from '../components/COINEditorHeader';
import COINEditorToolbar from '../components/COINEditorToolbar';

interface COINEditorScreenProps {
  route: {
    params: {
      mode: 'create' | 'edit';
      coinId?: string;
    };
  };
  navigation: any;
}

export default function COINEditorScreen({ route, navigation }: COINEditorScreenProps) {
  const { mode, coinId, projectId: initialProjectId } = route.params;
  const { coins, projects, createCOIN, updateCOIN } = useCOINs();

  // Screen state
  const [currentMode, setCurrentMode] = useState<'create' | 'edit'>(mode);
  const [currentCoinId, setCurrentCoinId] = useState<string | undefined>(coinId);
  const [currentProjectId, setCurrentProjectId] = useState<string>(initialProjectId || '');
  const [coinName, setCoinName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs to hold latest values for beforeRemove handler
  const coinNameRef = useRef(coinName);
  const currentProjectIdRef = useRef(currentProjectId);
  const currentCoinIdRef = useRef(currentCoinId);
  const currentModeRef = useRef(currentMode);

  // Keep refs in sync with state
  useEffect(() => {
    coinNameRef.current = coinName;
  }, [coinName]);

  useEffect(() => {
    currentProjectIdRef.current = currentProjectId;
  }, [currentProjectId]);

  useEffect(() => {
    currentCoinIdRef.current = currentCoinId;
  }, [currentCoinId]);

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  // Handle back button press with unsaved changes warning
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasUnsavedChanges) {
        // No unsaved changes, allow back navigation
        return;
      }

      // Prevent default back behavior
      e.preventDefault();

      // Show confirmation dialog
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. What would you like to do?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, handleSave]);

  // Load initial data
  useEffect(() => {
    if (mode === 'edit') {
      // Load existing COIN for edit mode
      const coin = coins.find(c => c.id === coinId);
      if (coin) {
        setCoinName(coin.name);
        setCurrentProjectId(coin.projectIds[0] || '');
      }
    }
    // For create mode, projectId is already set from route params
  }, [mode, coinId, coins]);

  // Update navigation title
  useEffect(() => {
    navigation.setOptions({
      title: coinName || (currentMode === 'create' ? 'New COIN' : 'Edit COIN'),
    });
  }, [coinName, currentMode]);

  const handleNameChange = (text: string) => {
    setCoinName(text);
    setValidationError('');
    setHasUnsavedChanges(true);
  };

  const handleSave = useCallback(async () => {
    // Use refs to get latest values
    const latestCoinName = coinNameRef.current;
    const latestProjectId = currentProjectIdRef.current;
    const latestCoinId = currentCoinIdRef.current;
    const latestMode = currentModeRef.current;

    // Clear previous errors
    setValidationError('');

    // Validate name
    if (!latestCoinName.trim()) {
      setValidationError('Please enter a name for this COIN');
      return;
    }

    // Validate project (should always be set, but safety check)
    if (!latestProjectId) {
      setValidationError('Project context missing');
      return;
    }

    // Check for duplicate name within project
    const duplicateExists = coins.some(
      c => c.projectIds[0] === latestProjectId &&
        c.name.toLowerCase() === latestCoinName.trim().toLowerCase() &&
        c.id !== latestCoinId
    );

    if (duplicateExists) {
      const project = projects.find(p => p.id === latestProjectId);
      setValidationError(
        `A COIN with this name already exists in ${project?.name}. Please choose a unique name.`
      );
      return;
    }

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsSaving(true);

    try {
      if (latestMode === 'create') {
        // Create new COIN with context-aware project assignment
        const newCoinId = await createCOIN(latestCoinName.trim(), latestProjectId);

        // Switch to edit mode and stay in editor
        setCurrentMode('edit');
        setCurrentCoinId(newCoinId);
        setHasUnsavedChanges(false);
      } else {
        // Update existing COIN
        const updates = {
          name: latestCoinName.trim(),
          updatedAt: new Date().toISOString(),
        };
        await updateCOIN(latestCoinId!, updates);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      setValidationError('Error saving COIN. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [coins, projects, createCOIN, updateCOIN]);

  // Derive project name from current project ID
  const project = projects.find(p => p.id === currentProjectId);
  const projectName = project?.name || 'Unknown Project';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <COINEditorHeader
        projectName={projectName}
        coinName={coinName}
        validationError={validationError}
        onNameChange={handleNameChange}
      />

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

      <COINEditorToolbar
        onSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  processCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#999999',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  processCircleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#666666',
  },
  canvasPlaceholder: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
  },
});
