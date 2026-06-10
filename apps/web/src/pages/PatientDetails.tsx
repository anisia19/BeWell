import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PatientDetails.css";

type PatientData = {
  first_name: string;
  last_name: string;
  age: number | null;
  gender: string;
  medical_history: string | null;
  allergies: string | null;
};

type Alert = {
  id: number;
  severity: string;
  status: string;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
  doctor_name?: string;
};

type Recommendation = {
  id?: number;
  recommendation_type: string;
  instructions: string;
  doctor_name?: string;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });

const PatientDetails = () => {
  const { id } = useParams();

  const [patient, setPatient] = useState<PatientData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("MEDIUM");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/api/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data))
      .catch((err) => console.error("Error fetching patient:", err));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/recommendations/${id}`)
      .then((res) => res.json())
      .then(setRecommendations)
      .catch((err) => console.error("Error fetching recommendations:", err));
  }, [id]);

  useEffect(() => {
    if (activeTab !== "alerts") return;
    setIsLoadingAlerts(true);
    fetch(`http://localhost:3001/api/alerts/patient/${id}`)
      .then((res) => res.json())
      .then(setAlerts)
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setIsLoadingAlerts(false));
  }, [activeTab, id]);

  const addRecommendation = async () => {
    if (!title || !text) return;
    try {
      await fetch("http://localhost:3001/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: Number(id),
          recommendation_type: title,
          daily_duration_minutes: 30,
          instructions: text,
        }),
      });
      const updated = await fetch(`http://localhost:3001/api/recommendations/${id}`);
      setRecommendations(await updated.json());
      setTitle("");
      setText("");
      setShowForm(false);
    } catch (err) {
      console.error("Error adding recommendation:", err);
    }
  };

  const addAlert = async () => {
    if (!alertMessage.trim()) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsSubmittingAlert(true);
    try {
      const res = await fetch("http://localhost:3001/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: Number(id),
          doctor_id: user.id || null,
          severity: alertSeverity,
          message: alertMessage,
        }),
      });
      const newAlert: Alert = await res.json();
      setAlerts((prev) => [newAlert, ...prev]);
      setAlertMessage("");
      setAlertSeverity("MEDIUM");
      setShowAlertForm(false);
    } catch (err) {
      console.error("Error adding alert:", err);
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, { method: "PUT" });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "RESOLVED", resolved_at: new Date().toISOString() } : a
        )
      );
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "Loading...";
  const patientSummary = patient
    ? `${patient.medical_history || patient.allergies || "No diagnosis"} • ${patient.age ?? "?"} years old`
    : "";

  return (
    <div className="patient-details-page">
      <div className="patient-header">
        <div>
          <h1>{patientName}</h1>
          <p>{patientSummary}</p>
        </div>
        <span className="patient-status">Active</span>
      </div>

      <div className="tabs-container">
        <button
          className={activeTab === "overview" ? "tab active" : "tab"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "alerts" ? "tab active" : "tab"}
          onClick={() => setActiveTab("alerts")}
        >
          Alerts
        </button>
        <button
          className={activeTab === "recommendations" ? "tab active" : "tab"}
          onClick={() => setActiveTab("recommendations")}
        >
          Recommendations
        </button>
        <button
          className={activeTab === "thresholds" ? "tab active" : "tab"}
          onClick={() => setActiveTab("thresholds")}
        >
          Thresholds
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="details-grid">
          <div className="details-card">
            <h2>Heart Rate</h2>
            <p className="big-value">78 BPM</p>
          </div>
          <div className="details-card">
            <h2>SpO2</h2>
            <p className="big-value">98%</p>
          </div>
          <div className="details-card">
            <h2>Temperature</h2>
            <p className="big-value">36.8°C</p>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="section-card">
          <div className="recommendations-header">
            <h2>Alerts</h2>
            <button className="new-btn" onClick={() => setShowAlertForm((v) => !v)}>
              {showAlertForm ? "Cancel" : "+ New Alert"}
            </button>
          </div>

          {showAlertForm && (
            <div className="recommendation-form">
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "8px" }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <textarea
                placeholder="Alert message..."
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
              />
              <button onClick={addAlert} disabled={isSubmittingAlert}>
                {isSubmittingAlert ? "Adding..." : "Add Alert"}
              </button>
            </div>
          )}

          {isLoadingAlerts ? (
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <div className="empty-recommendations">
              <i className="bi bi-check-circle"></i>
              <p>No alerts for this patient.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="recommendation-item"
                style={{ opacity: alert.status === "RESOLVED" ? 0.5 : 1 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0 }}>{alert.message}</h3>
                  <span
                    style={{
                      background: alert.severity === "CRITICAL" ? "#fee2e2" : alert.severity === "MEDIUM" ? "#fef3c7" : "#dcfce7",
                      color: alert.severity === "CRITICAL" ? "#dc2626" : alert.severity === "MEDIUM" ? "#92400e" : "#15803d",
                      borderRadius: "999px",
                      padding: "2px 10px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    {alert.severity}
                  </span>
                  {alert.status === "RESOLVED" && (
                    <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Resolved</span>
                  )}
                </div>
                <span className="recommendation-doctor">
                  {formatTime(alert.triggered_at)}
                  {alert.doctor_name ? ` · Dr. ${alert.doctor_name}` : ""}
                </span>
                {alert.status === "ACTIVE" && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    style={{
                      marginTop: "8px",
                      background: "#f8fafc",
                      border: "1px solid #d9e5e8",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="section-card">
          <div className="recommendations-header">
            <h2>Recommendations</h2>
            <button className="new-btn" onClick={() => setShowForm(true)}>
              + New
            </button>
          </div>

          {showForm && (
            <div className="recommendation-form">
              <input
                type="text"
                placeholder="Recommendation title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Write recommendation..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button onClick={addRecommendation}>Add Recommendation</button>
            </div>
          )}

          {recommendations.length === 0 ? (
            <div className="empty-recommendations">
              <i className="bi bi-clipboard2-heart"></i>
              <p>No recommendations yet.</p>
            </div>
          ) : (
            recommendations.map((recommendation) => (
              <div className="recommendation-item" key={recommendation.id}>
                <h3>{recommendation.recommendation_type}</h3>
                <p>{recommendation.instructions}</p>
                <span className="recommendation-doctor">
                  Added by {recommendation.doctor_name}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "thresholds" && (
        <div className="section-card">
          <h2>Thresholds</h2>
          <p>Heart Rate max: 110 BPM</p>
          <p>SpO2 min: 94%</p>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
