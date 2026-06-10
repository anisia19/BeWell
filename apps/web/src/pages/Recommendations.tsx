import { useEffect, useState } from "react";
import "./Recommendations.css";

type Recommendation = {
  id?: number;
  recommendation_type: string;
  recommendation_description: string;
  doctor_name?: string;
};

const Recommendations = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [patientId, setPatientId] =
    useState<number | null>(null);

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/patients/by-user/${user.id}`
        );

       const patient = await response.json();

console.log("PATIENT =", patient);

setPatientId(patient.patientId)
      } catch (err) {
        console.error(
          "Error loading patient:",
          err
        );
      }
    };

    loadPatient();
  }, [user.id]);

  useEffect(() => {
    console.log("PATIENT ID =", patientId);
    if (!patientId) return;

    fetch(
      `http://localhost:3001/api/recommendations/${patientId}`
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
  }, [patientId]);

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Recommendations</h1>

        <p>
          Recommendations provided by your
          doctor
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-recommendations">
          <div className="empty-icon">
            🩺
          </div>

          <h2>No recommendations yet</h2>

          <p>
            Your doctor has not added any
            recommendations yet.
          </p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map(
            (recommendation) => (
              <div
                className="recommendation-card"
                key={recommendation.id}
              >
                <div className="recommendation-top">
                  <h3>
                    {
                      recommendation.recommendation_type
                    }
                  </h3>
                </div>

                <p>
                  {
                    recommendation.recommendation_description
                  }
                </p>

                <span className="doctor-badge">
                  {recommendation.doctor_name ||
                    "Doctor"}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Recommendations;