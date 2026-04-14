import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ChartsScreen from '../screens/ChartsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ onLogout }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>Ieșire</Text>
            </TouchableOpacity>
          ),
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
          name="Grafice"
          component={ChartsScreen}
          options={{ tabBarIcon: () => <Text>📈</Text> }}
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