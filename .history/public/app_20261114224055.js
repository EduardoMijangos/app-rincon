// ====== CONFIGURA AQUÍ ======
const CONFIG = {
  name: 'preciosa',
  startDate: '2024-02-14T00:00:00', // ← la fecha en que empezaron
  vapidKey: 'BGovB4Y_bkqmOhy8AjInl_8asWSae9y2_N7KM1REYXRDjlCldQ8WF5wdh8a9Hw9_sPEKYfKZMhvo4rA4uBinqwQ'
};
const loveQuotes = [
  "Si tuviera que volver a elegir, te elegiría a ti mil veces más.",
  "Tu sonrisa es literalmente mi notificación favorita del día.",
  "No sé qué hiciste, pero desde que llegaste todo tiene más color.",
  "Eres la casualidad más bonita que me ha pasado.",
  "Solo pasaba a recordarte lo increíble y valiosa que eres.",
  "Me encanta cómo eres, incluso en tus días más locos.",
  "Contigo cualquier plan simple se convierte en mi favorito."
];
const letters = [
  ["Estés triste", "Respira. Nada de lo que sientes hoy te quita lo valiente. Aquí estoy, aunque sea desde la pantalla."],
  ["Me extrañes", "Yo también te extraño. Cierra los ojos un momento: ya casi toca abrazo."],
  ["No puedas dormir", "Piensa en algo bonito que hayamos vivido. Yo ya estoy pensando en el mío. Buenas noches, vida."],
  ["Dudes de ti", "Eres más capaz de lo que crees. Lo digo yo, que te veo de cerca."],
  ["Estés feliz", "¡Qué bonito verte así! Guarda este momento, porque yo lo guardo contigo."]
];
const $ = id => document.getElementById(id);
const rand = a => a[Math.floor(Math.random() * a.length)];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3000);
}
function burst(x, y, emoji = '💖', n = 8) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst'; s.textContent = emoji;
    s.style.left = x + 'px'; s.style.top = y + 'px';
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}

// --- Saludo según la hora ---
const h = new Date().getHours();
$('greeting').textContent = (h < 6 ? 'Buenas madrugadas' : h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches')
  + `, ${CONFIG.name} 🌸 Este rincón es para ti.`;

// --- Corazones flotantes ---
setInterval(() => {
  if (document.hidden) return;
  const e = document.createElement('span');
  e.className = 'float-heart'; e.textContent = rand(['❤️', '💕', '💗', '✨', '🌸']);
  e.style.left = Math.random() * 100 + '%';
  e.style.fontSize = 14 + Math.random() * 20 + 'px';
  e.style.animationDuration = 7 + Math.random() * 6 + 's';
  $('floating-hearts').appendChild(e); setTimeout(() => e.remove(), 14000);
}, 1200);

// --- Contador de tiempo juntos ---
function tick() {
  let s = Math.max(0, Math.floor((Date.now() - new Date(CONFIG.startDate)) / 1000));
  const d = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); s %= 60;
  $('counter').innerHTML = [[d, 'días'], [hh, 'horas'], [m, 'min'], [s, 'seg']]
    .map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
}
tick(); setInterval(tick, 1000);

// --- Modal ---
$('welcome-msg').textContent = `"${rand(loveQuotes)}"`;
$('close-modal').addEventListener('click', e => { $('welcome-modal').style.display = 'none'; burst(e.clientX, e.clientY, '❤️', 12); });
$('close-modal').focus();

// --- Frases + favoritos ---
let lastQuote = '', favs = store.get('favs', []);
function renderFavs() { $('favs' in window ? 'favs' : 'favorites').innerHTML = favs.map(f => `<p>💗 ${f}</p>`).join(''); }
$('new-quote-btn').addEventListener('click', e => {
  let q; do { q = rand(loveQuotes); } while (q === lastQuote && loveQuotes.length > 1);
  lastQuote = q; $('love-quote').textContent = `"${q}"`; burst(e.clientX, e.clientY);
});
$('copy-quote-btn').addEventListener('click', () => {
  if (!lastQuote) return toast('Primero descubre un detalle 💌');
  if (favs.includes(lastQuote)) return toast('Ya está en tus favoritos 💗');
  favs.push(lastQuote); store.set('favs', favs); renderFavs(); toast('Guardado en tus favoritos 💗');
});
renderFavs();

