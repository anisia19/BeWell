import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.109:3001';; // Android emulator -> localhost

const getHeaders = async () => {
  const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
};



export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('patient_id', String(data.patient_id));
  }
  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('patient_id');
};


export const getActivities = async () => {
  const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/recommendation-schedules/${patientId}`,
    { headers }
  );
  return handleResponse(res);
};


export const getRecommendations = async () => {
 const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/recommendations/${patientId}`,
    { headers }
  );
  return handleResponse(res);
};



export const getAlerts = async () => {
  const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/alerts/${patientId}`,
    { headers }
  );
  return handleResponse(res);
};

export const sendAlertNote = async (alertId, note) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/api/alert-notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ alert_id: alertId, note }),
  });
  return handleResponse(res);
};



export const sendSensorData = async (data) => {
  const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/api/sensor-readings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ patient_id: patientId, ...data }),
  });
  return handleResponse(res);
};

export const sendAccelerometerBurst = async (readings) => {
  const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/api/accelerometer-readings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ patient_id: patientId, readings }),
  });
  return handleResponse(res);
};

export const sendAlarm = async (alarmData) => {
 const patientId = await AsyncStorage.getItem('patient_id') || '1';
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/api/alerts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ patient_id: patientId, ...alarmData }),
  });
  return handleResponse(res);
};