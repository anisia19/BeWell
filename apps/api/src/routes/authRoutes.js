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

export default router;