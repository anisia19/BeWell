import { useState, useEffect } from "react";
import PatientGraph from "../components/PatientGraph";
import LiveECGGraph from "../components/ElectrocardiogramGraph";
import TemperatureGraph from "../components/TemperatureGraph";
import HumidityGraph from "../components/HumidityGraph";
import PatientStatsGrid from "../components/PatientStatsGrid";
import { useSensorReadings } from "../hooks/useSensorReadings";
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

  useEffect(() => {
    if (patientIdProp !== undefined) return; // already provided directly
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

  const { heartRateData, temperatureData, humidityData, ecgData, latest, loading, isMock } =
    useSensorReadings(resolvedPatientId);

  return (
    <div className="main">
      <PatientStatsGrid latest={latest} loading={!patientResolved || loading} isMock={isMock} />
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
