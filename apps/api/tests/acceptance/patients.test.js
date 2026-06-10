import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/db.js';

let testDoctorId;
let testPatientId;

beforeAll(async () => {
    const [res] = await pool.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name)
         VALUES (?, ?, 'DOCTOR', ?, ?)`,
        ['doctor@acceptance.test', 'hash', 'Test', 'Doctor']
    );
    testDoctorId = res.insertId;

    const createRes = await request(app)
        .post('/api/patients')
        .send({
            doctor_id: testDoctorId,
            email: 'patient.fixture@acceptance.test',
            password_hash: 'hash',
            first_name: 'Maria',
            last_name: 'Ionescu',
            cnp: '2950510123456',
        });

    testPatientId = createRes.body.patient_id;
});

afterAll(async () => {
    await pool.end();
});

// ──────────────────────────────────────────────
// HEALTH
// ──────────────────────────────────────────────

describe('GET /health', () => {
    it('returns 200 with a status field', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status');
    });
});

// ──────────────────────────────────────────────
// LIST PATIENTS
// ──────────────────────────────────────────────

describe('GET /api/patients', () => {
    it('returns 200 with an array', async () => {
        const res = await request(app).get('/api/patients');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('each patient has id, first_name and last_name', async () => {
        const res = await request(app).get('/api/patients');
        expect(res.body.length).toBeGreaterThan(0);
        const p = res.body[0];
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('first_name');
        expect(p).toHaveProperty('last_name');
    });
});

// ──────────────────────────────────────────────
// GET PATIENT BY ID
// ──────────────────────────────────────────────

describe('GET /api/patients/:id', () => {
    it('returns 200 with the correct patient when id exists', async () => {
        const res = await request(app).get(`/api/patients/${testPatientId}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(testPatientId);
        expect(res.body.first_name).toBe('Maria');
        expect(res.body.last_name).toBe('Ionescu');
    });

    it('returns 404 when patient does not exist', async () => {
        const res = await request(app).get('/api/patients/999999');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

// ──────────────────────────────────────────────
// CREATE PATIENT
// ──────────────────────────────────────────────

describe('POST /api/patients', () => {
    it('creates a patient with all required fields and returns 201 with patient_id', async () => {
        const res = await request(app)
            .post('/api/patients')
            .send({
                doctor_id: testDoctorId,
                email: 'new.patient@acceptance.test',
                password_hash: 'hash',
                first_name: 'Ion',
                last_name: 'Georgescu',
                cnp: '1900320456789',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('patient_id');
        expect(typeof res.body.patient_id).toBe('number');
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/patients')
            .send({
                email: 'incomplete@acceptance.test',
                first_name: 'Incomplete',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('creates a patient with optional address and medical profile', async () => {
        const res = await request(app)
            .post('/api/patients')
            .send({
                doctor_id: testDoctorId,
                email: 'full.patient@acceptance.test',
                password_hash: 'hash',
                first_name: 'Ana',
                last_name: 'Pop',
                cnp: '2850712654321',
                date_of_birth: '1985-07-12',
                age: 40,
                gender: 'FEMALE',
                address: {
                    country: 'Romania',
                    county: 'Cluj',
                    city: 'Cluj-Napoca',
                },
                medical_profile: {
                    normal_pulse_min: 60,
                    normal_pulse_max: 100,
                },
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('patient_id');
    });
});

// ──────────────────────────────────────────────
// UPDATE PATIENT
// ──────────────────────────────────────────────

describe('PUT /api/patients/:id', () => {
    it('updates a patient and returns 200', async () => {
        const res = await request(app)
            .put(`/api/patients/${testPatientId}`)
            .send({
                email: 'updated.maria@acceptance.test',
                first_name: 'Maria',
                last_name: 'Ionescu-Updated',
                cnp: '2950510123456',
                phone: '0741000000',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('reflects the update when re-fetched', async () => {
        const res = await request(app).get(`/api/patients/${testPatientId}`);
        expect(res.status).toBe(200);
        expect(res.body.last_name).toBe('Ionescu-Updated');
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .put(`/api/patients/${testPatientId}`)
            .send({ first_name: 'Only' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('returns 404 when patient does not exist', async () => {
        const res = await request(app)
            .put('/api/patients/999999')
            .send({
                email: 'ghost@acceptance.test',
                first_name: 'Ghost',
                last_name: 'User',
                cnp: '0000000000000',
            });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

// ──────────────────────────────────────────────
// DELETE PATIENT
// ──────────────────────────────────────────────

describe('DELETE /api/patients/:id', () => {
    it('deletes a patient and returns 200', async () => {
        const createRes = await request(app)
            .post('/api/patients')
            .send({
                doctor_id: testDoctorId,
                email: 'to.delete@acceptance.test',
                password_hash: 'hash',
                first_name: 'ToDelete',
                last_name: 'Patient',
                cnp: '1111111111112',
            });

        const idToDelete = createRes.body.patient_id;

        const deleteRes = await request(app).delete(`/api/patients/${idToDelete}`);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body).toHaveProperty('message');
    });

    it('patient is no longer reachable after deletion', async () => {
        const createRes = await request(app)
            .post('/api/patients')
            .send({
                doctor_id: testDoctorId,
                email: 'gone@acceptance.test',
                password_hash: 'hash',
                first_name: 'Gone',
                last_name: 'Patient',
                cnp: '2222222222221',
            });

        const id = createRes.body.patient_id;
        await request(app).delete(`/api/patients/${id}`);

        const getRes = await request(app).get(`/api/patients/${id}`);
        expect(getRes.status).toBe(404);
    });
});
