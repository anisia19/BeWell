import express from "express";
import {
    createPatient,
    getPatients,
} from "../services/adminPatients.service.js";

const router = express.Router();

router.get("/patients", async(req, res) => {
    try {
        const patients = await getPatients();
        res.json(patients);
    } catch (error) {
        console.error("GET patients error:", error);
        res.status(500).json({ error: "Could not fetch patients" });
    }
});


router.post("/patients", async(req, res) => {
    try {
        const patient = await createPatient(req.body);
        res.status(201).json({ patient });
    } catch (error) {
        console.error("POST patient error:", error);

        if (error.code === "DUPLICATE_EMAIL") {
            return res.status(409).json({ error: "Email already exists" });
        }

        if (error.code === "DUPLICATE_CNP") {
            return res.status(409).json({ error: "CNP already exists" });
        }

        res.status(500).json({ error: "Could not create patient" });
    }
});

export default router;