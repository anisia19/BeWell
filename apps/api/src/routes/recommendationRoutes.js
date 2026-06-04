import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const {
    patient_id,
    recommendation_type,
    daily_duration_minutes,
    instructions,
  } = req.body;

  const doctorSql = `
    SELECT doctor_id
    FROM doctor_patient_assignments
    WHERE patient_id = ?
    LIMIT 1
  `;

  db.query(
    doctorSql,
    [patient_id],
    (doctorErr, doctorResult) => {
      if (doctorErr) {
        console.log(doctorErr);

        return res
          .status(500)
          .json(doctorErr);
      }

      if (doctorResult.length === 0) {
        return res.status(404).json({
          error:
            "No doctor assigned to patient",
        });
      }

      const doctor_id =
        doctorResult[0].doctor_id;

      const insertSql = `
        INSERT INTO recommendations
        (
          doctor_id,
          patient_id,
          recommendation_type,
          daily_duration_minutes,
          instructions,
          status
        )
        VALUES (?, ?, ?, ?, ?, 'active')
      `;

      db.query(
        insertSql,
        [
          doctor_id,
          patient_id,
          recommendation_type,
          daily_duration_minutes,
          instructions,
        ],
        (err, result) => {
          if (err) {
            console.log(err);

            return res
              .status(500)
              .json(err);
          }

          res.json({
            success: true,
          });
        }
      );
    }
  );
});

router.get("/:patientId", (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT
      recommendations.*,
      CONCAT(
        users.first_name,
        ' ',
        users.last_name
      ) AS doctor_name
    FROM recommendations
    JOIN users
    ON recommendations.doctor_id = users.id
    WHERE recommendations.patient_id = ?
  `;

  db.query(
    sql,
    [patientId],
    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

export default router;