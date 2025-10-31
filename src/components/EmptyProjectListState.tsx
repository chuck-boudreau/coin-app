import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

interface EmptyProjectListStateProps {
  onCreateProject: () => void;
}

const EmptyProjectListState: React.FC<EmptyProjectListStateProps> = ({ onCreateProject }) => {
  return (
    <View style={styles.container}>
      {/* Icon placeholder - using text emoji for simplicity */}
      <Text style={styles.icon}>📁</Text>

      {/* Title */}
      <Text style={styles.title}>No Projects Yet</Text>

      {/* Description */}
      <Text style={styles.description}>
        Projects help you organize{'\n'}
        your COINs by client, initiative,{'\n'}
        or any way that makes sense{'\n'}
        for your work.
      </Text>

      {/* CTA Button */}
      <Pressable
        onPress={onCreateProject}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Create Your First Project</Text>
      </Pressable>
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
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44, // iOS minimum touch target
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default EmptyProjectListState;
