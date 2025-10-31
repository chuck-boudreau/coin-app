import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

interface EmptyProjectDetailStateProps {
  projectName: string;
  onAddFromRecents: () => void;
  onCreateNew: () => void;
}

const EmptyProjectDetailState: React.FC<EmptyProjectDetailStateProps> = ({
  projectName,
  onAddFromRecents,
  onCreateNew,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon placeholder - using text emoji for simplicity */}
      <Text style={styles.icon}>⭕</Text>

      {/* Title */}
      <Text style={styles.title}>No COINs in this project yet</Text>

      {/* Description */}
      <Text style={styles.description}>
        Add COINs from your Recents,{'\n'}
        or create a new COIN for{'\n'}
        {projectName}.
      </Text>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={onAddFromRecents}
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Add from Recents</Text>
        </Pressable>

        <Pressable
          onPress={onCreateNew}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Create New COIN</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100, // Account for tab bar
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44, // iOS minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default EmptyProjectDetailState;
