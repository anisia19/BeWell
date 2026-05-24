import { useState } from "react";
import "./PatientAlerts.css";

const initialAlerts = [
  {
    id: 1,
    title: "HeartRate Alert",
    severity: "Critical",
    message: "Heart rate exceeded upper threshold (118 bpm > 110 bpm)",
    time: "30m ago",
    color: "critical",
  },
  {
    id: 2,
    title: "SpO2 Alert",
    severity: "Medium",
    message: "SpO2 dropped below lower threshold (93.2% < 94%)",
    time: "1h ago",
    color: "medium",
  },
  {
    id: 3,
    title: "Temperature Alert",
    severity: "Low",
    message: "Temperature slightly elevated (37.9°C > 37.5°C)",
    time: "3h ago",
    color: "low",
  },
];

const PatientAlerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleAcknowledge = (alert: any) => {
    setHistory([
      {
        ...alert,
        acknowledgedAt: new Date().toLocaleString(),
      },
      ...history,
    ]);

    setAlerts(alerts.filter((a) => a.id !== alert.id));
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>My Alerts</h1>

        <div className="header-top">
          <p>{alerts.length} active alerts</p>

          <button
            className="history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
      </div>

      <div className="alerts-container">
        {alerts.map((alert) => (
          <div className="alert-card" key={alert.id}>
            <div className="alert-left">
              <div className={`alert-dot ${alert.color}`}></div>

              <div className="alert-content">
                <div className="alert-top">
                  <h3>{alert.title}</h3>

                  <span className={`badge ${alert.color}`}>
                    {alert.severity}
                  </span>
                </div>

                <p>{alert.message}</p>

                <span className="alert-time">{alert.time}</span>
              </div>
            </div>

            <button
              className="ack-btn"
              onClick={() => handleAcknowledge(alert)}
            >
              Acknowledge
            </button>
          </div>
        ))}
      </div>

      {showHistory && (
        <>
          <div className="alerts-header history-header">
            <h1>Alert History</h1>
            <p>Acknowledged alerts from the last 7 days</p>
          </div>

          <div className="alerts-container">
            {history.length === 0 ? (
              <p>No acknowledged alerts yet.</p>
            ) : (
              history.map((alert, index) => (
                <div className="alert-card history-card" key={index}>
                  <div className="alert-left">
                    <div className={`alert-dot ${alert.color}`}></div>

                    <div className="alert-content">
                      <div className="alert-top">
                        <h3>{alert.title}</h3>

                        <span className={`badge ${alert.color}`}>
                          {alert.severity}
                        </span>
                      </div>

                      <p>{alert.message}</p>

                      <span className="alert-time">
                        Acknowledged: {alert.acknowledgedAt}
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