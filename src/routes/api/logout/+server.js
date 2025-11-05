import { json } from '@sveltejs/kit';
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

export async function POST({ request }) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies.session;

    if (sessionId && sessions.has(sessionId)) {
        sessions.delete(sessionId);
    }

    return new Response(JSON.stringify({ ok: true }), {
        headers: {
            'content-type': 'application/json',
            'Set-Cookie': `session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
    });
}
