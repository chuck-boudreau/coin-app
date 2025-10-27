import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NavigationHeaderProps {
  rightAction?: ReactNode;
}

export function NavigationHeader({ rightAction }: NavigationHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Design The What</Text>
      {rightAction && (
        <View style={styles.rightAction}>
          {rightAction}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5EA',
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.37,
  },
  rightAction: {
    marginBottom: 4,
  },
});
