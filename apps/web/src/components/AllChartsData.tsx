import PatientGraph from "../components/PatientGraph";
import LiveECGGraph from "../components/ElectrocardiogramGraph";
import PoincarePlotGraph from "../components/PoincareGraph";
import SpectrogramGraph from "../components/SpectogramGraph";
import TemperatureGraph from "../components/TemperatureGraph";
import HumidityGraph from "../components/HumidityGraph";
import PatientStatsGrid from "../components/PatientStatsGrid";
import "../pages/HomePagePatient.css";

const AllChartsData = () => {
  return (
    
    <div className="main">
      <PatientStatsGrid />
      <div className="charts-wrapper">
        <div className="chart-container">
          <PatientGraph />
        </div>

        <div className="chart-container">
          <LiveECGGraph />
        </div>

        <div className="chart-container">
          <PoincarePlotGraph />
        </div>

        <div className="chart-container">
          <SpectrogramGraph />
        </div>

        <div className="chart-container">
          <TemperatureGraph />
        </div>

        <div className="chart-container">
          <HumidityGraph />
        </div>
      </div>
    </div>
  );
};

export default AllChartsData;