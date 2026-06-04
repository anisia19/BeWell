import { useEffect, useState } from "react";
import "./Recommendations.css";

type Recommendation = {
  id?: number;
  recommendation_type: string;
  instructions: string;
  doctor_name?: string;
};

const Recommendations = () => {
  const patientId = 1;

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  useEffect(() => {
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
  }, []);

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
                    recommendation.instructions
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