import express from "express";
import {
    getAllPatients,
    getPatientById,
    getPatientByUserId,
    getPatientThresholds,
    updatePatientThresholds,
    createPatient,
    updatePatient,
    deletePatient,
} from "../controllers/patientController.js";

const router = express.Router();

router.get("/", getAllPatients);
router.get("/by-user/:userId", getPatientByUserId);
router.get("/:id/thresholds", getPatientThresholds);
router.put("/:id/thresholds", updatePatientThresholds);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;