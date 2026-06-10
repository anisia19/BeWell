import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const generateRandomChars = (length = 4) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

const generatePassword = (cnp, lastName) => {
    const last4Cnp = cnp.slice(-4);
    const cleanLastName = lastName.trim().replace(/\s+/g, "");
    const randomChars = generateRandomChars(4);

    return `${cleanLastName}${last4Cnp}${randomChars}`;
};

const getBirthDateFromRomanianCnp = (cnp) => {
    if (!/^\d{13}$/.test(cnp)) {
        throw new Error("Invalid CNP");
    }

    const genderDigit = Number(cnp[0]);
    const year = Number(cnp.slice(1, 3));
    const month = Number(cnp.slice(3, 5));
    const day = Number(cnp.slice(5, 7));

    let fullYear;

    if (genderDigit === 1 || genderDigit === 2) {
        fullYear = 1900 + year;
    } else if (genderDigit === 3 || genderDigit === 4) {
        fullYear = 1800 + year;
    } else if (genderDigit === 5 || genderDigit === 6) {
        fullYear = 2000 + year;
    } else if (genderDigit === 7 || genderDigit === 8 || genderDigit === 9) {
        fullYear = 2000 + year;
    } else {
        throw new Error("Invalid CNP first digit");
    }

    const date = new Date(fullYear, month - 1, day);

    if (
        date.getFullYear() !== fullYear ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw new Error("Invalid CNP birth date");
    }

    return date;
};

const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) {
        age--;
    }

    return age;
};

const formatDateForMySQL = (date) => {
    return date.toISOString().split("T")[0];
};

export const getPatients = async(limit = 10, offset = 0) => {
    const [rows] = await pool.query(`
    SELECT
      u.id AS userId,
      p.id AS patientId,
      u.email,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.phone,
      u.role,
      p.cnp,
      p.date_of_birth AS dateOfBirth,
      p.age,
      p.gender,
      p.profession,
      p.workplace,
      pa.country,
      pa.county,
      pa.city,
      pa.street,
      pa.street_number AS streetNumber,
      pa.building,
      pa.apartment,
      pa.postal_code AS postalCode
    FROM users u
    INNER JOIN patients p ON p.user_id = u.id
    LEFT JOIN patient_addresses pa ON pa.patient_id = p.id
    WHERE u.role = 'PATIENT'
    ORDER BY u.id DESC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `);

    return rows;
};

export const getUsersByRole = async(role, limit = 10, offset = 0) => {
    const [rows] = await pool.execute(`
        SELECT
            id AS userId,
            email,
            first_name AS firstName,
            last_name AS lastName,
            phone,
            role
        FROM users
        WHERE role = ?
        ORDER BY id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [role]);
    return rows;
};

export const createUser = async(data) => {
    const { email, firstName, lastName, phone, role } = data;

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

        const plainPassword = `${lastName.trim().replace(/\s+/g, "")}${generateRandomChars(8)}`;
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const [userResult] = await connection.execute(`
            INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [email, passwordHash, role, firstName, lastName, phone || null]);

        await connection.commit();

        return {
            userId: userResult.insertId,
            email,
            firstName,
            lastName,
            phone,
            role,
            generatedPassword: plainPassword,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const updateUser = async(userId, data) => {
    const { email, firstName, lastName, phone } = data;

    await pool.execute(
        `UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ? WHERE id = ?`,
        [email, firstName, lastName, phone || null, userId]
    );
};

export const updatePatient = async(patientId, data) => {
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
        country,
        county,
        city,
        street,
        streetNumber,
        building,
        apartment,
        postalCode,
    } = data;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            "SELECT user_id FROM patients WHERE id = ?", [patientId]
        );

        if (rows.length === 0) {
            const error = new Error("Patient not found");
            error.code = "NOT_FOUND";
            throw error;
        }

        const userId = rows[0].user_id;

        await connection.execute(
            `UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ? WHERE id = ?`,
            [email, firstName, lastName, phone || null, userId]
        );

        await connection.execute(
            `UPDATE patients SET cnp = ?, date_of_birth = ?, age = ?, gender = ?, profession = ?, workplace = ? WHERE id = ?`,
            [cnp, dateOfBirth || null, age || null, gender, profession || null, workplace || null, patientId]
        );

        await connection.execute(
            `INSERT INTO patient_addresses (patient_id, country, county, city, street, street_number, building, apartment, postal_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               country = VALUES(country),
               county = VALUES(county),
               city = VALUES(city),
               street = VALUES(street),
               street_number = VALUES(street_number),
               building = VALUES(building),
               apartment = VALUES(apartment),
               postal_code = VALUES(postal_code)`,
            [patientId, country || null, county || null, city || null, street || null, streetNumber || null, building || null, apartment || null, postalCode || null]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const createPatient = async(data) => {
    const {
        email,
        firstName,
        lastName,
        phone,
        cnp,
        gender,
        profession,
        workplace,
        role,
        country,
        county,
        city,
        street,
        streetNumber,
        building,
        apartment,
        postalCode,
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

        const birthDate = getBirthDateFromRomanianCnp(cnp);
        const dateOfBirth = formatDateForMySQL(birthDate);
        const age = calculateAge(birthDate);

        const plainPassword = generatePassword(cnp, lastName);
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const [userResult] = await connection.execute(
            `
      INSERT INTO users 
        (email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES 
        (?, ?, ?, ?, ?, ?, 1)
      `, [email, passwordHash, role, firstName, lastName, phone]
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

        const patientId = patientResult.insertId;

        await connection.execute(
            `
      INSERT INTO patient_addresses
        (
          patient_id,
          country,
          county,
          city,
          street,
          street_number,
          building,
          apartment,
          postal_code
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                patientId,
                country || null,
                county || null,
                city || null,
                street || null,
                streetNumber || null,
                building || null,
                apartment || null,
                postalCode || null,
            ]
        );

        await connection.commit();

        return {
            userId,
            patientId,
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
            role,
            country,
            county,
            city,
            street,
            streetNumber,
            building,
            apartment,
            postalCode,
            generatedPassword: plainPassword,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};