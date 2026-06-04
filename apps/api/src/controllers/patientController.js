import pool from '../config/db.js';

export async function getAllPatients(req, res) {
    try {
        const search = req.query.search;

        const [rows] = await pool.query(`
          SELECT
            p.id,
            p.user_id,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            p.cnp,
            p.age,
            p.gender,
            CONCAT_WS(', ', pmp.medical_history, pmp.allergies) AS diagnosis,
            COUNT(a.id) AS alertsCount,
            CASE 
              WHEN u.is_active = 1 THEN 'Active'
              ELSE 'Inactive'
            END AS status
        
          FROM patients p
          JOIN users u ON p.user_id = u.id
          LEFT JOIN patient_medical_profiles pmp ON pmp.patient_id = p.id
          LEFT JOIN alerts a 
            ON a.patient_id = p.id
            AND a.status = 'ACTIVE'
        
          WHERE u.role = 'PATIENT'
            AND (
              ? IS NULL OR
              u.first_name LIKE CONCAT('%', ?, '%') OR
              u.last_name LIKE CONCAT('%', ?, '%') OR
              p.cnp LIKE CONCAT('%', ?, '%')
            )
        
          GROUP BY p.id
        `, [search, search, search, search]);

        res.json(rows);

    } catch (error) {

        console.error('GET /api/patients error:', error);

        res.status(500).json({
            error: 'Failed to fetch patients'
        });
    }
}

