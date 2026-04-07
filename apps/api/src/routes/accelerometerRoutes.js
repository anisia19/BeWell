import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { patient_id, readings } = req.body;
    if (!patient_id || !readings || !Array.isArray(readings)) {
      return res.status(400).json({ error: 'patient_id si readings sunt obligatorii' });
    }

   const values = readings.map(r => [
  patient_id,
  1,
  r.x,
  r.y,
  r.z,
  new Date(r.timestamp || new Date())
]);

    await db.query(
      'INSERT INTO accelerometer_readings (patient_id, smartphone_id, x_value, y_value, z_value, recorded_at) VALUES ?',
      [values]
    );

    res.json({ success: true, count: readings.length });
  } catch (error) {
    console.error('Eroare accelerometru:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:patient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM accelerometer_readings WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 100',
      [req.params.patient_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;