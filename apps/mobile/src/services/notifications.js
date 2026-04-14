import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurare cum apar notificările când aplicația e deschisă
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

export const sendAlertNotification = async (alert) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🚨 Alertă BeWell — ${alert.alert_type}`,
      body: alert.message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#F44336',
    },
    trigger: null, // trimite imediat
  });
};

export const sendOfflineNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ BeWell — Mod Offline',
      body: 'Nu există conexiune la internet. Datele se salvează local.',
      sound: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
      color: '#FF9800',
    },
    trigger: null,
  });
};

export const sendSyncNotification = async (count) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ BeWell — Sincronizare completă',
      body: `${count} înregistrări trimise la cloud.`,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.LOW,
      color: '#4CAF50',
    },
    trigger: null,
  });
};