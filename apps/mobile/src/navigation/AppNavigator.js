import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import AlertsScreen from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
        }}
      >
        <Tab.Screen
          name="Acasă"
          component={HomeScreen}
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        />
        <Tab.Screen
          name="Activități"
          component={ActivitiesScreen}
          options={{ tabBarIcon: () => <Text>📅</Text> }}
        />
        <Tab.Screen
          name="Recomandări"
          component={RecommendationsScreen}
          options={{ tabBarIcon: () => <Text>💊</Text> }}
        />
        <Tab.Screen
          name="Alerte"
          component={AlertsScreen}
          options={{ tabBarIcon: () => <Text>🔔</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}