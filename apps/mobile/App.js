import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { syncPendingData } from './src/services/storage';
import {
  requestNotificationPermissions,
  sendOfflineNotification,
  sendSyncNotification,
} from './src/services/notifications';

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    requestNotificationPermissions();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const patientId = await AsyncStorage.getItem('patient_id');
      if (token && patientId) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Eroare verificare auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('patient_id');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online = state.isConnected && state.isInternetReachable;

      if (!online && isOnline) {
        await sendOfflineNotification();
      }

      if (online && !isOnline) {
        try {
          await syncPendingData();
          await sendSyncNotification(1);
        } catch (error) {
          console.error('Eroare sincronizare:', error);
        }
      }

      setIsOnline(online);
    });

    return () => unsubscribe();
  }, [isOnline]);

  if (checkingAuth) {
    return (
      <View style={styles.centered}>
        <StatusBar style="light" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Se încarcă...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Offline — datele se salvează local
          </Text>
        </View>
      )}
      {isLoggedIn ? (
        <AppNavigator onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  offlineBanner: { backgroundColor: '#7C2D12', padding: 8, alignItems: 'center' },
  offlineText: { color: '#FED7AA', fontWeight: '500', fontSize: 13 },
});