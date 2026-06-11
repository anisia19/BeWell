import { useEffect, useRef, useCallback, useState } from "react";
import type { SensorReading } from "./useSensorReadings";
import type { PatientThresholds } from "../utils/vitalsClassifier";
import { classifyVital, type VitalStatus } from "../utils/vitalsClassifier";

const API_BASE = "http://localhost:3001";
const SYNC_INTERVAL_MS = 30_000;

type VitalKey = "bpm" | "ecgMv" | "tempC" | "humPercent";

const VITAL_LABEL: Record<VitalKey, string> = {
  bpm: "Heartrate",
  ecgMv: "ECG",
  tempC: "Temperature",
  humPercent: "Humidity",
};

const MESSAGES: Record<VitalKey, Record<"low" | "high" | "critical", string>> = {
  bpm: {
    low: "Heart rate is below normal range. Rest and monitor closely.",
    high: "Elevated heart rate detected. Avoid exertion and monitor for symptoms.",
    critical: "Critical heart rate detected. Immediate medical attention required.",
  },
  ecgMv: {
    low: "ECG amplitude below normal range. Cardiological evaluation recommended.",
    high: "ECG amplitude above normal range. Cardiological evaluation recommended.",
    critical: "Critical ECG reading. Urgent cardiological assessment needed.",
  },
  tempC: {
    low: "Body temperature below normal. Risk of hypothermia — warm patient immediately.",
    high: "Elevated temperature detected. Possible fever onset — monitor and hydrate.",
    critical: "Critical temperature detected. Immediate medical intervention required.",
  },
  humPercent: {
    low: "Ambient humidity very low. Risk of dehydration and mucosal irritation.",
    high: "High ambient humidity detected. Monitor patient comfort and ventilate.",
    critical: "Extreme humidity levels detected. Environmental adjustment required.",
  },
};

const SEVERITY: Record<"low" | "high" | "critical", string> = {
  low: "LOW",
  high: "MEDIUM",
  critical: "CRITICAL",
};

const buildMessage = (key: VitalKey, status: "low" | "high" | "critical") =>
  `${VITAL_LABEL[key]} ${status.toUpperCase()} - ${MESSAGES[key][status]}`;

const getPrefix = (msg: string) => msg.split(" ")[0];

export const useAutoAlerts = (
  patientId: number | null,
  latest: SensorReading | null,
  thresholds: PatientThresholds | undefined,
  isMock: boolean
) => {
  // Set of prefixes that currently have an ACTIVE alert in the DB
  const activePrefixesRef = useRef<Set<string>>(new Set());
  const lastProcessedIdRef = useRef<number | null>(null);

  // synced=true means we've fetched active alerts at least once and
  // activePrefixesRef reflects real DB state — safe to fire alerts
  const [synced, setSynced] = useState(false);

  const syncActiveAlerts = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`${API_BASE}/api/alerts/patient/${patientId}`);
      const alerts: { message: string; status: string }[] = await res.json();
      activePrefixesRef.current = new Set(
        alerts
          .filter((a) => a.status === "ACTIVE")
          .map((a) => getPrefix(a.message))
      );
      setSynced(true);
    } catch {
      // Keep last known state; setSynced stays true if it was already true
    }
  }, [patientId]);

  // Reset synced when patient changes, then do initial sync + periodic resync
  useEffect(() => {
    if (!patientId) return;
    setSynced(false);
    activePrefixesRef.current = new Set();
    lastProcessedIdRef.current = null;
    syncActiveAlerts();
    const id = setInterval(syncActiveAlerts, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [patientId, syncActiveAlerts]);

  // Check vitals — only runs after initial sync is complete
  useEffect(() => {
    if (!latest || !patientId || isMock || !synced) return;
    if (latest.id === 0 || latest.id === lastProcessedIdRef.current) return;
    lastProcessedIdRef.current = latest.id;

    const vitals: [VitalKey, number][] = [
      ["bpm",        latest.pulseValue],
      ["ecgMv",      latest.ecgValue],
      ["tempC",      latest.temperatureValue],
      ["humPercent", latest.humidityValue],
    ];

    for (const [key, value] of vitals) {
      const status: VitalStatus = classifyVital(key, value, thresholds);
      if (status === "normal") continue;

      const vitalPrefix = VITAL_LABEL[key];
      if (activePrefixesRef.current.has(vitalPrefix)) continue;

      const message = buildMessage(key, status as "low" | "high" | "critical");
      const severity = SEVERITY[status as "low" | "high" | "critical"];

      // Optimistically mark active to prevent double-fire before server responds
      activePrefixesRef.current.add(vitalPrefix);

      fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, doctor_id: null, severity, message }),
      }).catch(() => {
        activePrefixesRef.current.delete(vitalPrefix);
      });
    }
  }, [latest, patientId, thresholds, isMock, synced]);
};
