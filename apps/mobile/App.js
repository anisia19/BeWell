import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AppNavigator from './src/navigation/AppNavigator';
import { syncPendingData } from './src/services/storage';
import {
  requestNotificationPermissions,
  sendOfflineNotification,
  sendSyncNotification,
} from './src/services/notifications';

export default function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Cere permisiuni notificări la startup
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online = state.isConnected && state.isInternetReachable;

      if (!online && isOnline) {
        await sendOfflineNotification();
      }

      if (online && !isOnline) {
        console.log('Internet restaurat — sincronizare date pending...');
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

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Offline — datele se salvează local
          </Text>
        </View>
      )}
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});