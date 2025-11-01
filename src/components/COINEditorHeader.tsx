import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface COINEditorHeaderProps {
  projectName: string;
  coinName: string;
  validationError: string;
  onNameChange: (text: string) => void;
}

export default function COINEditorHeader({
  projectName,
  coinName,
  validationError,
  onNameChange,
}: COINEditorHeaderProps) {
  // iOS 26+ always has window controls (small, large, or maximized)
  const isResizableWindow = Platform.OS === 'ios' &&
    parseInt(Platform.Version as string, 10) >= 26;

  const headerStyle = [
    styles.header,
    isResizableWindow && styles.headerResizable,
  ];

  return (
    <View style={headerStyle}>
      <View style={styles.projectDisplay}>
        <Ionicons name="folder" size={20} color="#007AFF" style={styles.folderIcon} />
        <View style={styles.projectTextContainer}>
          <Text style={styles.projectLabel}>Project</Text>
          <Text style={styles.projectName} numberOfLines={1}>
            {projectName}
          </Text>
        </View>
      </View>

      <TextInput
        value={coinName}
        onChangeText={onNameChange}
        placeholder="Process Name"
        style={styles.nameInput}
        maxLength={100}
        autoFocus={false}
      />

      {validationError ? (
        <Text style={styles.error}>{validationError}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerResizable: {
    paddingTop: 44, // Push content down to avoid window control buttons
  },
  projectDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  folderIcon: {
    marginRight: 12,
  },
  projectTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666666',
    marginRight: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 8,
  },
  error: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
  },
});
