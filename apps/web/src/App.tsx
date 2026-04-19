import { Routes, Route, Navigate } from "react-router-dom";

import DoctorLayout from "./components/DoctorLayout";
import PatientLayout from "./components/PatientLayout";

import Patients from "./pages/Patients";
import DoctorAlerts from "./pages/DoctorAlerts";
import Dashboard from "./pages/Dashboard";
import PatientAlerts from "./pages/PatientAlerts";
import Recommendations from "./pages/Recommendations";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="patients" replace />} />
        <Route path="patients" element={<Patients />} />
        <Route path="alerts" element={<DoctorAlerts />} />
      </Route>

      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="alerts" element={<PatientAlerts />} />
        <Route path="recommendations" element={<Recommendations />} />
      </Route>
    </Routes>
  );
}

export default App;
