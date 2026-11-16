import webpush from 'web-push';
import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

const messages = [
  "¿Ya tomaste agua hoy, preciosa? Cuídate mucho ❤️",
  "Pasaba por aquí solo para decirte que me encantas.",
  "Espero que tu día esté yendo tan bonito como tú ✨",
  "Recordatorio de esta hora: eres lo mejor que me ha pasado.",
  "Si estás estresada, respira hondo. ¡Tú puedes con todo!",
  "Tengo muchas ganas de verte y abrazarte 🤗",
  "Come algo rico hoy, te lo mereces 🍓",
  "Eres mi persona favorita. Punto. 💕"
];

export default async function handler(req, res) {
  const ok = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` || req.query.secret === process.env.CRON_SECRET;
  if (!process.env.CRON_SECRET || !ok) return res.status(401).end();
  try {
    const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Mexico_City' }).format(new Date())) % 24;
    if (hour >= 23 || hour < 8) return res.status(200).json({ status: 'Hora de descanso 😴' });

    const pubKey = (process.env.VAPID_PUBLIC_KEY || '').trim(), privKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
webpush.setVapidDetails('mailto:eduardo.mijangos.hdz@gmail.com', pubKey, privKey);
    const raw = await redis.get('girlfriend_sub');
    if (!raw) return res.status(200).json({ status: 'Aún no se suscribe' });
    const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const body = messages[Math.floor(Math.random() * messages.length)];
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title: 'Un mensajito para ti 💌', body }));
      res.status(200).json({ sent: body });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await redis.del('girlfriend_sub');
      res.status(200).json({
        error: err.statusCode || 'fallo',
        detalle: String(err.body || err.message || '').slice(0, 300),
        clavePublicaEnVercel: pubKey.slice(0, 12) + '…(' + pubKey.length + ')', // debe empezar con BJcFhpdYeBJw y medir 87
        servicio: new URL(sub.endpoint).host
      });
    }
  } catch (e) {
    console.error('send error:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}