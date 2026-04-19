import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Login from "./pages/Login";
import HomePageDoctor from "./pages/HomePageDoctor";
import Layout from "./components/Layout";
import RegisterPage from "./pages/RegisterPage";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/welcome" element={<Welcome />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctor" element={<HomePageDoctor />} />
      </Route>
    </Routes>
  );
}

export default App;
