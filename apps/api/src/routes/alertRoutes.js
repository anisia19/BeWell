import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/:patient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM alerts 
       WHERE patient_id = ? 
       ORDER BY triggered_at DESC LIMIT 50`,
      [req.params.patient_id]
    );
    res.json(rows);
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
    console.error('Eroare alarmă:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { alert_id, note } = req.body;
    if (!alert_id || !note) {
      return res.status(400).json({ error: 'alert_id si note sunt obligatorii' });
    }

    await db.query(
      'INSERT INTO alert_notes (alert_id, note, created_at) VALUES (?, ?, ?)',
      [alert_id, note, new Date()]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Eroare notă alarmă:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;