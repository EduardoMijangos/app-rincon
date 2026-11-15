import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const subscription = req.body;
    // Guardamos su suscripción
    await kv.set('girlfriend_sub', JSON.stringify(subscription));
    res.status(201).json({ message: 'Suscrita con éxito' });
}