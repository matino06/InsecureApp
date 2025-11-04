import { json } from '@sveltejs/kit';
import { query } from '$lib/db/db.js';

export async function GET({ url }) {
    const filter = url.searchParams.get('filter') || '';
    const sqlEnabledParam = url.searchParams.get('sqlEnabled');
    const sqlEnabled = sqlEnabledParam === 'true';

    if (sqlEnabled && filter) {
        const rawSql = `SELECT id, author, content FROM messages WHERE content LIKE '%${filter}%' ORDER BY id DESC`;
        const res = await query(rawSql);
        return json({ used: 'raw', query: rawSql, rows: res.rows });
    } else {
        const q = filter ? 'SELECT id, author, content FROM messages WHERE content LIKE $1 ORDER BY id DESC' : 'SELECT id, author, content FROM messages ORDER BY id DESC';
        const params = filter ? [`%${filter}%`] : [];
        const res = await query(q, params);
        return json({ used: 'param', rows: res.rows });
    }
}

export async function POST({ request }) {
    const { author = 'anon', content = '' } = await request.json();
    await query('INSERT INTO messages(author, content) VALUES ($1,$2)', [author, content]);
    return json({ ok: true });
}
