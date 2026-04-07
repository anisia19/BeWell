import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { savePendingAccelerometerData } from '../services/storage';
import { sendAccelerometerBurst } from '../services/api';

const READING_INTERVAL_MS = 1000;  // citire la 1 secundă
const BURST_INTERVAL_MS = 30000;   // trimite burst la 30 secunde

export default function useAccelerometer(isOnline) {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [isActive, setIsActive] = useState(false);
  const readingsBuffer = useRef([]);
  const burstTimer = useRef(null);

  useEffect(() => {
    let subscription;

    const startAccelerometer = async () => {
      await Accelerometer.setUpdateInterval(READING_INTERVAL_MS);

      subscription = Accelerometer.addListener((accelerometerData) => {
        setData(accelerometerData);
        readingsBuffer.current.push({
          ...accelerometerData,
          timestamp: new Date().toISOString(),
        });
      });

      setIsActive(true);

      // Trimite burst la fiecare 30 secunde
      burstTimer.current = setInterval(async () => {
        if (readingsBuffer.current.length > 0) {
          const burst = [...readingsBuffer.current];
          readingsBuffer.current = [];

          try {
            if (isOnline) {
              await sendAccelerometerBurst(burst);
              console.log(`Burst accelerometru trimis: ${burst.length} citiri`);
            } else {
              await savePendingAccelerometerData(burst);
              console.log('Burst salvat local (offline)');
            }
          } catch (error) {
            console.error('Eroare trimitere burst:', error);
            await savePendingAccelerometerData(burst);
          }
        }
      }, BURST_INTERVAL_MS);
    };

    startAccelerometer();

    return () => {
      if (subscription) subscription.remove();
      if (burstTimer.current) clearInterval(burstTimer.current);
      setIsActive(false);
    };
  }, [isOnline]);

  return { data, isActive };
}