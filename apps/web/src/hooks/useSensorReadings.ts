import { useState, useEffect, useRef } from "react";
import {
  type MockReading,
  generateInitialMockReadings,
  generateNextMockReading,
} from "../utils/mockSensorData";

const MAX_POINTS = 60;
const POLL_INTERVAL_MS = 5000;
const API_BASE = "http://localhost:3001";

export interface SensorReading {
  id: number;
  patientId: number;
  wearableDeviceId: number;
  recordedAt: string;
  ecgValue: number;
  pulseValue: number;
  temperatureValue: number;
  humidityValue: number;
  aggregationWindowSeconds: number;
  isAlertTriggered: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const coerceReading = (r: any): SensorReading => ({
  id: Number(r.id),
  patientId: Number(r.patientId),
  wearableDeviceId: Number(r.wearableDeviceId),
  recordedAt: String(r.recordedAt),
  ecgValue: Number(r.ecgValue),
  pulseValue: Number(r.pulseValue),
  temperatureValue: Number(r.temperatureValue),
  humidityValue: Number(r.humidityValue),
  aggregationWindowSeconds: Number(r.aggregationWindowSeconds),
  isAlertTriggered: Boolean(r.isAlertTriggered),
});

const formatTime = (isoString: string, multiDay: boolean): string => {
  const d = new Date(isoString);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  if (multiDay) {
    const dd = d.getDate().toString().padStart(2, "0");
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${dd}/${mo} ${hh}:${mm}`;
  }
  return `${hh}:${mm}:${ss}`;
};

const spansMultipleDays = (list: SensorReading[]): boolean => {
  if (list.length < 2) return false;
  const first = new Date(list[0].recordedAt).toDateString();
  const last = new Date(list[list.length - 1].recordedAt).toDateString();
  return first !== last;
};

const mockToLatest = (m: MockReading): SensorReading => ({
  id: 0,
  patientId: 0,
  wearableDeviceId: 0,
  recordedAt: new Date().toISOString(),
  ecgValue: m.mv,
  pulseValue: m.bpm,
  temperatureValue: m.temp,
  humidityValue: m.hum,
  aggregationWindowSeconds: 0,
  isAlertTriggered: false,
});

export const useSensorReadings = (patientId: number | null) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockReadings, setMockReadings] = useState<MockReading[]>([]);
  const lastIdRef = useRef<number | null>(null);

  // Real data polling
  useEffect(() => {
    if (patientId === null) {
      setLoading(false);
      return;
    }

    setReadings([]);
    setLoading(true);
    lastIdRef.current = null;

    const loadInitial = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/sensor-readings/patient/${patientId}?limit=${MAX_POINTS}`
        );
        const data = await res.json();
        const safe: SensorReading[] = Array.isArray(data) ? data.map(coerceReading) : [];
        setReadings(safe);
        if (safe.length > 0) {
          lastIdRef.current = safe[safe.length - 1].id;
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    loadInitial();

    const interval = setInterval(async () => {
      if (lastIdRef.current === null) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/sensor-readings/patient/${patientId}/latest?afterId=${lastIdRef.current}`
        );
        const raw = await res.json();
        if (!Array.isArray(raw) || raw.length === 0) return;
        const newData: SensorReading[] = raw.map(coerceReading);
        lastIdRef.current = newData[newData.length - 1].id;
        setReadings((prev) => [...prev, ...newData].slice(-MAX_POINTS));
      } catch {
        // silent
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [patientId]);

  // Mock live simulation: starts when loading is done and there are no real readings
  const isMock = !loading && readings.length === 0;

  useEffect(() => {
    if (!isMock) return;
    setMockReadings(generateInitialMockReadings(MAX_POINTS));
  }, [isMock]);

  useEffect(() => {
    if (!isMock) return;
    const interval = setInterval(() => {
      setMockReadings((prev) => {
        if (prev.length === 0) return prev;
        const next = generateNextMockReading(prev[prev.length - 1]);
        return [...prev, next].slice(-MAX_POINTS);
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isMock]);

  const multiDay = spansMultipleDays(readings);

  const heartRateData = isMock
    ? mockReadings.map((m) => ({ time: m.time, bpm: m.bpm }))
    : readings.map((r) => ({ time: formatTime(r.recordedAt, multiDay), bpm: r.pulseValue }));

  const temperatureData = isMock
    ? mockReadings.map((m) => ({ time: m.time, temp: m.temp }))
    : readings.map((r) => ({ time: formatTime(r.recordedAt, multiDay), temp: r.temperatureValue }));

  const humidityData = isMock
    ? mockReadings.map((m) => ({ time: m.time, hum: m.hum }))
    : readings.map((r) => ({ time: formatTime(r.recordedAt, multiDay), hum: r.humidityValue }));

  const ecgData = isMock
    ? mockReadings.map((m) => ({ time: m.time, mv: m.mv }))
    : readings.map((r) => ({ time: formatTime(r.recordedAt, multiDay), mv: r.ecgValue }));

  const latest: SensorReading | null = isMock
    ? mockReadings.length > 0
      ? mockToLatest(mockReadings[mockReadings.length - 1])
      : null
    : readings.length > 0
    ? readings[readings.length - 1]
    : null;

  return { heartRateData, temperatureData, humidityData, ecgData, latest, loading, isMock };
};
