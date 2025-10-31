import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, Alert, Platform, useWindowDimensions, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COINProvider } from './src/contexts/COINContext';
import { RecentsScreen } from './src/screens/RecentsScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

// Shared header button styles
const headerButtonStyles = {
  marginRight: 16,
  width: 44,
  height: 44,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const headerButtonTextStyles = {
  fontSize: 32,
  fontWeight: '300' as const,
  color: '#007AFF',
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const LAST_TAB_KEY = '@design_the_what:last_tab';

type TabRoute = 'Recents' | 'Projects' | 'Favorites';

// Stack Navigator configuration shared across tabs
const getStackScreenOptions = () => {
  return {
    headerShown: true,
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
    headerTintColor: '#007AFF',
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 17,
    },
    headerBackTitleVisible: false, // Hide back button text, just show chevron
  };
};

// Recents Stack Navigator
function RecentsStack() {
  const handleCreateCOIN = () => {
    Alert.alert(
      'Create COIN',
      'Would open Create COIN modal\n\n(UC-100 not yet implemented)',
      [{ text: 'OK' }]
    );
  };

  const screenOptions = {
    ...getStackScreenOptions(),
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RecentsList"
        component={RecentsScreen}
        options={{
          title: 'Recents',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateCOIN} style={headerButtonStyles}>
              <Text style={headerButtonTextStyles}>+</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

// Favorites Stack Navigator
function FavoritesStack() {
  const handleCreateCOIN = () => {
    Alert.alert(
      'Create COIN',
      'Would open Create COIN modal\n\n(UC-100 not yet implemented)',
      [{ text: 'OK' }]
    );
  };

  const screenOptions = {
    ...getStackScreenOptions(),
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateCOIN} style={headerButtonStyles}>
              <Text style={headerButtonTextStyles}>+</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

// Projects Stack Navigator (UC-201)
function ProjectsStack() {
  const { width } = useWindowDimensions();
  const screenWidth = Dimensions.get('screen').width;

  const isResizableWindow = Platform.OS === 'ios' &&
    parseInt(Platform.Version as string, 10) >= 26 &&
    width < screenWidth - 10;

  const handleCreateProject = () => {
    Alert.alert(
      'Coming Soon',
      'Project creation will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  const handleCreateCOIN = () => {
    Alert.alert(
      'Coming Soon',
      'Create COIN in this project (UC-100 with project context)',
      [{ text: 'OK' }]
    );
  };

  const screenOptions = {
    ...getStackScreenOptions(),
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateProject} style={headerButtonStyles}>
              <Text style={headerButtonTextStyles}>+</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen as any}
        options={({ route }: any) => ({
          title: route.params?.projectName || 'Project',
          headerLeftContainerStyle: {
            paddingLeft: isResizableWindow ? 60 : 0,
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateCOIN} style={headerButtonStyles}>
              <Text style={headerButtonTextStyles}>+</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

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
            component={RecentsStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>🕐</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>⭐</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Projects"
            component={ProjectsStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 24, color }}>📁</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </COINProvider>
  );
}
