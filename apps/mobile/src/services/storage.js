import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_SENSOR_KEY = 'pending_sensor_data';
const PENDING_ACCEL_KEY = 'pending_accelerometer_data';
const PENDING_ALARMS_KEY = 'pending_alarms';

const sendAccelerometerBurst = async (readings) => {
  const { sendAccelerometerBurst: send } = await import('./api');
  return send(readings);
};

const sendSensorData = async (data) => {
  const { sendSensorData: send } = await import('./api');
  return send(data);
};

const sendAlarm = async (alarmData) => {
  const { sendAlarm: send } = await import('./api');
  return send(alarmData);
};