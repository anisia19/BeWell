/*import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import nodemailer from "nodemailer";

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
// --- RUTA NOUĂ: FORGOT PASSWORD (Trimite codul) ---
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verificăm dacă user-ul există
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Nu există un cont cu acest email." });
    }

    // Generăm cod de 6 cifre și data expirării (peste 15 minute)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); 

    // Salvăm codul în coloanele pe care tocmai le-ai creat în Workbench
    await pool.execute(
      "UPDATE users SET reset_code = ?, reset_expires = ? WHERE email = ?",
      [code, expires, email]
    );

    // Trimitem email-ul
    await transporter.sendMail({
      from: '"BeWell Support" <albotadaniela2@gmail.com>',
      to: email,
      subject: "Cod Resetare Parolă BeWell",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #22c55e;">Resetare Parolă BeWell</h2>
          <p>Bună ziua,</p>
          <p>Ai solicitat resetarea parolei pentru contul tău. Codul de verificare este:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #22c55e; margin: 20px 0;">
            ${code}
          </div>
          <p>Acest cod este valabil timp de 15 minute.</p>
          <p>Dacă nu ai solicitat această resetare, poți ignora acest email în siguranță.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Echipa BeWell - Sănătatea ta, prioritatea noastră.</p>
        </div>
      `
    });

    console.log(`📧 Cod trimis cu succes către: ${email}`);
    res.json({ message: "Codul a fost trimis pe email!" });
   
  } catch (error) {
    console.error("Eroare la forgot-password:", error);
    res.status(500).json({ error: "Eroare la trimiterea codului." });
  }
});

// RESET PASSWORD (Schimbă parola efectiv)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Verificăm dacă mail-ul, codul sunt corecte și dacă nu a expirat (reset_expires > NOW())
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_expires > NOW()",
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Cod invalid sau expirat." });
    }

    // Hashuim noua parolă 
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update parola și resetăm câmpurile de cod la NULL
    await pool.execute(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE email = ?",
      [passwordHash, email]
    );

    res.json({ message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    console.error("Eroare la reset-password:", error);
    res.status(500).json({ error: "Eroare la resetarea parolei." });
  }
});

export default router;
*/
import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const router = express.Router();

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

// --- RUTA: FORGOT PASSWORD (SIMULATĂ - FĂRĂ GOOGLE) ---
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

    // 4. AFIȘĂM CODUL ÎN TERMINAL (VS CODE)
    console.log("\n--- SIMULARE TRIMITERE EMAIL ---");
    console.log(`CĂTRE: ${email}`);
    console.log(`COD DE RESETARE: ${code}`);
    console.log("--------------------------------\n");

    // Trimitem succes către frontend
    res.json({ message: "Codul a fost generat! Verifică terminalul VS Code." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la generarea codului." });
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

export default router;