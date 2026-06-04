import { useState, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { sendSensorData } from '../services/api';
import { savePendingSensorData, savePendingAlarm } from '../services/storage';

const SEND_INTERVAL_MS = 30000;

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHAR_DATA_UUID = '12345678-1234-1234-1234-123456789001';
const CHAR_ALARM_UUID = '12345678-1234-1234-1234-123456789002';
const CHAR_LIMITS_UUID = '12345678-1234-1234-1234-123456789003';

export default function useBluetooth(isOnline, alertRules) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [foundDevices, setFoundDevices] = useState([]);
  const [sensorData, setSensorData] = useState({
    ecg: null, temperature: null, humidity: null, pulse: null,
  });
  const [alerts, setAlerts] = useState([]);

  const sensorDataRef = useRef({ ecg: null, temperature: null, humidity: null, pulse: null });
  const sendTimer = useRef(null);
  const bleManager = useRef(null);
  const dataSubscription = useRef(null);
  const alarmSubscription = useRef(null);

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
        console.log('BLE State:', state);
        if (state === 'PoweredOn') {
          bleManager.current.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.error('Eroare scanare:', error);
              setIsScanning(false);
              return;
            }
            if (device?.name || device?.localName) {
              setFoundDevices(prev => {
                if (prev.find(d => d.id === device.id)) return prev;
                const name = device.name || device.localName;
                return [...prev, { id: device.id, name, rssi: device.rssi, device }];
              });
            }
          });

          setTimeout(() => {
            if (bleManager.current) {
              bleManager.current.stopDeviceScan();
            }
            setIsScanning(false);
          }, 10000);
        }
      }, true);

    } catch (error) {
      console.error('BLE nu e disponibil:', error);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceInfo) => {
    try {
      if (bleManager.current) {
        bleManager.current.stopDeviceScan();
      }
      setIsScanning(false);

      console.log(`Conectare la ${deviceInfo.name}...`);
      const connected = await deviceInfo.device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice({ name: deviceInfo.name, id: deviceInfo.id, device: connected });
      setFoundDevices([]);

      dataSubscription.current = await connected.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_DATA_UUID,
        (error, characteristic) => {
          if (error) {
            if (error.message?.includes('cancelled') || error.message?.includes('Operation')) return;
            console.error('Eroare date:', error);
            return;
          }
          if (characteristic?.value) {
            const raw = atob(characteristic.value);
            console.log('Date primite de la ESP32:', raw);
            parseAndSetData(raw, false);
          }
        }
      );

      alarmSubscription.current = await connected.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_ALARM_UUID,
        (error, characteristic) => {
          if (error) {
            if (error.message?.includes('cancelled') || error.message?.includes('Operation')) return;
            console.error('Eroare alarma:', error);
            return;
          }
          if (characteristic?.value) {
            const raw = atob(characteristic.value);
            console.log('ALARMA primita de la ESP32:', raw);
            parseAndSetData(raw, true);
          }
        }
      );

      if (alertRules && alertRules.length > 0) {
        await sendLimitsToESP32(connected);
      }

      startSendTimer();
      console.log(`Conectat la ${deviceInfo.name}`);
    } catch (error) {
      console.error('Eroare conectare:', error);
    }
  };

  const parseAndSetData = async (raw, isAlarm) => {
    try {
      const cleanRaw = isAlarm ? raw.replace('ALARM,', '') : raw;
      const parts = cleanRaw.split(',');

      if (parts.length < 3) {
        console.error('Format date invalid:', raw);
        return;
      }

      const reading = {
        pulse: parseFloat(parts[0]) || 0,
        temperature: parseFloat(parts[1]) || 0,
        humidity: parseFloat(parts[2]) || 0,
        ecg: parts[3] ? parseInt(parts[3]) : 0,
        timestamp: new Date().toISOString(),
      };

      console.log('Date parsate:', reading);
      setSensorData(reading);
      sensorDataRef.current = reading;

      if (isAlarm) {
        const alarm = {
          alert_type: 'SENSOR',
          message: `Valori anormale: Puls=${reading.pulse} bpm, Temp=${reading.temperature}°C, Umid=${reading.humidity}%`,
          severity: 'HIGH',
          triggered_at: new Date().toISOString(),
        };
        setAlerts(prev => [alarm, ...prev]);

        try {
          const { sendAlertNotification } = require('../services/notifications');
          await sendAlertNotification(alarm);
        } catch (e) {}

        try {
          const { sendAlarm } = require('../services/api');
          if (isOnline) await sendAlarm(alarm);
          else await savePendingAlarm(alarm);
        } catch (error) {
          await savePendingAlarm(alarm);
        }

        try {
          const { sendSensorData: send } = require('../services/api');
          if (isOnline) await send(reading);
          else await savePendingSensorData(reading);
        } catch (error) {
          await savePendingSensorData(reading);
        }
      }
    } catch (error) {
      console.error('Eroare parsare date ESP32:', error);
    }
  };

  const sendLimitsToESP32 = async (device) => {
    try {
      const pulse = alertRules.find(r => r.parameter === 'pulse');
      const temp = alertRules.find(r => r.parameter === 'temperature');
      const hum = alertRules.find(r => r.parameter === 'humidity');

      if (pulse && temp && hum) {
        const limitsStr = `${pulse.min},${pulse.max},${temp.min},${temp.max},${hum.min},${hum.max}`;
        const encoded = btoa(limitsStr);
        await device.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHAR_LIMITS_UUID,
          encoded
        );
        console.log('Limite trimise la ESP32:', limitsStr);
      }
    } catch (error) {
      console.error('Eroare trimitere limite:', error);
    }
  };

  const startSendTimer = () => {
    sendTimer.current = setInterval(async () => {
      const currentData = sensorDataRef.current;
      console.log('Timer send - date curente:', currentData);

      if (currentData.pulse || currentData.temperature) {
        try {
          if (isOnline) {
            await sendSensorData(currentData);
            console.log('Date senzori trimise la cloud:', currentData);
          } else {
            await savePendingSensorData(currentData);
            console.log('Date senzori salvate local');
          }
        } catch (error) {
          console.error('Eroare trimitere senzori:', error);
          await savePendingSensorData(currentData);
        }
      } else {
        console.log('Nu sunt date de trimis inca');
      }
    }, SEND_INTERVAL_MS);
  };

  const stopScanning = () => {
    if (bleManager.current) {
      bleManager.current.stopDeviceScan();
    }
    setIsScanning(false);
  };

  const disconnectDevice = async () => {
    try {
      if (dataSubscription.current) {
        dataSubscription.current.remove();
        dataSubscription.current = null;
      }
      if (alarmSubscription.current) {
        alarmSubscription.current.remove();
        alarmSubscription.current = null;
      }
      if (connectedDevice?.device) {
        await connectedDevice.device.cancelConnection();
      }
    } catch (e) {
      console.error('Eroare deconectare:', e);
    }
    setConnectedDevice(null);
    setSensorData({ ecg: null, temperature: null, humidity: null, pulse: null });
    sensorDataRef.current = { ecg: null, temperature: null, humidity: null, pulse: null };
    if (sendTimer.current) clearInterval(sendTimer.current);
  };

  return {
    isScanning,
    connectedDevice,
    foundDevices,
    sensorData,
    alerts,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectDevice,
  };
}