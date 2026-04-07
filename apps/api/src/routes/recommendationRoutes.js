import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/:patient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM recommendations 
       WHERE patient_id = ? 
       ORDER BY created_at DESC`,
      [req.params.patient_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/schedules/:patient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT rs.*, r.type, r.notes 
       FROM recommendation_schedules rs
       JOIN recommendations r ON rs.recommendation_id = r.id
       WHERE r.patient_id = ?
       ORDER BY rs.scheduled_date ASC`,
      [req.params.patient_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;