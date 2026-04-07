import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { patient_id, ecg, temperature, humidity, pulse, recorded_at } = req.body;
    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id este obligatoriu' });
    }

    await db.query(
      `INSERT INTO sensor_readings 
        (patient_id, ecg, temperature, humidity, pulse, recorded_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, ecg, temperature, humidity, pulse, recorded_at || new Date()]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Eroare senzori:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:patient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sensor_readings 
       WHERE patient_id = ? 
       ORDER BY recorded_at DESC LIMIT 100`,
      [req.params.patient_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;