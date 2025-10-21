import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { COINRepository } from '../storage/COINRepository';
import { COIN } from '../types/COIN';

interface Props {
  visible: boolean;
  coin: COIN | null;
  onClose: () => void;
  onCOINUpdated: (coin: COIN) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EditCOINModal({ visible, coin, onClose, onCOINUpdated }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (visible && coin) {
      setName(coin.name);
      setError('');
      setIsSaving(false);
      setHasChanges(false);
      // Auto-focus name field
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible, coin]);

  // Track changes
  useEffect(() => {
    if (coin) {
      setHasChanges(name.trim() !== coin.name);
    }
  }, [name, coin]);

  // Clear error when user types
  useEffect(() => {
    if (name && error) {
      setError('');
    }
  }, [name]);

  const handleSave = async () => {
    if (!coin || isSaving) return;

    try {
      setIsSaving(true);
      setError('');

      const updatedCOIN = await COINRepository.updateCOIN(coin.id, name);

      // Success - notify parent and close
      onCOINUpdated(updatedCOIN);
      setName('');
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Failed to update COIN');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              Keyboard.dismiss();
              setName('');
              setError('');
              setHasChanges(false);
              onClose();
            },
          },
        ]
      );
    } else {
      Keyboard.dismiss();
      setName('');
      setError('');
      onClose();
    }
  };

  if (!coin) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit COIN Details</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                {/* Editable Name Field */}
                <Text style={styles.label}>COIN Name</Text>
                <TextInput
                  ref={inputRef}
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="Enter COIN name"
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Read-only Metadata */}
                <View style={styles.metadataSection}>
                  <Text style={styles.sectionTitle}>Metadata</Text>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Created</Text>
                    <Text style={styles.metadataValue}>{formatDate(coin.createdAt)}</Text>
                  </View>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Created By</Text>
                    <Text style={styles.metadataValue}>{coin.createdBy}</Text>
                  </View>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Last Modified</Text>
                    <Text style={styles.metadataValue}>{formatDate(coin.lastModifiedAt)}</Text>
                  </View>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Modified By</Text>
                    <Text style={styles.metadataValue}>{coin.lastModifiedBy}</Text>
                  </View>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Version</Text>
                    <Text style={styles.metadataValue}>{coin.version}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={isSaving || !hasChanges}
              >
                <Text style={[styles.saveButtonText, (!hasChanges) && styles.disabledButtonText]}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 52,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
  },
  metadataSection: {
    marginTop: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metadataLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  metadataValue: {
    fontSize: 15,
    color: '#000',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});