// --- Ábrelo cuando… ---
letters.forEach(([label, text]) => {
  const b = document.createElement('button');
  b.textContent = label; b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', e => {
    document.querySelectorAll('.letters button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    const box = $('letter-text'); box.textContent = text; box.classList.remove('hidden');
    burst(e.clientX, e.clientY, '💌', 6);
  });
  $('letters').appendChild(b);
});
document.querySelectorAll('#letters button').forEach(b => b.textContent = 'Ábrelo cuando ' + b.textContent.toLowerCase());

// --- Minijuego ---
let score = 0, timeLeft = 20, spawner, clock, best = store.get('best', 0);
$('best').textContent = best;
function endGame() {
  clearInterval(spawner); clearInterval(clock); $('game-area').innerHTML = '';
  $('start-game-btn').textContent = 'Jugar otra vez'; $('start-game-btn').disabled = false;
  if (score > best) { best = score; store.set('best', best); $('best').textContent = best; toast(`¡Nuevo récord: ${score}! 🎉`); burst(innerWidth / 2, innerHeight / 2, '🎉', 16); }
  else toast(`¡Tiempo! Hiciste ${score} puntos. Te ganaste un abrazo gigante ❤️`);
}
$('start-game-btn').addEventListener('click', () => {
  clearInterval(spawner); clearInterval(clock);
  score = 0; timeLeft = 20; $('score').textContent = 0; $('time').textContent = 20;
  $('game-area').innerHTML = ''; $('start-game-btn').disabled = true; $('start-game-btn').textContent = 'Jugando…';
  spawner = setInterval(spawnHeart, 650);
  clock = setInterval(() => { $('time').textContent = --timeLeft; if (timeLeft <= 0) endGame(); }, 1000);
});
function spawnHeart() {
  const area = $('game-area'), el = document.createElement('div');
  el.className = 'target-heart';
  const gold = Math.random() < 0.12; // corazón dorado = 3 puntos
  el.textContent = gold ? '💛' : rand(['❤️', '💖', '💕', '💘', '✨']);
  el.style.left = Math.random() * (area.clientWidth - 40) + 'px';
  el.style.top = Math.random() * (area.clientHeight - 40) + 'px';
  el.addEventListener('pointerdown', e => {
    score += gold ? 3 : 1; $('score').textContent = score;
    burst(e.clientX, e.clientY, el.textContent, 4); el.remove();
  });
  area.appendChild(el); setTimeout(() => el.remove(), 1300);
}

// --- Notas ---
const notes = $('secret-notes'); notes.value = store.get('notes', '');
let saveT;
notes.addEventListener('input', () => {
  $('save-status').textContent = 'Guardando…'; clearTimeout(saveT);
  saveT = setTimeout(() => { store.set('notes', notes.value); $('save-status').textContent = 'Guardado en tu dispositivo ✨'; }, 500);
});

// --- Service Worker y notificaciones ---
const notifBtn = $('enable-notif');
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error);
if (!('PushManager' in window) || !('Notification' in window)) {
  notifBtn.textContent = '📲 Instálame en tu inicio para los mensajitos';
  notifBtn.addEventListener('click', () => toast('En iPhone: Compartir → Añadir a pantalla de inicio, y ábreme desde ahí 💕'));
} else {
  if (Notification.permission === 'granted') { notifBtn.textContent = '✅ Mensajitos activados'; notifBtn.disabled = true; }
  notifBtn.addEventListener('click', async () => {
    try {
      if (await Notification.requestPermission() !== 'granted') return toast('Permite las notificaciones para recibir mensajitos lindos ❤️');
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({
        userVisibleOnly: true, applicationServerKey: urlB64(CONFIG.vapidKey)
      });
      const r = await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(sub), headers: { 'Content-Type': 'application/json' } });
      if (!r.ok) throw new Error('subscribe ' + r.status);
      notifBtn.textContent = '✅ Mensajitos activados'; notifBtn.disabled = true;
      reg.showNotification('¡Hola preciosa! ❤️', { body: 'A partir de ahora te recordaré lo mucho que me importas.', icon: 'icon.svg' });
    } catch (err) { console.error(err); toast('No se pudo activar. Inténtalo de nuevo 💔'); }
  });
}
function urlB64(s) {
  const b = (s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b), c => c.charCodeAt(0));
}
