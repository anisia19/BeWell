import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendSensorData, sendAccelerometerBurst, sendAlarm } from './api';

const PENDING_SENSOR_KEY = 'pending_sensor_data';
const PENDING_ACCELEROMETER_KEY = 'pending_accelerometer_data';
const PENDING_ALARMS_KEY = 'pending_alarms';


export const saveSensorDataLocally = async (data) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ ...data, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(PENDING_SENSOR_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Eroare salvare locală senzori:', error);
  }
};

export const saveAccelerometerDataLocally = async (readings) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_ACCELEROMETER_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ readings, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(PENDING_ACCELEROMETER_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Eroare salvare locală accelerometru:', error);
  }
};

export const saveAlarmLocally = async (alarmData) => {
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

  // Sincronizare date senzori
  try {
    const existing = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendSensorData(item);
      }
      await AsyncStorage.removeItem(PENDING_SENSOR_KEY);
      console.log(`Sincronizate ${list.length} înregistrări senzori.`);
    }
  } catch (error) {
    console.error('Eroare sincronizare senzori:', error);
  }

  // Sincronizare date accelerometru
  try {
    const existing = await AsyncStorage.getItem(PENDING_ACCELEROMETER_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendAccelerometerBurst(item.readings);
      }
      await AsyncStorage.removeItem(PENDING_ACCELEROMETER_KEY);
      console.log(`Sincronizate ${list.length} burst-uri accelerometru.`);
    }
  } catch (error) {
    console.error('Eroare sincronizare accelerometru:', error);
  }

  // Sincronizare alarme
  try {
    const existing = await AsyncStorage.getItem(PENDING_ALARMS_KEY);
    if (existing) {
      const list = JSON.parse(existing);
      for (const item of list) {
        await sendAlarm(item);
      }
      await AsyncStorage.removeItem(PENDING_ALARMS_KEY);
      console.log(`Sincronizate ${list.length} alarme.`);
    }
  } catch (error) {
    console.error('Eroare sincronizare alarme:', error);
  }
};


export const hasPendingData = async () => {
  try {
    const sensor = await AsyncStorage.getItem(PENDING_SENSOR_KEY);
    const accel = await AsyncStorage.getItem(PENDING_ACCELEROMETER_KEY);
    const alarms = await AsyncStorage.getItem(PENDING_ALARMS_KEY);
    return !!(sensor || accel || alarms);
  } catch {
    return false;
  }
};