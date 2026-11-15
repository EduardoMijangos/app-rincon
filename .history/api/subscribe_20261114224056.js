import { kv } from '@vercel/kv';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const sub = req.body;
  if (!sub || !sub.endpoint || !sub.keys) return res.status(400).json({ error: 'Suscripción inválida' });
  await kv.set('girlfriend_sub', JSON.stringify(sub));
  res.status(201).json({ message: 'Suscrita con éxito' });
}
