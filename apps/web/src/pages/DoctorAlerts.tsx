import { useMemo, useState } from "react";
import "./DoctorAlerts.css";

type Alert = {
  id: number;
  title: string;
  severity: "Critical" | "Medium" | "Low";
  message: string;
  time: string;
  status: "Active" | "Acknowledged";
};

type Patient = {
  id: number;
  name: string;
  diagnosis: string;
  initials: string;
};

const patients: Patient[] = [
  {
    id: 1,
    name: "Bogdan Fona",
    diagnosis: "Asthma, Allergic Rhinitis",
    initials: "BF",
  },
  {
    id: 2,
    name: "Ana Staicu",
    diagnosis: "Type 2 Diabetes",
    initials: "AS",
  },
  {
    id: 3,
    name: "Alex Marin",
    diagnosis: "Heart Failure",
    initials: "AM",
  },
  {
    id: 4,
    name: "Alexandra Chiriac",
    diagnosis: "Hypertension",
    initials: "AC",
  },
];

const initialAlerts: Record<number, Alert[]> = {
  1: [
    {
      id: 1,
      title: "HeartRate Alert",
      severity: "Critical",
      message: "Heart rate exceeded threshold (118 bpm > 110 bpm)",
      time: "5 min ago",
      status: "Active",
    },
  ],

  2: [
    {
      id: 2,
      title: "SpO2 Alert",
      severity: "Medium",
      message: "SpO2 dropped below threshold (93% < 94%)",
      time: "20 min ago",
      status: "Active",
    },
  ],

  3: [],

  4: [],
};

const DoctorAlerts = () => {
  const [selectedPatient, setSelectedPatient] =
    useState<Patient>(patients[0]);

  const [search, setSearch] = useState("");

  const [alertsData, setAlertsData] =
    useState<Record<number, Alert[]>>(initialAlerts);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedAlerts =
    alertsData[selectedPatient.id] || [];

  const activeAlerts = selectedAlerts.filter(
    (alert) => alert.status === "Active"
  );

  const handleAcknowledge = (
    patientId: number,
    alertId: number
  ) => {
    setAlertsData((prev) => ({
      ...prev,
      [patientId]: prev[patientId].map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "Acknowledged",
            }
          : alert
      ),
    }));
  };

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">
        Alerts Overview
      </h1>

      <div className="alerts-layout">
        <div className="alerts-sidebar">
          <input
            type="text"
            placeholder="Search patients..."
            className="alerts-search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="alerts-sidebar-header">
            <span>Patients</span>

            <span className="patients-count">
              {filteredPatients.length}
            </span>
          </div>

          <div className="alerts-patient-list">
            {filteredPatients.map((patient) => {
              const patientAlerts =
                alertsData[patient.id] || [];

              const activeCount =
                patientAlerts.filter(
                  (a) => a.status === "Active"
                ).length;

              return (
                <div
                  key={patient.id}
                  className={`alert-patient-card ${
                    selectedPatient.id === patient.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedPatient(patient)
                  }
                >
                  <div className="patient-avatar">
                    {patient.initials}
                  </div>

                  <div className="patient-info">
                    <h3>{patient.name}</h3>

                    <p>{patient.diagnosis}</p>
                  </div>

                  {activeCount > 0 && (
                    <div className="patient-alert-count">
                      {activeCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="alerts-details">
          <div className="alerts-content">
            <div className="alerts-content-header">
              <h2>
                Alerts for{" "}
                <span>
                  {selectedPatient.name}
                </span>
              </h2>

              <div className="alerts-summary">
                <span className="active-count">
                  {activeAlerts.length} active
                </span>

                <span className="total-count">
                  {selectedAlerts.length} total
                </span>
              </div>
            </div>

            {selectedAlerts.length === 0 ? (
              <div className="empty-alerts-state">
                <div className="empty-icon">
                  <i className="bi bi-check-lg"></i>
                </div>

                <h2>
                  No alerts for this patient
                </h2>

                <p>
                  Everything looks normal.
                </p>
              </div>
            ) : (
              <div className="alerts-list">
                {selectedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card ${
                      alert.status ===
                      "Acknowledged"
                        ? "acknowledged"
                        : ""
                    }`}
                  >
                    <div className="alert-dot"></div>

                    <div className="alert-main">
                      <div className="alert-title-row">
                        <h3>{alert.title}</h3>

                        <span
                          className={`severity ${alert.severity.toLowerCase()}`}
                        >
                          {alert.severity}
                        </span>

                        {alert.status ===
                          "Acknowledged" && (
                          <span className="ack-badge">
                            Acknowledged
                          </span>
                        )}
                      </div>

                      <p>{alert.message}</p>

                      <span className="alert-time">
                        {alert.time}
                      </span>
                    </div>

                    {alert.status === "Active" && (
                      <button
                        className="ack-button"
                        onClick={() =>
                          handleAcknowledge(
                            selectedPatient.id,
                            alert.id
                          )
                        }
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAlerts;