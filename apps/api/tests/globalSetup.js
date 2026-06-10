import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_FILE = join(__dirname, '../../../database/schema/001_create_tables.sql');

const connConfig = {
    host: '127.0.0.1',
    port: 3307,
    user: 'testuser',
    password: 'testpass',
};

function parseSql(filePath) {
    const sql = readFileSync(filePath, 'utf8');
    return sql
        .replace(/--.*$/gm, '')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !/^USE\s/i.test(s));
}

export async function setup() {
    const conn = await mysql.createConnection(connConfig);

    await conn.query('DROP DATABASE IF EXISTS be_well_test');
    await conn.query(
        'CREATE DATABASE be_well_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    await conn.query('USE be_well_test');

    for (const stmt of parseSql(SCHEMA_FILE)) {
        await conn.query(stmt);
    }

    await conn.end();
}

export async function teardown() {
    const conn = await mysql.createConnection(connConfig);
    await conn.query('DROP DATABASE IF EXISTS be_well_test');
    await conn.end();
}
