import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { type, text = '', caption = '', image, mood = '' } = req.body || {};
      if (!['photo', 'message', 'mood'].includes(type)) return res.status(400).json({ error: 'tipo inválido' });
      if (type === 'photo' && (!/^data:image\/jpeg;base64,/.test(image || '') || image.length > 800000))
        return res.status(400).json({ error: 'imagen inválida o muy grande' });
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await redis.set(`inbox:${id}`, {
        id, type, at: Date.now(),
        text: String(text).slice(0, 500), caption: String(caption).slice(0, 120), mood: String(mood).slice(0, 4),
        ...(type === 'photo' ? { image } : {})
      });
      await redis.lpush('inbox', id);
      await redis.ltrim('inbox', 0, 199);
      return res.status(201).json({ id });
    }
    if (req.method === 'GET') {
      const key = req.headers['x-admin-key'] || req.query.key;
      if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).end();
      if (req.query.img) { // devuelve una sola foto como imagen
        const it = await redis.get(`inbox:${req.query.img}`);
        if (!it || !it.image) return res.status(404).end();
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'private, max-age=3600');
        return res.status(200).send(Buffer.from(it.image.split(',')[1], 'base64'));
      }
      const ids = await redis.lrange('inbox', 0, 49);
      let items = ids.length ? (await redis.mget(...ids.map(i => `inbox:${i}`))).filter(Boolean) : [];
      if (req.query.lite) items = items.map(({ image, ...r }) => ({ ...r, hasImage: !!image })); // sin fotos: respuesta ligera
      return res.status(200).json(items);
    }
    res.status(405).end();
  } catch (e) {
    console.error('inbox error:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}