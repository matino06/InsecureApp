import { sessions } from '$lib/sessions/sessions.js';
import { json } from '@sveltejs/kit';
import { query } from '$lib/db/db.js';

function genRandomBytes(n) {
    const bytes = new Uint8Array(n);
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
        globalThis.crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < n; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    return bytes;
}

function bytesToHex(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        const h = bytes[i].toString(16);
        hex += (h.length === 1 ? '0' + h : h);
    }
    return hex;
}

function randomHex(bytesLen = 16) {
    const b = genRandomBytes(bytesLen);
    return bytesToHex(b);
}

export async function POST({ request }) {
    try {
        const { username } = await request.json();
        if (!username) return json({ error: 'missing username' }, { status: 400 });

        const res = await query(
            'INSERT INTO users(username) VALUES ($1) ON CONFLICT (username) DO UPDATE SET username=$1 RETURNING id',
            [username]
        );
        const userId = res.rows[0].id;

        const sessionId = randomHex(16);
        const csrfToken = randomHex(16);

        sessions.set(sessionId, { userId, csrfToken });

        return json(
            { csrfToken },
            {
                headers: {
                    'content-type': 'application/json',
                    'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`
                }
            }
        );
    } catch (err) {
        console.error('login error', err);
        return json({ error: 'internal server error' }, { status: 500 });
    }
}
