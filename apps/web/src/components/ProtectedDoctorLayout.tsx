import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DoctorLayout from "./DoctorLayout";

const ProtectedDoctorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    try {
      const user = JSON.parse(userJson);

      if (user.role !== "DOCTOR") {
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }
    } catch {
      localStorage.removeItem("user");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [location, navigate]);

  return <DoctorLayout />;
};

export default ProtectedDoctorLayout;
