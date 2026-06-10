import express from "express";
import {
    getAllSensorReadings,
    getSensorReadingsByPatient,
    getSensorReadingsWindow,
    getNewSensorReadingsByPatientId,
    getSensorReadingsByUserId,
    getNewSensorReadingsByUserId,
} from "../services/sensorReadings.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const readings = await getAllSensorReadings(limit, offset);
        res.json(readings);
    } catch (error) {
        console.error("GET sensor readings error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

router.get("/patient/:patientId", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const readings = await getSensorReadingsByPatient(req.params.patientId, limit, offset);
        res.json(readings);
    } catch (error) {
        console.error("GET sensor readings by patient error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

router.get("/patient/:patientId/window", async (req, res) => {
    const minutes = parseInt(req.query.minutes) || 10;
    try {
        const readings = await getSensorReadingsWindow(req.params.patientId, minutes);
        res.json(readings);
    } catch (error) {
        console.error("GET window sensor readings error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

router.get("/patient/:patientId/latest", async (req, res) => {
    const afterId = parseInt(req.query.afterId);
    if (isNaN(afterId)) {
        return res.status(400).json({ error: "Missing or invalid 'afterId' query param" });
    }
    try {
        const readings = await getNewSensorReadingsByPatientId(req.params.patientId, afterId);
        res.json(readings);
    } catch (error) {
        console.error("GET latest sensor readings by patient error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

router.get("/user/:userId", async (req, res) => {
    const limit = parseInt(req.query.limit) || 60;
    try {
        const readings = await getSensorReadingsByUserId(req.params.userId, limit);
        res.json(readings);
    } catch (error) {
        console.error("GET sensor readings by user error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

router.get("/user/:userId/latest", async (req, res) => {
    const { after } = req.query;
    if (!after) {
        return res.status(400).json({ error: "Missing 'after' query param" });
    }
    try {
        const readings = await getNewSensorReadingsByUserId(req.params.userId, after);
        res.json(readings);
    } catch (error) {
        console.error("GET latest sensor readings by user error:", error);
        res.status(500).json({ error: "Could not fetch sensor readings" });
    }
});

export default router;
