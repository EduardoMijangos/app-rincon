import webpush from 'web-push';
import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') { // solo tú (con ADMIN_KEY) puedes enviarle cosas
      if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).end();
      const { text = '', image, replyTo = '', replyText = '' } = req.body || {};
      const t = String(text).trim().slice(0, 1000);
      if (!t && !image) return res.status(400).json({ error: 'Mensaje vacío' });
      if (image && (!/^data:image\/jpeg;base64,/.test(image) || image.length > 800000))
        return res.status(400).json({ error: 'Imagen inválida o muy grande' });
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await redis.set(`outbox:${id}`, {
        id, at: Date.now(), text: t,
        replyTo: String(replyTo).slice(0, 40), replyText: String(replyText).slice(0, 120),
        ...(image ? { image } : {})
      });
      await redis.lpush('outbox', id);
      await redis.ltrim('outbox', 0, 99);
      let pushed = false;
      try { // le avisa con una notificación
        const raw = await redis.get('girlfriend_sub');
        if (raw) {
          webpush.setVapidDetails('mailto:tu-correo@ejemplo.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
          await webpush.sendNotification(typeof raw === 'string' ? JSON.parse(raw) : raw,
            JSON.stringify({ title: 'Tienes un mensajito 💌', body: t ? t.slice(0, 100) : 'Te mandé una foto 📸' }));
          pushed = true;
        }
      } catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await redis.del('girlfriend_sub'); }
      return res.status(201).json({ id, pushed });
    }
    if (req.method === 'GET') { // lectura abierta: la app de ella lo consulta sin clave
      if (req.query.img) {
        const it = await redis.get(`outbox:${req.query.img}`);
        if (!it || !it.image) return res.status(404).end();
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'private, max-age=86400');
        return res.status(200).send(Buffer.from(it.image.split(',')[1], 'base64'));
      }
      const ids = await redis.lrange('outbox', 0, 29);
      const items = ids.length ? (await redis.mget(...ids.map(i => `outbox:${i}`))).filter(Boolean) : [];
      return res.status(200).json(items.map(({ image, ...r }) => ({ ...r, hasImage: !!image })));
    }
    res.status(405).end();
  } catch (e) {
    console.error('outbox error:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}