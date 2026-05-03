import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validare
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: "Email, password, firstName și lastName sunt obligatorii" 
      });
    }

    // Verifică dacă email-ul există deja
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email-ul există deja" });
    }

    // Criptează parola
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserează utilizatorul în baza de date
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active) 
       VALUES (?, ?, 'PATIENT', ?, ?, ?, 1)`,
      [email, passwordHash, firstName, lastName, phoneNumber || null]
    );

    res.status(201).json({ 
      message: "Utilizator creat cu succes",
      userId: result.insertId 
    });

  } catch (error) {
    console.error("Eroare la înregistrare:", error);
    res.status(500).json({ error: "Eroare internă la server" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email și parola sunt obligatorii" });
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email sau parolă incorectă" });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "Contul nu este activ" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email sau parolă incorectă" });
    }

    res.json({
      message: "Autentificare reușită",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error("Eroare la autentificare:", error);
    res.status(500).json({ error: "Eroare internă la server" });
  }
});

export default router;