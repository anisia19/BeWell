import express from 'express';
import db from '../config/db.js';

const router = express.Router();

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

    // Verifică parola (momentan plain text - în producție folosește bcrypt)
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Email sau parola incorecte' });
    }


    const [patients] = await db.query(
      'SELECT * FROM patients WHERE user_id = ?',
      [user.id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ error: 'Pacientul nu a fost găsit' });
    }

    const patient = patients[0];

    res.json({
      success: true,
      token: `token_${user.id}_${Date.now()}`,
      patient_id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: user.email,
    });

  } catch (error) {
    console.error('Eroare login:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;