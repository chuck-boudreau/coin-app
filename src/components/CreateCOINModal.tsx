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
} from 'react-native';
import { COINRepository } from '../storage/COINRepository';
import { COIN } from '../types/COIN';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCOINCreated: (coin: COIN) => void;
}

export default function CreateCOINModal({ visible, onClose, onCOINCreated }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Auto-focus when modal opens
  useEffect(() => {
    if (visible) {
      // Small delay to ensure modal animation completes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      // Reset state
      setName('');
      setError('');
      setIsSaving(false);
    }
  }, [visible]);

  // Clear error when user types
  useEffect(() => {
    if (name && error) {
      setError('');
    }
  }, [name]);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError('');

      const coin = await COINRepository.createCOIN(name);

      // Success - notify parent and close
      onCOINCreated(coin);
      setName('');
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Failed to create COIN');
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    setName('');
    setError('');
    onClose();
  };

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
              <Text style={styles.title}>Create New COIN</Text>
            </View>

            <View style={styles.form}>
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
            </View>

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
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    marginBottom: 32,
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
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
});
