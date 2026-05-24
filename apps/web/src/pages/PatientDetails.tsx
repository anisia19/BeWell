import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PatientDetails.css";

type Recommendation = {
  id?: number;
  recommendation_type: string;
  instructions: string;
  doctor_name?: string;
};

const PatientDetails = () => {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState("overview");

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] = useState("");

  const [text, setText] = useState("");

  useEffect(() => {
    fetch(
      `http://localhost:3001/api/recommendations/${id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data);
      })
      .catch((err) =>
        console.error(
          "Error fetching recommendations:",
          err
        )
      );
  }, [id]);

  const addRecommendation = async () => {
    if (!title || !text) return;

    try {
      await fetch(
        "http://localhost:3001/api/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            patient_id: Number(id),
            recommendation_type: title,
            daily_duration_minutes: 30,
            instructions: text,
          }),
        }
      );

      const updated =
        await fetch(
          `http://localhost:3001/api/recommendations/${id}`
        );

      const data = await updated.json();

      setRecommendations(data);

      setTitle("");
      setText("");

      setShowForm(false);
    } catch (err) {
      console.error(
        "Error adding recommendation:",
        err
      );
    }
  };

  return (
    <div className="patient-details-page">
      <div className="patient-header">
        <div>
          <h1>Alexandra Chiriac</h1>

          <p>
            Hypertension • 23 years old
          </p>
        </div>

        <span className="patient-status">
          Active
        </span>
      </div>

      <div className="tabs-container">
        <button
          className={
            activeTab === "overview"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("overview")
          }
        >
          Overview
        </button>

        <button
          className={
            activeTab === "alerts"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("alerts")}
        >
          Alerts
        </button>

        <button
          className={
            activeTab ===
            "recommendations"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab(
              "recommendations"
            )
          }
        >
          Recommendations
        </button>

        <button
          className={
            activeTab === "thresholds"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("thresholds")
          }
        >
          Thresholds
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="details-grid">
          <div className="details-card">
            <h2>Heart Rate</h2>

            <p className="big-value">
              78 BPM
            </p>
          </div>

          <div className="details-card">
            <h2>SpO2</h2>

            <p className="big-value">
              98%
            </p>
          </div>

          <div className="details-card">
            <h2>Temperature</h2>

            <p className="big-value">
              36.8°C
            </p>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="section-card">
          <h2>Patient Alerts</h2>

          <p>No active alerts.</p>
        </div>
      )}

      {activeTab ===
        "recommendations" && (
        <div className="section-card">
          <div className="recommendations-header">
            <h2>Recommendations</h2>

            <button
              className="new-btn"
              onClick={() =>
                setShowForm(true)
              }
            >
              + New
            </button>
          </div>

          {showForm && (
            <div className="recommendation-form">
              <input
                type="text"
                placeholder="Recommendation title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Write recommendation..."
                value={text}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
              />

              <button
                onClick={
                  addRecommendation
                }
              >
                Add Recommendation
              </button>
            </div>
          )}

          {recommendations.length ===
          0 ? (
            <div className="empty-recommendations">
              <i className="bi bi-clipboard2-heart"></i>

              <p>
                No recommendations yet.
              </p>
            </div>
          ) : (
            recommendations.map(
              (recommendation) => (
                <div
                  className="recommendation-item"
                  key={
                    recommendation.id
                  }
                >
                  <h3>
                    {
                      recommendation.recommendation_type
                    }
                  </h3>

                  <p>
                    {
                      recommendation.instructions
                    }
                  </p>

                  <span className="recommendation-doctor">
                    Added by{" "}
                    {
                      recommendation.doctor_name
                    }
                  </span>
                </div>
              )
            )
          )}
        </div>
      )}

      {activeTab === "thresholds" && (
        <div className="section-card">
          <h2>Thresholds</h2>

          <p>
            Heart Rate max: 110 BPM
          </p>

          <p>SpO2 min: 94%</p>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;