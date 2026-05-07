import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/:patient_id', async (req, res) => {
  try {
    const [alerts] = await db.query(
      `SELECT * FROM alerts 
       WHERE patient_id = ? 
       ORDER BY triggered_at DESC LIMIT 50`,
      [req.params.patient_id]
    );

    // Pentru fiecare alertă, adaugă notele asociate
    for (const alert of alerts) {
      const [notes] = await db.query(
        `SELECT * FROM alert_notes WHERE alert_id = ? ORDER BY created_at ASC`,
        [alert.id]
      );
      alert.notes = notes;
    }

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, alert_type, message, severity, triggered_at } = req.body;
    if (!patient_id || !alert_type) {
      return res.status(400).json({ error: 'patient_id si alert_type sunt obligatorii' });
    }
    const [result] = await db.query(
      `INSERT INTO alerts (patient_id, alert_type, message, severity, triggered_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, alert_type, message, severity || 'MEDIUM', triggered_at || new Date()]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Eroare alarma:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;