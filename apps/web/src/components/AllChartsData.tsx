import { useState, useEffect } from "react";
import PatientGraph from "../components/PatientGraph";
import LiveECGGraph from "../components/ElectrocardiogramGraph";
import TemperatureGraph from "../components/TemperatureGraph";
import HumidityGraph from "../components/HumidityGraph";
import PatientStatsGrid from "../components/PatientStatsGrid";
import { useSensorReadings } from "../hooks/useSensorReadings";
import type { PatientThresholds } from "../utils/vitalsClassifier";
import "../pages/HomePagePatient.css";

const API_BASE = "http://localhost:3001";

const getLoggedUserId = (): number | null => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const id = Number(parsed?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};

interface Props {
  patientId?: number;
}

const AllChartsData = ({ patientId: patientIdProp }: Props) => {
  const [resolvedPatientId, setResolvedPatientId] = useState<number | null>(
    patientIdProp ?? null
  );
  const [patientResolved, setPatientResolved] = useState(patientIdProp !== undefined);
  const [thresholds, setThresholds] = useState<PatientThresholds | undefined>(undefined);

  // Resolve patient ID from logged-in user when not provided as prop
  useEffect(() => {
    if (patientIdProp !== undefined) return;
    const userId = getLoggedUserId();
    if (!userId) {
      setPatientResolved(true);
      return;
    }
    fetch(`${API_BASE}/api/patients/by-user/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const id = Number(data?.patientId);
        if (Number.isFinite(id) && id > 0) {
          setResolvedPatientId(id);
        }
      })
      .catch(() => {})
      .finally(() => setPatientResolved(true));
  }, [patientIdProp]);

  // Fetch thresholds whenever patient is known
  useEffect(() => {
    const pid = patientIdProp ?? resolvedPatientId;
    if (!pid) return;
    fetch(`${API_BASE}/api/patients/${pid}/thresholds`)
      .then((r) => r.json())
      .then((data) => setThresholds(data))
      .catch(() => {});
  }, [patientIdProp, resolvedPatientId]);

  const { heartRateData, temperatureData, humidityData, ecgData, latest, loading, isMock } =
    useSensorReadings(resolvedPatientId);

  return (
    <div className="main">
      <PatientStatsGrid
        latest={latest}
        loading={!patientResolved || loading}
        isMock={isMock}
        thresholds={thresholds}
      />
      <div className="charts-wrapper">
        <div className="chart-container">
          <PatientGraph data={heartRateData} isMock={isMock} />
        </div>

        <div className="chart-container">
          <LiveECGGraph data={ecgData} isMock={isMock} />
        </div>

        <div className="chart-container">
          <TemperatureGraph data={temperatureData} isMock={isMock} />
        </div>

        <div className="chart-container">
          <HumidityGraph data={humidityData} isMock={isMock} />
        </div>
      </div>
    </div>
  );
};

export default AllChartsData;
