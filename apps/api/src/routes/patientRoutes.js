import express from "express";
import {
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} from "../controllers/patientController.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async(req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.cnp,
        p.age,
        p.gender,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        mp.medical_history,
        mp.allergies,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        CASE 
          WHEN u.is_active = 1 THEN 'Active'
          ELSE 'Inactive'
        END AS status,
        CONCAT_WS(', ', mp.medical_history, mp.allergies) AS diagnosis
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN patient_medical_profiles mp ON mp.patient_id = p.id
      WHERE u.role = 'PATIENT'
    `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching patients:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;