export async function getPatientById(req, res) {

    const id = req.params.id;

    try {

        const [rows] = await pool.query(`
            SELECT
                p.id,
                p.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                p.cnp,
                p.date_of_birth,
                p.age,
                p.gender,
                p.profession,
                p.workplace,
                pa.country,
                pa.county,
                pa.city,
                pa.street,
                pa.street_number,
                pa.building,
                pa.apartment,
                pa.postal_code,
                pmp.medical_history,
                pmp.allergies,
                pmp.cardiology_consultations,
                pmp.normal_ecg_min,
                pmp.normal_ecg_max,
                pmp.normal_pulse_min,
                pmp.normal_pulse_max,
                pmp.normal_temperature_min,
                pmp.normal_temperature_max,
                pmp.normal_humidity_min,
                pmp.normal_humidity_max
            FROM patients p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN patient_addresses pa ON pa.patient_id = p.id
            LEFT JOIN patient_medical_profiles pmp ON pmp.patient_id = p.id
            WHERE p.id = ?
            LIMIT 1
        `, [id]);

        if (rows.length === 0) {

            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        res.json(rows[0]);

    } catch (error) {

        console.error('GET patient error:', error);

        res.status(500).json({
            error: 'Failed to fetch patient'
        });
    }
}

export async function createPatient(req, res) {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const body = req.body;

        // campuri obligatorii
        if (!body.doctor_id || !body.email || !body.cnp) {

            await connection.rollback();

            return res.status(400).json({
                error: 'doctor_id, email and cnp are required'
            });
        }

        // cautam userul existent
        const [existingUsers] = await connection.query(
            `SELECT id FROM users WHERE email = ?`,
            [body.email]
        );

        // daca nu exista userul
        if (existingUsers.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                error: 'User not found'
            });
        }

        const userId = existingUsers[0].id;

        // verificam daca exista deja pacient
        const [existingPatients] = await connection.query(
            `SELECT id FROM patients WHERE user_id = ?`,
            [userId]
        );

        if (existingPatients.length > 0) {

            await connection.rollback();

            return res.status(400).json({
                error: 'Patient already exists'
            });
        }

        // cream pacientul
        const [patientResult] = await connection.query(`
            INSERT INTO patients (
                user_id,
                cnp,
                date_of_birth,
                age,
                gender,
                profession,
                workplace
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            body.cnp,
            body.date_of_birth ? body.date_of_birth : null,
            body.age !== undefined ? body.age : null,
            body.gender ? body.gender : 'UNSPECIFIED',
            body.profession ? body.profession : null,
            body.workplace ? body.workplace : null
        ]);

        const patientId = patientResult.insertId;

        // legam doctorul de pacient
        await connection.query(`
            INSERT INTO doctor_patient_assignments (
                doctor_id,
                patient_id
            )
            VALUES (?, ?)
        `, [
            body.doctor_id,
            patientId
        ]);

        // adresa
        const address = body.address;

        await connection.query(`
            INSERT INTO patient_addresses (
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            address && address.country ? address.country : null,
            address && address.county ? address.county : null,
            address && address.city ? address.city : null,
            address && address.street ? address.street : null,
            address && address.street_number ? address.street_number : null,
            address && address.building ? address.building : null,
            address && address.apartment ? address.apartment : null,
            address && address.postal_code ? address.postal_code : null
        ]);

        // profil medical
        const mp = body.medical_profile;

        await connection.query(`
            INSERT INTO patient_medical_profiles (
                patient_id,
                medical_history,
                allergies,
                cardiology_consultations,
                normal_ecg_min,
                normal_ecg_max,
                normal_pulse_min,
                normal_pulse_max,
                normal_temperature_min,
                normal_temperature_max,
                normal_humidity_min,
                normal_humidity_max
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            mp && mp.medical_history ? mp.medical_history : null,
            mp && mp.allergies ? mp.allergies : null,
            mp && mp.cardiology_consultations ? mp.cardiology_consultations : null,
            mp && mp.normal_ecg_min !== undefined ? mp.normal_ecg_min : null,
            mp && mp.normal_ecg_max !== undefined ? mp.normal_ecg_max : null,
            mp && mp.normal_pulse_min !== undefined ? mp.normal_pulse_min : null,
            mp && mp.normal_pulse_max !== undefined ? mp.normal_pulse_max : null,
            mp && mp.normal_temperature_min !== undefined ? mp.normal_temperature_min : null,
            mp && mp.normal_temperature_max !== undefined ? mp.normal_temperature_max : null,
            mp && mp.normal_humidity_min !== undefined ? mp.normal_humidity_min : null,
            mp && mp.normal_humidity_max !== undefined ? mp.normal_humidity_max : null
        ]);

        await connection.commit();

        res.status(201).json({
            message: 'Patient created successfully',
            patient_id: patientId
        });

    } catch (error) {

        await connection.rollback();

        console.error('CREATE PATIENT ERROR:', error);

        if (error.code === 'ER_DUP_ENTRY') {

            return res.status(400).json({
                error: 'CNP already exists'
            });
        }

        res.status(500).json({
            error: 'Failed to create patient'
        });

    } finally {

        connection.release();
    }
}

export async function updatePatient(req, res) {

    const id = req.params.id;

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT user_id FROM patients WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        const userId = rows[0].user_id;

        const body = req.body;

        if (!body.email || !body.first_name || !body.last_name || !body.cnp) {

            await connection.rollback();

            return res.status(400).json({
                error: 'email, first_name, last_name and cnp are required'
            });
        }

        await connection.query(`
            UPDATE users
            SET
                email = ?,
                first_name = ?,
                last_name = ?,
                phone = ?
            WHERE id = ?
        `, [
            body.email,
            body.first_name,
            body.last_name,
            body.phone ? body.phone : null,
            userId
        ]);

        await connection.query(`
            UPDATE patients
            SET
                cnp = ?,
                date_of_birth = ?,
                age = ?,
                gender = ?,
                profession = ?,
                workplace = ?
            WHERE id = ?
        `, [
            body.cnp,
            body.date_of_birth ? body.date_of_birth : null,
            body.age !== undefined ? body.age : null,
            body.gender ? body.gender : 'UNSPECIFIED',
            body.profession ? body.profession : null,
            body.workplace ? body.workplace : null,
            id
        ]);

        await connection.commit();

        res.json({
            message: 'Updated successfully'
        });

    } catch (error) {

        await connection.rollback();

        console.error('UPDATE error:', error);

        res.status(500).json({
            error: 'Failed to update patient'
        });

    } finally {

        connection.release();
    }
}

export async function deletePatient(req, res) {

    const id = req.params.id;

    try {

        await pool.query(
            `DELETE FROM users WHERE id = (SELECT user_id FROM patients WHERE id = ?)`,
            [id]
        );

        res.json({
            message: 'Deleted successfully'
        });

    } catch (error) {

        console.error('DELETE error:', error);

        res.status(500).json({
            error: 'Failed to delete patient'
        });
    }
}