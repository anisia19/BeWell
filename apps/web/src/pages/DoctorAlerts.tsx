import "./DoctorAlerts.css";
import PatientCard from "../components/PatientCard";
import { useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
  gender: string;
  age: number | string | null;
  diagnosis: string | null;
  status: string;
};

function DoctorAlerts() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);
  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts Overview</h1>

      <div className="alerts-layout">
        <aside className="alerts-sidebar">
          <div className="alerts-sidebar-header">
            <span>Patients</span>
            <span className="patients-count">{patients.length}</span>
          </div>

          <div className="alerts-patient-list">
            {patients.map((p) => (
              <PatientCard
                key={p.id}
                name={p.name}
                gender={p.gender}
                age={p.age ?? "N/A"}
                diagnosis={p.diagnosis || "No medical info"}
                status={p.status}
                variant="compact"
                onClick={() => console.log(p.name)}
              />
            ))}
          </div>
        </aside>
        <main className="alerts-details">
          <div className="empty-alerts-state">
            <div className="empty-icon">
              <i className="bi bi-bell-slash"></i>
            </div>

            <h2>No patient selected</h2>
            <p>Select a patient from the list to view their alerts</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DoctorAlerts;
