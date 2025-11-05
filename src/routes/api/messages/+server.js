import { json } from '@sveltejs/kit';
import { query } from '$lib/db/db.js';
import { sessions } from '$lib/sessions/sessions.js';

function parseCookies(cookieHeader) {
    const obj = {};
    if (!cookieHeader) return obj;
    cookieHeader.split(';').forEach(pair => {
        const idx = pair.indexOf('=');
        if (idx === -1) return;
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        obj[key] = val;
    });
    return obj;
}

async function parseBody(request) {
    const contentType = (request.headers.get('content-type') || '').split(';')[0].trim();
    if (contentType === 'application/json') {
        try {
            return await request.json();
        } catch {
            return {};
        }
    }
    if (contentType === 'application/x-www-form-urlencoded') {
        const text = await request.text();
        return Object.fromEntries(new URLSearchParams(text));
    }
    try {
        const t = await request.text();
        return t ? JSON.parse(t) : {};
    } catch {
        return {};
    }
}

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


export async function POST({ request, url }) {
    const csrfProtected = url.searchParams.get('csrfProtected') === 'true';

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies.session;
    const session = sessions.get(sessionId);
    if (!session) return json({ error: 'Not logged in' }, { status: 401 });

    if (!csrfProtected) {
        const token = request.headers.get('x-csrf-token');
        if (!token || token !== session.csrfToken) {
            return json({ error: 'CSRF BLOCKED' }, { status: 403 });
        }
    }

    const body = await parseBody(request);
    const content = body.value || '';

    await query(
        'INSERT INTO messages(author, content) VALUES ((SELECT username FROM users WHERE id=$1), $2)',
        [session.userId, content]
    );

    return json({ ok: true });
}