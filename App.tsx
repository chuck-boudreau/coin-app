import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';

const Tab = createBottomTabNavigator();
const ProjectsStack = createStackNavigator();

// Projects Tab Stack Navigator
function ProjectsStackNavigator() {
  return (
    <ProjectsStack.Navigator>
      <ProjectsStack.Screen
        name="ProjectsScreen"
        component={ProjectsScreen}
        options={{ headerShown: false }}
      />
      <ProjectsStack.Screen
        name="ProjectDetailScreen"
        component={ProjectDetailScreen}
        options={{
          headerShown: true,
          headerBackTitle: 'Projects',
        }}
      />
    </ProjectsStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Recents"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🕐</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Projects"
          component={ProjectsStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📁</Text>
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
