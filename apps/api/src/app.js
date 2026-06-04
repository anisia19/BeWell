import express from "express";
import cors from "cors";

import patientRoutes from "./routes/patientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

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

app.use(
  "/api/recommendations",
  recommendationRoutes
);

export default app;