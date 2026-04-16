import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email si parola sunt obligatorii' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email sau parola incorecte' });
    }

    const user = users[0];

    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Email sau parola incorecte' });
    }

    const [patients] = await db.query(
      'SELECT * FROM patients WHERE user_id = ?',
      [user.id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ error: 'Pacientul nu a fost gasit' });
    }

    const patient = patients[0];

    res.json({
      success: true,
      token: `token_${user.id}_${Date.now()}`,
      patient_id: patient.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });

  } catch (error) {
    console.error('Eroare login:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, cnp, phone } = req.body;

    if (!email || !password || !first_name || !last_name || !cnp || !phone) {
      return res.status(400).json({ error: 'Toate campurile sunt obligatorii' });
    }

    if (cnp.length !== 13) {
      return res.status(400).json({ error: 'CNP-ul trebuie sa aiba 13 cifre' });
    }

    // Verifică dacă emailul există deja
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email-ul este deja inregistrat' });
    }

    // Creează userul
    const [userResult] = await db.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active) 
       VALUES (?, ?, 'PATIENT', ?, ?, ?, 1)`,
      [email, password, first_name, last_name, phone]
    );

    const userId = userResult.insertId;

    // Creează pacientul
    const [patientResult] = await db.query(
      `INSERT INTO patients (user_id, cnp) VALUES (?, ?)`,
      [userId, cnp]
    );

    const patientId = patientResult.insertId;

    res.json({
      success: true,
      token: `token_${userId}_${Date.now()}`,
      patient_id: patientId,
      first_name,
      last_name,
      email,
    });

  } catch (error) {
    console.error('Eroare register:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;