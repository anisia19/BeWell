import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/patient/:patientId", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*,
                CONCAT(u.first_name, ' ', u.last_name) AS doctor_name
            FROM alerts a
            LEFT JOIN users u ON u.id = a.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.triggered_at DESC
        `, [req.params.patientId]);
        res.json(rows);
    } catch (error) {
        console.error("GET alerts error:", error);
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*,
                CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
            FROM alerts a
            JOIN patients p ON p.id = a.patient_id
            LEFT JOIN users d ON d.id = a.doctor_id
            WHERE p.user_id = ?
            ORDER BY a.triggered_at DESC
        `, [req.params.userId]);
        res.json(rows);
    } catch (error) {
        console.error("GET alerts by user error:", error);
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

router.post("/", async (req, res) => {
    const { patient_id, doctor_id, severity, message, rule_id } = req.body;
    if (!patient_id || !severity || !message) {
        return res.status(400).json({ error: "patient_id, severity and message are required" });
    }
    try {
        const [result] = await pool.query(`
            INSERT INTO alerts (patient_id, doctor_id, rule_id, triggered_at, severity, status, message)
            VALUES (?, ?, ?, NOW(), ?, 'ACTIVE', ?)
        `, [patient_id, doctor_id || null, rule_id || null, severity, message]);
        const [rows] = await pool.query(
            "SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS doctor_name FROM alerts a LEFT JOIN users u ON u.id = a.doctor_id WHERE a.id = ?",
            [result.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("POST alert error:", error);
        res.status(500).json({ error: "Failed to create alert" });
    }
});

router.put("/:id/acknowledge", async (req, res) => {
    try {
        await pool.query(
            "UPDATE alerts SET status = 'RESOLVED', resolved_at = NOW() WHERE id = ?",
            [req.params.id]
        );
        res.json({ message: "Alert acknowledged" });
    } catch (error) {
        console.error("PUT alert error:", error);
        res.status(500).json({ error: "Failed to acknowledge alert" });
    }
});

export default router;
