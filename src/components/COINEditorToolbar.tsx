import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';

interface COINEditorToolbarProps {
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export default function COINEditorToolbar({
  onSave,
  isSaving,
  hasUnsavedChanges,
}: COINEditorToolbarProps) {
  // iOS 26+ always has window controls (small, large, or maximized)
  const isResizableWindow = Platform.OS === 'ios' &&
    parseInt(Platform.Version as string, 10) >= 26;

  const toolbarStyle = [
    styles.toolbar,
    isResizableWindow && styles.toolbarResizable,
  ];

  const saveButtonDisabled = isSaving || !hasUnsavedChanges;

  return (
    <View style={toolbarStyle}>
      <Pressable
        onPress={onSave}
        style={[styles.saveButton, saveButtonDisabled && styles.saveButtonDisabled]}
        disabled={saveButtonDisabled}
      >
        <Text style={styles.saveText}>
          {isSaving ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    minHeight: 60,
  },
  toolbarResizable: {
    // iOS 26 windowed mode: add right padding to avoid resize handle collision
    paddingRight: 36,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
