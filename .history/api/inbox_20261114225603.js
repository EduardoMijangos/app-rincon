import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, text = '', caption = '', image, mood = '' } = req.body || {};
    if (!['photo', 'message', 'mood'].includes(type)) return res.status(400).json({ error: 'tipo inválido' });
    if (type === 'photo' && (!/^data:image\/jpeg;base64,/.test(image || '') || image.length > 800000))
      return res.status(400).json({ error: 'imagen inválida o muy grande' });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await kv.set(`inbox:${id}`, {
      id, type, at: Date.now(),
      text: String(text).slice(0, 500), caption: String(caption).slice(0, 120), mood: String(mood).slice(0, 4),
      image: type === 'photo' ? image : undefined
    });
    await kv.lpush('inbox', id);
    await kv.ltrim('inbox', 0, 199);
    return res.status(201).json({ id });
  }
  if (req.method === 'GET') {
    if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(401).end();
    const ids = await kv.lrange('inbox', 0, 49);
    const items = ids.length ? await kv.mget(...ids.map(i => `inbox:${i}`)) : [];
    return res.status(200).json(items.filter(Boolean));
  }
  res.status(405).end();
}