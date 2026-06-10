import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@chakra-ui/react";
import "./DoctorAlerts.css";

type Patient = {
  id: number;
  name: string;
  diagnosis: string | null;
  alertsCount: number;
};

type Alert = {
  id: number;
  patient_id: number;
  doctor_id: number | null;
  rule_id: number | null;
  triggered_at: string;
  resolved_at: string | null;
  severity: string;
  status: string;
  message: string;
  doctor_name?: string;
};

const LIMIT = 10;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });
};

const initials = (name: string) => {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const DoctorAlerts = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFetchingPatients, setIsFetchingPatients] = useState(false);
  const [hasMorePatients, setHasMorePatients] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const searchRef = useRef("");
  const listContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMorePatients = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingPatients(true);
    try {
      const s = searchRef.current;
      const url = `http://localhost:3001/api/patients?limit=${LIMIT}&offset=${offsetRef.current}${s ? `&search=${encodeURIComponent(s)}` : ""}`;
      const res = await fetch(url);
      const data: Patient[] = await res.json();
      setPatients((prev) => {
        const updated = [...prev, ...data];
        if (prev.length === 0 && data.length > 0) {
          setSelectedPatient(data[0]);
        }
        return updated;
      });
      offsetRef.current += data.length;
      if (data.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMorePatients(false);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      isFetchingRef.current = false;
      setIsFetchingPatients(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    searchRef.current = debouncedSearch;
    setPatients([]);
    setSelectedPatient(null);
    offsetRef.current = 0;
    hasMoreRef.current = true;
    isFetchingRef.current = false;
    setHasMorePatients(true);
    loadMorePatients();
  }, [debouncedSearch, loadMorePatients]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = listContainerRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMorePatients();
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMorePatients]);

  useEffect(() => {
    if (!selectedPatient) return;
    setIsLoadingAlerts(true);
    fetch(`http://localhost:3001/api/alerts/patient/${selectedPatient.id}`)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setIsLoadingAlerts(false));
  }, [selectedPatient]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, {
        method: "PUT",
      });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "RESOLVED", resolved_at: new Date().toISOString() } : a
        )
      );
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts Overview</h1>

      <div className="alerts-layout">
        <div className="alerts-sidebar">
          <input
            type="text"
            placeholder="Search patients..."
            className="alerts-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="alerts-sidebar-header">
            <span>Patients</span>
            <span className="patients-count">{patients.length}</span>
          </div>

          <div className="alerts-patient-list-container" ref={listContainerRef}>
            <div className="alerts-patient-list">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`alert-patient-card ${selectedPatient?.id === patient.id ? "selected" : ""}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="patient-avatar">{initials(patient.name)}</div>

                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p>{patient.diagnosis || "No diagnosis"}</p>
                  </div>

                  {patient.alertsCount > 0 && (
                    <div className="patient-alert-count">{patient.alertsCount}</div>
                  )}
                </div>
              ))}
            </div>

            <div ref={sentinelRef} style={{ padding: "8px", textAlign: "center" }}>
              {isFetchingPatients && <Spinner size="sm" color="cyan.500" />}
              {!hasMorePatients && patients.length > 0 && (
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>All loaded</span>
              )}
            </div>
          </div>
        </div>

        <div className="alerts-details">
          {!selectedPatient ? (
            <div className="empty-alerts-state">
              <div className="empty-icon"><i className="bi bi-person-lines-fill"></i></div>
              <h2>Select a patient</h2>
              <p>Choose a patient from the list to view their alerts.</p>
            </div>
          ) : (
            <div className="alerts-content">
              <div className="alerts-content-header">
                <h2>
                  Alerts for <span>{selectedPatient.name}</span>
                </h2>
                <div className="alerts-summary">
                  <span className="active-count">{activeAlerts.length} active</span>
                  <span className="total-count">{alerts.length} total</span>
                </div>
              </div>

              {isLoadingAlerts ? (
                <div style={{ textAlign: "center", paddingTop: "3rem" }}>
                  <Spinner color="cyan.500" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="empty-alerts-state">
                  <div className="empty-icon"><i className="bi bi-check-lg"></i></div>
                  <h2>No alerts for this patient</h2>
                  <p>Everything looks normal.</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-card ${alert.status === "RESOLVED" ? "acknowledged" : ""}`}
                    >
                      <div className="alert-dot"></div>

                      <div className="alert-main">
                        <div className="alert-title-row">
                          <h3>{alert.message}</h3>
                          <span className={`severity ${alert.severity.toLowerCase()}`}>
                            {alert.severity}
                          </span>
                          {alert.status === "RESOLVED" && (
                            <span className="ack-badge">Resolved</span>
                          )}
                        </div>

                        {alert.doctor_name && (
                          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                            Added by Dr. {alert.doctor_name}
                          </p>
                        )}

                        <span className="alert-time">{formatTime(alert.triggered_at)}</span>
                      </div>

                      {alert.status === "ACTIVE" && (
                        <button
                          className="ack-button"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAlerts;
