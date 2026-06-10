import PatientGraph from "../components/PatientGraph";
import LiveECGGraph from "../components/ElectrocardiogramGraph";
import TemperatureGraph from "../components/TemperatureGraph";
import HumidityGraph from "../components/HumidityGraph";
import PatientStatsGrid from "../components/PatientStatsGrid";
import { useSensorReadings } from "../hooks/useSensorReadings";
import "../pages/HomePagePatient.css";

const PATIENT_ID = 1;

const AllChartsData = () => {
  const { heartRateData, temperatureData, humidityData, ecgData, latest, loading } =
    useSensorReadings(PATIENT_ID);

  return (
    <div className="main">
      <PatientStatsGrid latest={latest} loading={loading} />
      <div className="charts-wrapper">
        <div className="chart-container">
          <PatientGraph data={heartRateData} />
        </div>

        <div className="chart-container">
          <LiveECGGraph data={ecgData} />
        </div>

        <div className="chart-container">
          <TemperatureGraph data={temperatureData} />
        </div>

        <div className="chart-container">
          <HumidityGraph data={humidityData} />
        </div>
      </div>
    </div>
  );
};

export default AllChartsData;
