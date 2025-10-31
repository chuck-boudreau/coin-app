import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COINProvider } from './src/contexts/COINContext';
import { RecentsScreen } from './src/screens/RecentsScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const LAST_TAB_KEY = '@design_the_what:last_tab';

type TabRoute = 'Recents' | 'Projects' | 'Favorites';

// Design The What - COIN Diagram App
export default function App() {
  const [initialRoute, setInitialRoute] = useState<TabRoute>('Recents');
  const [isReady, setIsReady] = useState(false);

  // Load last selected tab on mount
  useEffect(() => {
    loadLastTab();
  }, []);

  const loadLastTab = async () => {
    try {
      const lastTab = await AsyncStorage.getItem(LAST_TAB_KEY);
      if (lastTab && (lastTab === 'Recents' || lastTab === 'Projects' || lastTab === 'Favorites')) {
        setInitialRoute(lastTab as TabRoute);
      }
    } catch (error) {
      console.log('Error loading last tab:', error);
    } finally {
      setIsReady(true);
    }
  };

  const saveLastTab = async (routeName: string) => {
    try {
      await AsyncStorage.setItem(LAST_TAB_KEY, routeName);
    } catch (error) {
      console.log('Error saving last tab:', error);
    }
  };

  if (!isReady) {
    return null; // Or a splash screen
  }

  return (
    <COINProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer
          onStateChange={(state) => {
            // Save the current tab whenever navigation state changes
            const currentRoute = state?.routes[state.index];
            if (currentRoute?.name) {
              saveLastTab(currentRoute.name);
            }
          }}
        >
        <Tab.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#666666',
            tabBarStyle: {
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderTopWidth: 0.5,
              borderTopColor: 'rgba(0, 0, 0, 0.1)',
              paddingTop: 10,
              paddingBottom: 10,
              height: 65,
              position: 'absolute',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            },
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Recents"
            component={RecentsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>🕐</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Projects"
            component={ProjectsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>📁</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>⭐</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </COINProvider>
  );
}
