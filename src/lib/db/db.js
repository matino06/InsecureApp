import pkg from 'pg';
const { Pool } = pkg;
import { env } from '$env/dynamic/private';

const pool = new Pool({
    user: env.PGUSER,
    password: env.PGPASSWORD,
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
});

export async function query(text, params) {
    const res = await pool.query(text, params);
    return res;
}