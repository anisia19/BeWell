import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendSensorData, sendAccelerometerBurst, sendAlarm } from './api';

const PENDING_SENSOR_KEY = 'pending_sensor_data';
const PENDING_ACCEL_KEY = 'pending_accelerometer_data';
const PENDING_ALARMS_KEY = 'pending_alarms';

export const savePendingSensorData = async (data) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ ...data, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(PENDING_SENSOR_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Eroare salvare locală sensor:', error);
  }
};

export const savePendingAccelerometerData = async (readings) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_ACCEL_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ readings, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(PENDING_ACCEL_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Eroare salvare locală accelerometru:', error);
  }
};

export const savePendingAlarm = async (alarmData) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_ALARMS_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ ...alarmData, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(PENDING_ALARMS_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Eroare salvare locală alarmă:', error);
  }
};

export const syncPendingData = async () => {
  console.log('Sincronizare date pending...');

  try {
    const existing = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendSensorData(item);
      }
      await AsyncStorage.removeItem(PENDING_SENSOR_KEY);
    }
  } catch (error) {
    console.error('Eroare sync senzori:', error);
  }

  try {
    const existing = await AsyncStorage.getItem(PENDING_ACCEL_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendAccelerometerBurst(item.readings);
      }
      await AsyncStorage.removeItem(PENDING_ACCEL_KEY);
    }
  } catch (error) {
    console.error('Eroare sync accelerometru:', error);
  }

  try {
    const existing = await AsyncStorage.getItem(PENDING_ALARMS_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendAlarm(item);
      }
      await AsyncStorage.removeItem(PENDING_ALARMS_KEY);
    }
  } catch (error) {
    console.error('Eroare sync alarme:', error);
  }
};

export const hasPendingData = async () => {
  try {
    const sensor = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    const accel = await AsyncStorage.getItem(PENDING_ACCEL_KEY);
    const alarms = await AsyncStorage.getItem(PENDING_ALARMS_KEY);
    return !!(sensor || accel || alarms);
  } catch {
    return false;
  }
};