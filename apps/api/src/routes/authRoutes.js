import express from 'express';
import bcrypt from 'bcryptjs';
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

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
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

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, old_password, new_password } = req.body;

    if (!email || !old_password || !new_password) {
      return res.status(400).json({ error: 'Toate campurile sunt obligatorii' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Userul nu a fost gasit' });
    }

    const user = users[0];

    const isValid = await bcrypt.compare(old_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Parola veche este incorecta' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Parola noua trebuie sa aiba cel putin 6 caractere' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ success: true, message: 'Parola a fost schimbata cu succes' });
  } catch (error) {
    console.error('Eroare reset password:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email-ul este obligatoriu' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Email-ul nu a fost gasit' });
    }

    res.json({ success: true, message: 'Cererea a fost trimisa la administrator' });
  } catch (error) {
    console.error('Eroare forgot password:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/migrate-passwords
router.post('/migrate-passwords', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, password_hash FROM users');
    let migrated = 0;

    for (const user of users) {
      if (!user.password_hash.startsWith('$2')) {
        const hashed = await bcrypt.hash(user.password_hash, 10);
        await db.query(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hashed, user.id]
        );
        migrated++;
      }
    }

    res.json({ success: true, migrated, message: `${migrated} parole hash-uite cu succes` });
  } catch (error) {
    console.error('Eroare migrare:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;