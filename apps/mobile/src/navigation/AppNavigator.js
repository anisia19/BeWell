import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ChartsScreen from '../screens/ChartsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ onLogout }) {
  const HomeWithLogout = (props) => <HomeScreen {...props} onLogout={onLogout} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6EE7B7',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#161B22',
            borderTopColor: '#21262D',
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Acasă"
          component={HomeWithLogout}
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        />
        <Tab.Screen
          name="Activități"
          component={ActivitiesScreen}
          options={{ tabBarIcon: () => <Text>📅</Text> }}
        />
        <Tab.Screen
          name="Grafice"
          component={ChartsScreen}
          options={{ tabBarIcon: () => <Text>📈</Text> }}
        />
        <Tab.Screen
          name="Alerte"
          component={AlertsScreen}
          options={{ tabBarIcon: () => <Text>🔔</Text> }}
        />
        <Tab.Screen
          name="Recomandări"
          component={RecommendationsScreen}
          options={{ tabBarIcon: () => <Text>💊</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}