import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { alert_id, note } = req.body;
    if (!alert_id || !note) {
      return res.status(400).json({ error: 'alert_id si note sunt obligatorii' });
    }

    await db.query(
      'INSERT INTO alert_notes (alert_id, note_text, author_user_id) VALUES (?, ?, ?)',
      [alert_id, note, 1]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Eroare nota alarma:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    await db.query('DELETE FROM alert_notes WHERE id = ?', [note_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Eroare stergere nota:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;