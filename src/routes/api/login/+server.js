import { sessions } from '$lib/sessions/sessions.js';
import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { query } from '$lib/db/db.js';

export async function POST({ request }) {
    const { username } = await request.json();
    if (!username) return json({ error: 'missing username' }, { status: 400 });

    const res = await query(
        'INSERT INTO users(username) VALUES ($1) ON CONFLICT (username) DO UPDATE SET username=$1 RETURNING id',
        [username]
    );
    const userId = res.rows[0].id;

    const sessionId = crypto.randomBytes(16).toString('hex');
    const csrfToken = crypto.randomBytes(16).toString('hex');
    sessions.set(sessionId, { userId, csrfToken });

    return new Response(JSON.stringify({ csrfToken }), {
        headers: {
            'content-type': 'application/json',
            'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly`
        }
    });
}
