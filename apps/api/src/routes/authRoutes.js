
import dotenv from 'dotenv';
dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SETAT" : "UNDEFINED");
import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pool from "../config/db.js";

const router = express.Router();

// --- CONFIGURARE NODEMAILER ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- RUTA: REGISTER ---
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Toate câmpurile sunt obligatorii" });
    }
    const [existingUser] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email-ul există deja" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active) 
       VALUES (?, ?, 'PATIENT', ?, ?, ?, 1)`,
      [email, passwordHash, firstName, lastName, phoneNumber || null]
    );
    res.status(201).json({ message: "Utilizator creat cu succes", userId: result.insertId });
  } catch (error) {
    console.error("Eroare la înregistrare:", error);
    res.status(500).json({ error: "Eroare la server" });
  }
});

// --- RUTA: LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Email sau parolă incorectă" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Email sau parolă incorectă" });

    res.json({
      message: "Autentificare reușită",
      user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name }
    });
  } catch (error) {
    res.status(500).json({ error: "Eroare la server" });
  }
});

// --- RUTA: FORGOT PASSWORD ---
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Verificăm dacă user-ul există
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Nu există un cont cu acest email." });
    }

    // 2. Generăm codul
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Salvăm în baza de date
    await pool.execute(
      "UPDATE users SET reset_code = ?, reset_expires = ? WHERE email = ?",
      [code, expires, email]
    );

    // 4. Trimitem emailul
    await transporter.sendMail({
      from: `"Aplicatia Mea" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Cod de resetare parolă",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Resetare parolă</h2>
          <p>Ai solicitat resetarea parolei. Folosește codul de mai jos:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; text-align: center; padding: 16px 0;">
            ${code}
          </div>
          <p style="color: #888; font-size: 13px;">Codul este valabil <strong>15 minute</strong>. Dacă nu ai solicitat tu această acțiune, ignoră acest email.</p>
        </div>
      `,
    });

    res.json({ message: "Codul a fost trimis pe email!" });
  } catch (error) {
    console.error("Eroare forgot-password:", error);
    res.status(500).json({ error: "Eroare la trimiterea emailului." });
  }
});

// --- RUTA: RESET PASSWORD ---
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_expires > NOW()",
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Cod invalid sau expirat." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE email = ?",
      [passwordHash, email]
    );

    res.json({ message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    res.status(500).json({ error: "Eroare la resetarea parolei." });
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?",
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;