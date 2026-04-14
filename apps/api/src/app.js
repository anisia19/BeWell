import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes.js';
import accelerometerRoutes from './routes/accelerometerRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'API works ✅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/accelerometer-readings', accelerometerRoutes);
app.use('/api/sensor-readings', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/alert-notes', alertRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/recommendation-schedules', recommendationRoutes);

export default app;