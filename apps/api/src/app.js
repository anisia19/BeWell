import express from "express";
import cors from "cors";

import patientRoutes from "./routes/patientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import adminPatientsRoutes from "./routes/adminPatients.routes.js";
<<<<<<< HEAD
import alertRoutes from "./routes/alertRoutes.js";
=======
import sensorReadingsRoutes from "./routes/sensorReadings.routes.js";
>>>>>>> 515d669292e9aad49f0eb07b4a2e5977859eb51a

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "API works 🚀",
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/admin", adminPatientsRoutes);

app.use("/api/recommendations", recommendationRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/sensor-readings", sensorReadingsRoutes);

export default app;