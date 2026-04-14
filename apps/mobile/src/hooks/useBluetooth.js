import { useState, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { sendSensorData } from '../services/api';
import { savePendingSensorData, savePendingAlarm } from '../services/storage';

const READING_INTERVAL_MS = 10000;
const SEND_INTERVAL_MS = 30000;

export default function useBluetooth(isOnline, alertRules) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [bluetoothState, setBluetoothState] = useState('unknown');
  const [foundDevices, setFoundDevices] = useState([]);
  const [sensorData, setSensorData] = useState({
    ecg: null, temperature: null, humidity: null, pulse: null,
  });
  const [alerts, setAlerts] = useState([]);

  const readingsBuffer = useRef([]);
  const readInterval = useRef(null);
  const sendTimer = useRef(null);
  const bleManager = useRef(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        v => v === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const startScanning = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.error('Permisiuni Bluetooth refuzate');
      return;
    }

    try {
      const { BleManager } = require('react-native-ble-plx');
      bleManager.current = new BleManager();
      setIsScanning(true);
      setFoundDevices([]);

      bleManager.current.onStateChange((state) => {
        setBluetoothState(state);
        if (state === 'PoweredOn') {
          bleManager.current.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.error('Eroare scanare:', error);
              setIsScanning(false);
              return;
            }
            if (device?.name) {
              setFoundDevices(prev => {
                if (prev.find(d => d.id === device.id)) return prev;
                return [...prev, { id: device.id, name: device.name }];
              });
              if (device.name.includes('BeWell')) {
                bleManager.current.stopDeviceScan();
                connectToDevice(device);
              }
            }
          });

          setTimeout(() => {
            bleManager.current.stopDeviceScan();
            setIsScanning(false);
          }, 10000);
        }
      }, true);

    } catch (error) {
      console.error('BLE nu e disponibil:', error);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      setIsScanning(false);
      startReadingData(connected);
      startSendTimer();
      console.log(`Conectat la ${device.name}`);
    } catch (error) {
      console.error('Eroare conectare:', error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (bleManager.current) {
      bleManager.current.stopDeviceScan();
    }
    setIsScanning(false);
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
    }
    setConnectedDevice(null);
    setSensorData({ ecg: null, temperature: null, humidity: null, pulse: null });
    if (readInterval.current) clearInterval(readInterval.current);
    if (sendTimer.current) clearInterval(sendTimer.current);
  };

  const startReadingData = (device) => {
    const SERVICE_UUID = '0000180D-0000-1000-8000-00805F9B34FB';
    const CHAR_UUID = '00002A37-0000-1000-8000-00805F9B34FB';

    readInterval.current = setInterval(async () => {
      try {
        const characteristic = await device.readCharacteristicForService(
          SERVICE_UUID, CHAR_UUID
        );
        const raw = atob(characteristic.value);
        const reading = JSON.parse(raw);
        setSensorData(reading);
        readingsBuffer.current.push({
          ...reading,
          timestamp: new Date().toISOString(),
        });
        await checkAlerts(reading);
      } catch (error) {
        console.error('Eroare citire BLE:', error);
      }
    }, READING_INTERVAL_MS);
  };

  const startSendTimer = () => {
    sendTimer.current = setInterval(async () => {
      if (readingsBuffer.current.length > 0) {
        const avg = calculateAverage(readingsBuffer.current);
        readingsBuffer.current = [];
        try {
          if (isOnline) {
            await sendSensorData(avg);
            console.log('Date senzori trimise la cloud');
          } else {
            await savePendingSensorData(avg);
          }
        } catch (error) {
          console.error('Eroare trimitere:', error);
          await savePendingSensorData(avg);
        }
      }
    }, SEND_INTERVAL_MS);
  };

  const calculateAverage = (readings) => {
    const sum = readings.reduce((acc, r) => ({
      ecg: acc.ecg + (r.ecg || 0),
      temperature: acc.temperature + (r.temperature || 0),
      humidity: acc.humidity + (r.humidity || 0),
      pulse: acc.pulse + (r.pulse || 0),
    }), { ecg: 0, temperature: 0, humidity: 0, pulse: 0 });
    const count = readings.length;
    return {
      ecg: sum.ecg / count,
      temperature: sum.temperature / count,
      humidity: sum.humidity / count,
      pulse: sum.pulse / count,
    };
  };

  const checkAlerts = async (reading) => {
    if (!alertRules) return;
    for (const rule of alertRules) {
      let triggered = false;
      let message = '';

      if (rule.parameter === 'pulse' && reading.pulse != null &&
        (reading.pulse < rule.min || reading.pulse > rule.max)) {
        triggered = true;
        message = `Puls anormal: ${reading.pulse.toFixed(0)} bpm (normal: ${rule.min}-${rule.max})`;
      }
      if (rule.parameter === 'temperature' && reading.temperature != null &&
        (reading.temperature < rule.min || reading.temperature > rule.max)) {
        triggered = true;
        message = `Temperatură anormală: ${reading.temperature.toFixed(1)}°C (normal: ${rule.min}-${rule.max})`;
      }
      if (rule.parameter === 'ecg' && reading.ecg != null &&
        (reading.ecg < rule.min || reading.ecg > rule.max)) {
        triggered = true;
        message = `ECG anormal: ${reading.ecg.toFixed(0)} (normal: ${rule.min}-${rule.max})`;
      }
      if (rule.parameter === 'humidity' && reading.humidity != null &&
        (reading.humidity < rule.min || reading.humidity > rule.max)) {
        triggered = true;
        message = `Umiditate anormală: ${reading.humidity.toFixed(0)}% (normal: ${rule.min}-${rule.max})`;
      }

      if (triggered) {
        const alarm = {
          alert_type: rule.parameter.toUpperCase(),
          message,
          severity: 'HIGH',
          triggered_at: new Date().toISOString(),
        };
        setAlerts(prev => [alarm, ...prev]);

        const { sendAlertNotification } = require('../services/notifications');
        await sendAlertNotification(alarm);

        try {
          const { sendAlarm } = require('../services/api');
          if (isOnline) await sendAlarm(alarm);
          else await savePendingAlarm(alarm);
        } catch (error) {
          await savePendingAlarm(alarm);
        }
      }
    }
  };

  return {
    isScanning,
    connectedDevice,
    bluetoothState,
    foundDevices,
    sensorData,
    alerts,
    startScanning,
    stopScanning,
    disconnectDevice,
  };
}