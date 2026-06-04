import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const generatePassword = (cnp, lastName) => {
    const last4Cnp = cnp.slice(-4);
    const randomChars = Math.random().toString(36).substring(2, 4);
    return `${last4Cnp}${lastName}${randomChars}`;
};

export const getPatients = async() => {
    const [rows] = await pool.execute(`
    SELECT 
      u.id AS userId,
      p.id AS patientId,
      u.email,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.phone,
      p.cnp,
      p.date_of_birth AS dateOfBirth,
      p.age,
      p.gender,
      p.profession,
      p.workplace
    FROM users u
    INNER JOIN patients p ON p.user_id = u.id
    WHERE u.role = 'PATIENT'
    ORDER BY u.id DESC
  `);

    return rows;
};

export const createPatient = async(data) => {
    const {
        email,
        firstName,
        lastName,
        phone,
        cnp,
        dateOfBirth,
        age,
        gender,
        profession,
        workplace,
    } = data;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingEmail] = await connection.execute(
            "SELECT id FROM users WHERE email = ?", [email]
        );

        if (existingEmail.length > 0) {
            const error = new Error("Email already exists");
            error.code = "DUPLICATE_EMAIL";
            throw error;
        }

        const [existingCnp] = await connection.execute(
            "SELECT id FROM patients WHERE cnp = ?", [cnp]
        );

        if (existingCnp.length > 0) {
            const error = new Error("CNP already exists");
            error.code = "DUPLICATE_CNP";
            throw error;
        }

        const plainPassword = generatePassword(cnp, lastName);
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const [userResult] = await connection.execute(
            `
      INSERT INTO users 
        (email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES 
        (?, ?, 'PATIENT', ?, ?, ?, 1)
      `, [email, passwordHash, firstName, lastName, phone]
        );

        const userId = userResult.insertId;

        const [patientResult] = await connection.execute(
            `
      INSERT INTO patients
        (user_id, cnp, date_of_birth, age, gender, profession, workplace)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `, [
                userId,
                cnp,
                dateOfBirth,
                age,
                gender,
                profession || null,
                workplace || null,
            ]
        );

        await connection.commit();

        return {
            userId,
            patientId: patientResult.insertId,
            email,
            firstName,
            lastName,
            phone,
            cnp,
            dateOfBirth,
            age,
            gender,
            profession,
            workplace,
            generatedPassword: plainPassword,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};