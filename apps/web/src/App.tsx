import { Routes, Route, Navigate } from "react-router-dom";

import DoctorLayout from "./components/DoctorLayout";
import ProtectedPatientLayout from "./components/ProtectedPatientLayout";

import Patients from "./pages/Patients";
import DoctorAlerts from "./pages/DoctorAlerts";
import PatientAlerts from "./pages/PatientAlerts";
import Recommendations from "./pages/Recommendations";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import RegisterPage from "./pages/RegisterPage";
import "bootstrap-icons/font/bootstrap-icons.css";
import PatientDetails from "./pages/PatientDetails";
import HomePagePatient from "./pages/HomePagePatient";
import AddPatient from "./pages/AddPatient";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/doctor/dashboard" element={<DoctorLayout />}>
        <Route index element={<Navigate to="patients" replace />} />
        <Route path="patients" element={<Patients />} />
        <Route path="alerts" element={<DoctorAlerts />} />
        <Route path="patient-details/:id" element={<PatientDetails />} />
        <Route path="add-patient" element={<AddPatient />} />
      </Route>

      <Route path="/patient/dashboard" element={<ProtectedPatientLayout />}>
        <Route index element={<HomePagePatient />} />
        <Route path="alerts" element={<PatientAlerts />} />
        <Route path="recommendations" element={<Recommendations />} />
      </Route>
    </Routes>
  );
}

export default App;
