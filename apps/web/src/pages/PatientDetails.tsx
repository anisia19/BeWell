import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AllChartsData from "../components/AllChartsData";
import "./PatientDetails.css";

const API_BASE = "http://localhost:3001";

interface Thresholds {
  normal_pulse_min: string;
  normal_pulse_max: string;
  normal_ecg_min: string;
  normal_ecg_max: string;
  normal_temperature_min: string;
  normal_temperature_max: string;
  normal_humidity_min: string;
  normal_humidity_max: string;
}

const emptyThresholds = (): Thresholds => ({
  normal_pulse_min: "",
  normal_pulse_max: "",
  normal_ecg_min: "",
  normal_ecg_max: "",
  normal_temperature_min: "",
  normal_temperature_max: "",
  normal_humidity_min: "",
  normal_humidity_max: "",
});

type PatientData = {
  first_name: string;
  last_name: string;
  age: number | null;
  cnp: string | null;
  gender: string;
  medical_history: string | null;
  allergies: string | null;
};

const calculateAgeFromCNP = (cnp: string | null): number | null => {
  if (!cnp || cnp.length !== 13 || !/^\d{13}$/.test(cnp)) return null;
  const s = parseInt(cnp[0]);
  const year2 = parseInt(cnp.substring(1, 3));
  const month = parseInt(cnp.substring(3, 5));
  const day = parseInt(cnp.substring(5, 7));

  let century: number;
  if (s === 1 || s === 2) century = 1900;
  else if (s === 3 || s === 4) century = 1800;
  else if (s === 5 || s === 6) century = 2000;
  else if (s === 7 || s === 8) century = 1900;
  else return null;

  const birthDate = new Date(century + year2, month - 1, day);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
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
  const [thresholds, setThresholds] = useState<Thresholds>(emptyThresholds());
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data))
      .catch((err) => console.error("Error fetching patient:", err));
  }, [id]);

  useEffect(() => {
    fetch(`${API_BASE}/api/recommendations/${id}`)
      .then((res) => res.json())
      .then(setRecommendations)
      .catch((err) => console.error("Error fetching recommendations:", err));
  }, [id]);

  useEffect(() => {
    fetch(`${API_BASE}/api/patients/${id}/thresholds`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setThresholds({
            normal_pulse_min: data.normal_pulse_min ?? "",
            normal_pulse_max: data.normal_pulse_max ?? "",
            normal_ecg_min: data.normal_ecg_min ?? "",
            normal_ecg_max: data.normal_ecg_max ?? "",
            normal_temperature_min: data.normal_temperature_min ?? "",
            normal_temperature_max: data.normal_temperature_max ?? "",
            normal_humidity_min: data.normal_humidity_min ?? "",
            normal_humidity_max: data.normal_humidity_max ?? "",
          });
        }
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (activeTab !== "alerts") return;
    setIsLoadingAlerts(true);
    fetch(`${API_BASE}/api/alerts/patient/${id}`)
      .then((res) => res.json())
      .then(setAlerts)
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setIsLoadingAlerts(false));
  }, [activeTab, id]);

  const saveThresholds = async () => {
    try {
      await fetch(`${API_BASE}/api/patients/${id}/thresholds`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thresholds),
      });
      setThresholdsSaved(true);
      setTimeout(() => setThresholdsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving thresholds:", err);
    }
  };

  const handleThresholdChange = (field: keyof Thresholds, value: string) => {
    setThresholds((prev) => ({ ...prev, [field]: value }));
  };

  const addRecommendation = async () => {
    if (!title || !text) return;
    try {
      await fetch(`${API_BASE}/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: Number(id),
          recommendation_type: title,
          daily_duration_minutes: 30,
          instructions: text,
        }),
      });
      const updated = await fetch(`${API_BASE}/api/recommendations/${id}`);
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
      const res = await fetch(`${API_BASE}/api/alerts`, {
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
      await fetch(`${API_BASE}/api/alerts/${alertId}/acknowledge`, { method: "PUT" });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "RESOLVED", resolved_at: new Date().toISOString() } : a
        )
      );
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const patientAge = patient
    ? (patient.age ?? calculateAgeFromCNP(patient.cnp))
    : null;

  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "Loading...";

  const patientSummary = patient
    ? `${patient.medical_history || patient.allergies || "No diagnosis"} • ${patientAge ?? "?"} years old`
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
        <AllChartsData patientId={Number(id)} />
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
          <div className="recommendations-header">
            <h2>Patient Thresholds</h2>
            <button className="new-btn" onClick={saveThresholds}>
              {thresholdsSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
          <p style={{ color: "#6b7280", marginBottom: 24, fontSize: "0.95rem" }}>
            Define the normal range for each vital. Values outside this range will be flagged as Low or High.
          </p>

          <div className="thresholds-grid">
            <div className="threshold-group">
              <h3>Heart Rate (BPM)</h3>
              <div className="threshold-row">
                <label>Min</label>
                <input type="number" placeholder="e.g. 60" value={thresholds.normal_pulse_min}
                  onChange={(e) => handleThresholdChange("normal_pulse_min", e.target.value)} />
                <label>Max</label>
                <input type="number" placeholder="e.g. 100" value={thresholds.normal_pulse_max}
                  onChange={(e) => handleThresholdChange("normal_pulse_max", e.target.value)} />
              </div>
            </div>

            <div className="threshold-group">
              <h3>ECG Amplitude (mV)</h3>
              <div className="threshold-row">
                <label>Min</label>
                <input type="number" step="0.01" placeholder="e.g. 0" value={thresholds.normal_ecg_min}
                  onChange={(e) => handleThresholdChange("normal_ecg_min", e.target.value)} />
                <label>Max</label>
                <input type="number" step="0.01" placeholder="e.g. 1.0" value={thresholds.normal_ecg_max}
                  onChange={(e) => handleThresholdChange("normal_ecg_max", e.target.value)} />
              </div>
            </div>

            <div className="threshold-group">
              <h3>Temperature (°C)</h3>
              <div className="threshold-row">
                <label>Min</label>
                <input type="number" step="0.1" placeholder="e.g. 36.1" value={thresholds.normal_temperature_min}
                  onChange={(e) => handleThresholdChange("normal_temperature_min", e.target.value)} />
                <label>Max</label>
                <input type="number" step="0.1" placeholder="e.g. 37.2" value={thresholds.normal_temperature_max}
                  onChange={(e) => handleThresholdChange("normal_temperature_max", e.target.value)} />
              </div>
            </div>

            <div className="threshold-group">
              <h3>Humidity (%)</h3>
              <div className="threshold-row">
                <label>Min</label>
                <input type="number" placeholder="e.g. 30" value={thresholds.normal_humidity_min}
                  onChange={(e) => handleThresholdChange("normal_humidity_min", e.target.value)} />
                <label>Max</label>
                <input type="number" placeholder="e.g. 60" value={thresholds.normal_humidity_max}
                  onChange={(e) => handleThresholdChange("normal_humidity_max", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
