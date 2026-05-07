import PatientGraph from "../components/PatientGraph";
import LiveECGGraph from "../components/ElectrocardiogramGraph";
import PoincarePlotGraph from "../components/PoincareGraph";
import SpectrogramGraph from "../components/SpectogramGraph";
import TemperatureGraph from "../components/TemperatureGraph";
import HumidityGraph from "../components/HumidityGraph";
import "./HomePagePatient.css";

const HomePagePatient = () => {
  return (
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
  );
};

export default HomePagePatient;
