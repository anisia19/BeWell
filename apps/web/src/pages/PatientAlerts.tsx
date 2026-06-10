import { useEffect, useState } from "react";
import "./PatientAlerts.css";

type Alert = {
  id: number;
  severity: string;
  status: string;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
  doctor_name?: string;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });

const PatientAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    fetch(`http://localhost:3001/api/alerts/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAcknowledge = async (alert: Alert) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alert.id}/acknowledge`, {
        method: "PUT",
      });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id
            ? { ...a, status: "RESOLVED", resolved_at: new Date().toISOString() }
            : a
        )
      );
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED");

  if (isLoading) {
    return (
      <div className="alerts-page">
        <div className="alerts-header">
          <h1>My Alerts</h1>
        </div>
        <p style={{ color: "#6b7280" }}>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>My Alerts</h1>

        <div className="header-top">
          <p>{activeAlerts.length} active alerts</p>

          <button
            className="history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
      </div>

      <div className="alerts-container">
        {activeAlerts.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No active alerts. Everything looks good!</p>
        ) : (
          activeAlerts.map((alert) => (
            <div className="alert-card" key={alert.id}>
              <div className="alert-left">
                <div className={`alert-dot ${alert.severity.toLowerCase()}`}></div>

                <div className="alert-content">
                  <div className="alert-top">
                    <h3>{alert.message}</h3>
                    <span className={`badge ${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>

                  {alert.doctor_name && (
                    <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "2px 0" }}>
                      From Dr. {alert.doctor_name}
                    </p>
                  )}

                  <span className="alert-time">{formatTime(alert.triggered_at)}</span>
                </div>
              </div>

              <button className="ack-btn" onClick={() => handleAcknowledge(alert)}>
                Acknowledge
              </button>
            </div>
          ))
        )}
      </div>

      {showHistory && (
        <>
          <div className="alerts-header history-header">
            <h1>Alert History</h1>
            <p>Resolved alerts</p>
          </div>

          <div className="alerts-container">
            {resolvedAlerts.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No resolved alerts yet.</p>
            ) : (
              resolvedAlerts.map((alert) => (
                <div className="alert-card history-card" key={alert.id}>
                  <div className="alert-left">
                    <div className={`alert-dot ${alert.severity.toLowerCase()}`}></div>

                    <div className="alert-content">
                      <div className="alert-top">
                        <h3>{alert.message}</h3>
                        <span className={`badge ${alert.severity.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      </div>

                      {alert.doctor_name && (
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "2px 0" }}>
                          From Dr. {alert.doctor_name}
                        </p>
                      )}

                      <span className="alert-time">
                        Resolved: {alert.resolved_at ? formatTime(alert.resolved_at) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientAlerts;
