import pool from "../config/db.js";

export const getSensorReadingsByPatient = async (patientId, limit = 60, offset = 0) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            patient_id AS patientId,
            wearable_device_id AS wearableDeviceId,
            recorded_at AS recordedAt,
            ecg_value AS ecgValue,
            pulse_value AS pulseValue,
            temperature_value AS temperatureValue,
            humidity_value AS humidityValue,
            aggregation_window_seconds AS aggregationWindowSeconds,
            is_alert_triggered AS isAlertTriggered
        FROM sensor_readings
        WHERE patient_id = ?
        ORDER BY recorded_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [patientId]);

    return rows.reverse();
};

export const getSensorReadingsWindow = async (patientId, minutes = 10) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            patient_id AS patientId,
            wearable_device_id AS wearableDeviceId,
            recorded_at AS recordedAt,
            ecg_value AS ecgValue,
            pulse_value AS pulseValue,
            temperature_value AS temperatureValue,
            humidity_value AS humidityValue,
            aggregation_window_seconds AS aggregationWindowSeconds,
            is_alert_triggered AS isAlertTriggered
        FROM sensor_readings
        WHERE patient_id = ?
          AND recorded_at >= (
            SELECT DATE_SUB(MAX(recorded_at), INTERVAL ? MINUTE)
            FROM sensor_readings
            WHERE patient_id = ?
          )
        ORDER BY recorded_at ASC
    `, [patientId, minutes, patientId]);

    return rows;
};

export const getNewSensorReadingsByPatientId = async (patientId, afterId) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            patient_id AS patientId,
            wearable_device_id AS wearableDeviceId,
            recorded_at AS recordedAt,
            ecg_value AS ecgValue,
            pulse_value AS pulseValue,
            temperature_value AS temperatureValue,
            humidity_value AS humidityValue,
            aggregation_window_seconds AS aggregationWindowSeconds,
            is_alert_triggered AS isAlertTriggered
        FROM sensor_readings
        WHERE patient_id = ? AND id > ?
        ORDER BY id ASC
    `, [patientId, afterId]);

    return rows;
};

export const getSensorReadingsByUserId = async (userId, limit = 60) => {
    const [rows] = await pool.query(`
        SELECT
            sr.id,
            sr.patient_id AS patientId,
            sr.wearable_device_id AS wearableDeviceId,
            sr.recorded_at AS recordedAt,
            sr.ecg_value AS ecgValue,
            sr.pulse_value AS pulseValue,
            sr.temperature_value AS temperatureValue,
            sr.humidity_value AS humidityValue,
            sr.aggregation_window_seconds AS aggregationWindowSeconds,
            sr.is_alert_triggered AS isAlertTriggered
        FROM sensor_readings sr
        INNER JOIN patients p ON p.id = sr.patient_id
        WHERE p.user_id = ?
        ORDER BY sr.recorded_at DESC
        LIMIT ${Number(limit)}
    `, [userId]);

    return rows.reverse();
};

export const getNewSensorReadingsByUserId = async (userId, afterTimestamp) => {
    const [rows] = await pool.query(`
        SELECT
            sr.id,
            sr.patient_id AS patientId,
            sr.wearable_device_id AS wearableDeviceId,
            sr.recorded_at AS recordedAt,
            sr.ecg_value AS ecgValue,
            sr.pulse_value AS pulseValue,
            sr.temperature_value AS temperatureValue,
            sr.humidity_value AS humidityValue,
            sr.aggregation_window_seconds AS aggregationWindowSeconds,
            sr.is_alert_triggered AS isAlertTriggered
        FROM sensor_readings sr
        INNER JOIN patients p ON p.id = sr.patient_id
        WHERE p.user_id = ? AND sr.recorded_at > ?
        ORDER BY sr.recorded_at ASC
    `, [userId, afterTimestamp]);

    return rows;
};

export const getAllSensorReadings = async (limit = 50, offset = 0) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            patient_id AS patientId,
            wearable_device_id AS wearableDeviceId,
            recorded_at AS recordedAt,
            ecg_value AS ecgValue,
            pulse_value AS pulseValue,
            temperature_value AS temperatureValue,
            humidity_value AS humidityValue,
            aggregation_window_seconds AS aggregationWindowSeconds,
            is_alert_triggered AS isAlertTriggered
        FROM sensor_readings
        ORDER BY recorded_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    return rows;
};
