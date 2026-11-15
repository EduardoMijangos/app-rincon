import webpush from 'web-push';
import { kv } from '@vercel/kv';

const messages = [
    "¿Ya tomaste agua hoy, preciosa? Cuídate mucho ❤️",
    "Pasaba por aquí solo para decirte que me encantas.",
    "Espero que tu día esté yendo tan bonito como tú ✨",
    "Recordatorio de esta hora: eres lo mejor que me ha pasado.",
    "Si estás estresada, respira hondo. ¡Tú puedes con todo!",
    "Tengo muchas ganas de verte y abrazarte 🤗"
];

export default async function handler(req, res) {
    webpush.setVapidDetails(
        'mailto:tu-correo@ejemplo.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    const subData = await kv.get('girlfriend_sub');
    if (!subData) return res.status(200).json({ status: 'Aún no se suscribe' });

    const subscription = typeof subData === 'string' ? JSON.parse(subData) : subData;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    await webpush.sendNotification(subscription, JSON.stringify({
        title: 'Un mensajito para ti 💌',
        body: randomMsg
    }));

    res.status(200).json({ sent: randomMsg });
}