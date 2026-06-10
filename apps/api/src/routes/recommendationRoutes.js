import express from "express";
import db from "../config/db.js";

const router = express.Router();

// ========================================
// CREATE RECOMMENDATION
// ========================================

router.post("/", async (req, res) => {
  try {
    const {
      doctor_id,
      patient_id,
      recommendation_type,
      recommendation_description,
    } = req.body;

    console.log("POST RECOMMENDATION");
    console.log(req.body);

    if (
      !doctor_id ||
      !patient_id ||
      !recommendation_type ||
      !recommendation_description
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO recommendations
      (
        doctor_id,
        patient_id,
        recommendation_type,
        recommendation_description
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        doctor_id,
        patient_id,
        recommendation_type,
        recommendation_description,
      ]
    );

    res.status(201).json({
      success: true,
      recommendation_id: result.insertId,
    });

  } catch (error) {
    console.error("CREATE RECOMMENDATION ERROR:", error);

    res.status(500).json({
      error: "Failed to create recommendation",
    });
  }
});

// ========================================
// GET RECOMMENDATIONS FOR PATIENT
// ========================================

router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.patient_id,
        r.doctor_id,
        r.recommendation_type,
        r.recommendation_description,
        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS doctor_name
      FROM recommendations r
      JOIN users u
        ON r.doctor_id = u.id
      WHERE r.patient_id = ?
      ORDER BY r.id DESC
      `,
      [patientId]
    );

    res.json(rows);

  } catch (error) {
    console.error("GET RECOMMENDATIONS ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch recommendations",
    });
  }
});

export default router;