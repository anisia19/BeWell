import "./DoctorAlerts.css";
import PatientCard from "../components/PatientCard";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

type Patient = {
  id: number;
  name: string;
  gender: string;
  age: number | string | null;
  diagnosis: string | null;
  status: string;
  alertsCount: number | null;
  cnp: string;
};

type Alert = {
  id: number;
  title: string;
  severity: "Critical" | "Medium" | "Low";
  status: "Active" | "Acknowledged";
  message: string;
  time: string;
};

const mockedAlerts: Record<number, Alert[]> = {
  1: [
    {
      id: 1,
      title: "SpO2 Alert",
      severity: "Critical",
      status: "Active",
      message: "SpO2 critically low — supplemental oxygen may be required.",
      time: "13d ago",
    },
    {
      id: 2,
      title: "HeartRate Alert",
      severity: "Medium",
      status: "Acknowledged",
      message: "Elevated heart rate consistent with respiratory distress.",
      time: "13d ago",
    },
  ],
};

function DoctorAlerts() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("http://localhost:3001/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch(`http://localhost:3001/api/patients?search=${search}`)
        .then((res) => res.json())
        .then((data) => setPatients(data));
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const selectedAlerts = selectedPatient
    ? mockedAlerts[selectedPatient.id] || []
    : [];

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts Overview</h1>

      <div className="alerts-layout">
        <aside className="alerts-sidebar">
          <SearchBar
            className="search-bar-patients"
            placeholder="Search patients..."
            value={search}
            onChange={setSearch}
          />
          <div className="alerts-sidebar-header">
            <span>Patients</span>
            <span className="patients-count">{patients.length}</span>
          </div>

          <div className="alerts-patient-list">
            {patients.map((p) => (
              <PatientCard
                cnp={p.cnp}
                key={p.id}
                name={p.name}
                gender={p.gender}
                age={p.age ?? "N/A"}
                diagnosis={p.diagnosis || "No medical info"}
                status={p.status}
                alertsCount={p.alertsCount ?? 0}
                variant="compact"
                onClick={() => setSelectedPatient(p)}
              />
            ))}
          </div>
        </aside>

        <main className="alerts-details">
          {!selectedPatient ? (
            <div className="empty-alerts-state">
              <div className="empty-icon">
                <i className="bi bi-bell-slash"></i>
              </div>
              <h2>No patient selected</h2>
              <p>Select a patient from the list to view their alerts</p>
            </div>
          ) : (
            <div className="alerts-content">
              <div className="alerts-content-header">
                <h2>
                  <i className="bi bi-bell"></i> Alerts for{" "}
                  <span>{selectedPatient.name}</span>
                </h2>

                <div className="alerts-summary">
                  <span className="active-count">
                    {selectedAlerts.filter((a) => a.status === "Active").length}{" "}
                    active
                  </span>
                  <span className="total-count">
                    {selectedAlerts.length} total
                  </span>
                </div>
              </div>

              <h3>Alerts</h3>

              <div className="alerts-list">
                {selectedAlerts.length === 0 ? (
                  <p className="no-alerts-text">No alerts for this patient.</p>
                ) : (
                  selectedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-card ${
                        alert.status === "Acknowledged" ? "acknowledged" : ""
                      }`}
                    >
                      <div className="alert-dot"></div>

                      <div className="alert-main">
                        <div className="alert-title-row">
                          <strong>{alert.title}</strong>
                          <span
                            className={`severity ${alert.severity.toLowerCase()}`}
                          >
                            {alert.severity}
                          </span>
                          {alert.status === "Acknowledged" && (
                            <span className="ack-badge">Acknowledged</span>
                          )}
                        </div>

                        <p>{alert.message}</p>

                        <span className="alert-time">
                          <i className="bi bi-clock"></i> {alert.time}
                        </span>
                      </div>

                      {alert.status === "Active" && (
                        <button className="ack-button">Acknowledge</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorAlerts;
