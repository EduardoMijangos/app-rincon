// ====== CONFIGURA AQUÍ ======
const CONFIG = {
  name: 'preciosa',
  startDate: '2026-11-13T00:00:00',
  vapidKey: 'BJcFhpdYeBJw4OejB9y0UZkmRwDJf10Fc1bQIuisuD3d28b69WoFrfVbqae1E9-_DrCcX6xAcHk2C2_OiB5voHc',
  dates: [ // fechas que se repiten cada año: mes-día
    { label: 'Cumple de nuestro rincón', md: '11-13', emoji: '🎉' },
    { label: 'Tu cumpleaños', md: '03-20', emoji: '🎂' },
    { label: 'San Valentín', md: '02-14', emoji: '🌹' }
  ]
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
  ["estés triste", "Respira. Nada de lo que sientes hoy te quita lo valiente. Aquí estoy, aunque sea desde la pantalla."],
  ["me extrañes", "Yo también te extraño. Cierra los ojos un momento: ya casi toca abrazo."],
  ["no puedas dormir", "Piensa en algo bonito que hayamos vivido. Yo ya estoy pensando en el mío. Buenas noches, vida."],
  ["dudes de ti", "Eres más capaz de lo que crees. Lo digo yo, que te veo de cerca."],
  ["estés feliz", "¡Qué bonito verte así! Guarda este momento, porque yo lo guardo contigo."]
];
const moods = {
  '😊': "Me alegra saberlo. Que nada te quite esa sonrisa hoy 🌞",
  '🥰': "Qué bonito. Esa energía tuya contagia a cualquiera, empezando por mí 💕",
  '😐': "Un día regular también cuenta. Mira algo que te guste y date un respiro 🍵",
  '😔': "Aquí estoy contigo. Si quieres, cuéntame en «Un mensaje para mí». No tienes que cargar sola con esto 🫂",
  '😴': "Hoy toca ir con calma. Toma agua, descansa lo que puedas y sé amable contigo 🌙"
};
const waterMsgs = ["💧 Recordatorio: toma un poco de agua, mi amor.", "💧 Tu cuerpo te lo agradece: un vasito de agua."];
const kindMsgs = [...loveQuotes, "Respira hondo y estírate un poquito 🌿", "Estoy orgulloso de ti, aunque hoy no lo hayas notado ✨", "Come algo rico hoy, te lo mereces 🍓"];

const $ = id => document.getElementById(id);
const rand = a => a[Math.floor(Math.random() * a.length)];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200);
}
function burst(x, y, emoji = '💖', n = 8) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst'; s.textContent = emoji; s.style.left = x + 'px'; s.style.top = y + 'px';
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}
async function api(body) {
  const r = await fetch('/api/inbox', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (!r.ok) throw new Error(r.status);
}

// --- Saludo, contador y racha ---
const hr = new Date().getHours();
$('greeting').textContent = (hr < 6 ? 'Buenas madrugadas' : hr < 12 ? 'Buenos días' : hr < 20 ? 'Buenas tardes' : 'Buenas noches') + `, ${CONFIG.name} 🌸`;
function tick() {
  let s = Math.max(0, Math.floor((Date.now() - new Date(CONFIG.startDate)) / 1000));
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); s %= 60;
  $('counter').innerHTML = [[d, 'días'], [h, 'horas'], [m, 'min'], [s, 'seg']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
}
tick(); setInterval(tick, 1000);
(function streak() {
  const today = new Date().toDateString(), y = new Date(Date.now() - 864e5).toDateString();
  let st = store.get('streak', { last: '', n: 0 });
  if (st.last !== today) { st = { last: today, n: st.last === y ? st.n + 1 : 1 }; store.set('streak', st); }
  $('streak').textContent = st.n > 1 ? `🔥 ${st.n} días seguidos visitando tu rincón` : '✨ Qué bueno que viniste hoy';
})();

// --- Corazones flotantes ---
setInterval(() => {
  if (document.hidden) return;
  const e = document.createElement('span');
  e.className = 'float-heart'; e.textContent = rand(['❤️', '💕', '💗', '✨', '🌸']);
  e.style.left = Math.random() * 100 + '%'; e.style.fontSize = 14 + Math.random() * 20 + 'px';
  e.style.animationDuration = 7 + Math.random() * 6 + 's';
  $('floating-hearts').appendChild(e); setTimeout(() => e.remove(), 14000);
}, 1200);

// --- Modal ---
$('welcome-msg').textContent = `"${rand(loveQuotes)}"`;
$('close-modal').addEventListener('click', e => { $('welcome-modal').style.display = 'none'; burst(e.clientX, e.clientY, '❤️', 12); });
$('close-modal').focus();

// --- Mensaje del día y favoritos ---
const dayIdx = Math.floor(Date.now() / 864e5);
let current = loveQuotes[dayIdx % loveQuotes.length], favs = store.get('favs', []);
$('daily').textContent = `"${current}"`;
const renderFavs = () => $('favorites').innerHTML = favs.map(f => `<p>💗 ${f.replace(/</g, '&lt;')}</p>`).join('');
$('new-quote-btn').addEventListener('click', e => {
  let q; do { q = rand(loveQuotes); } while (q === current);
  current = q; $('daily').textContent = `"${q}"`; burst(e.clientX, e.clientY);
});
$('fav-btn').addEventListener('click', () => {
  if (favs.includes(current)) return toast('Ya está en tus favoritos 💗');
  favs.push(current); store.set('favs', favs); renderFavs(); toast('Guardado en tus favoritos 💗');
});
renderFavs();

// --- Estado de ánimo (me llega al buzón) ---
Object.keys(moods).forEach(m => {
  const b = document.createElement('button'); b.textContent = m; b.setAttribute('aria-label', 'Me siento ' + m); b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', e => {
    document.querySelectorAll('#moods button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
    const r = $('mood-reply'); r.textContent = moods[m]; r.classList.remove('hidden'); burst(e.clientX, e.clientY, m, 6);
    api({ type: 'mood', mood: m }).catch(() => {});
  });
  $('moods').appendChild(b);
});

// --- Fechas importantes ---
$('dates').innerHTML = CONFIG.dates.map(d => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  let t = new Date(`${now.getFullYear()}-${d.md}T00:00:00`); if (t < now) t.setFullYear(t.getFullYear() + 1);
  const n = Math.round((t - now) / 864e5);
  return `<div class="date-item"><span>${d.emoji} ${d.label}</span><b>${n === 0 ? '¡Hoy! 🎉' : n === 1 ? 'Mañana' : n + ' días'}</b></div>`;
}).join('');

// --- Ábrelo cuando… ---
letters.forEach(([label, text]) => {
  const b = document.createElement('button'); b.textContent = 'Ábrelo cuando ' + label; b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', e => {
    document.querySelectorAll('#letters button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
    const box = $('letter-text'); box.textContent = text; box.classList.remove('hidden'); burst(e.clientX, e.clientY, '💌', 6);
  });
  $('letters').appendChild(b);
});

// --- Fotos: se reducen en el teléfono y se envían al buzón ---
let photoData = '';
$('photo-input').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const bmp = await createImageBitmap(f), k = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    photoData = c.toDataURL('image/jpeg', 0.72);
    $('photo-preview').src = photoData;
    ['photo-preview', 'photo-caption', 'photo-send'].forEach(i => $(i).classList.remove('hidden'));
  } catch { toast('No pude leer esa foto. Prueba con otra 💔'); }
});
$('photo-send').addEventListener('click', async e => {
  const btn = e.target; btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    await api({ type: 'photo', image: photoData, caption: $('photo-caption').value });
    const img = document.createElement('img'); img.src = photoData; img.alt = 'Foto enviada'; $('my-photos').prepend(img);
    ['photo-preview', 'photo-caption', 'photo-send'].forEach(i => $(i).classList.add('hidden'));
    $('photo-caption').value = ''; $('photo-input').value = ''; photoData = '';
    store.set('sentPhoto', store.get('sentPhoto', 0) + 1); toast('¡Foto enviada! Me encantó 💕'); burst(e.clientX, e.clientY, '📸', 8);
  } catch { toast('No se pudo enviar la foto. Inténtalo otra vez 💔'); }
  btn.disabled = false; btn.textContent = 'Enviar foto 💌';
});

// --- Mensaje para mí ---
$('msg-send').addEventListener('click', async e => {
  const t = $('msg-text').value.trim(); if (!t) return toast('Escribe algo primero ✍️');
  try { await api({ type: 'message', text: t }); $('msg-text').value = ''; toast('Mensaje enviado 💌'); burst(e.clientX, e.clientY, '💌', 8); }
  catch { toast('No se pudo enviar. Inténtalo otra vez 💔'); }
});

// --- Recordatorios bonitos (mientras la app está abierta) ---
let remindTimer, rs = store.get('remind', { every: 0, water: false });
$('remind-every').value = rs.every; $('remind-water').checked = rs.water;
async function remind() {
  const m = rs.water && Math.random() < 0.4 ? rand(waterMsgs) : rand(kindMsgs);
  toast(m);
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    const reg = await navigator.serviceWorker.ready; reg.showNotification('Para ti 💌', { body: m, icon: '/icon.svg', tag: 'mensajito' });
  }
}
function setRemind() {
  rs = { every: +$('remind-every').value, water: $('remind-water').checked }; store.set('remind', rs);
  clearInterval(remindTimer); if (rs.every) remindTimer = setInterval(remind, rs.every * 60000);
}
$('remind-every').addEventListener('change', () => { setRemind(); toast(rs.every ? 'Recordatorios activados 💕' : 'Recordatorios apagados'); });
$('remind-water').addEventListener('change', setRemind); setRemind();

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
  const area = $('game-area'), el = document.createElement('div'), gold = Math.random() < 0.12;
  el.className = 'target-heart'; el.textContent = gold ? '💛' : rand(['❤️', '💖', '💕', '💘', '✨']);
  el.style.left = Math.random() * (area.clientWidth - 40) + 'px'; el.style.top = Math.random() * (area.clientHeight - 40) + 'px';
  el.addEventListener('pointerdown', e => { score += gold ? 3 : 1; $('score').textContent = score; burst(e.clientX, e.clientY, el.textContent, 4); el.remove(); });
  area.appendChild(el); setTimeout(() => el.remove(), 1300);
}

// --- Notas (guardadas solo en el teléfono; ella decide si compartir una) ---
let noteList = store.get('noteList', null);
if (!noteList) { const old = store.get('notes', ''); noteList = old ? [{ id: Date.now(), text: old, at: Date.now() }] : []; store.set('noteList', noteList); }
const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
function renderNotes() {
  const box = $('notes-list'); box.innerHTML = '';
  noteList.forEach(n => {
    const d = mk('div', 'note'), r = mk('div', 'row');
    const share = mk('button', '', '💌 Compartir con él'), del = mk('button', '', '🗑️ Borrar');
    share.addEventListener('click', () => api({ type: 'message', text: '📝 Nota compartida: ' + n.text }).then(() => toast('Nota compartida 💌')).catch(() => toast('No se pudo compartir 💔')));
    del.addEventListener('click', () => { if (confirm('¿Borrar esta nota?')) { noteList = noteList.filter(x => x.id !== n.id); store.set('noteList', noteList); renderNotes(); } });
    r.append(share, del); d.append(mk('small', '', new Date(n.at).toLocaleString('es-MX')), mk('p', '', n.text), r); box.append(d);
  });
  renderStats();
}
$('note-add').addEventListener('click', () => {
  const t = $('note-input').value.trim(); if (!t) return toast('Escribe algo primero ✍️');
  noteList.unshift({ id: Date.now(), text: t, at: Date.now() }); store.set('noteList', noteList);
  $('note-input').value = ''; renderNotes(); toast('Nota guardada ✨');
});

// --- Dashboard: estadísticas y lo que él le manda ---
let outItems = [], toastedNew = 0;
let capsules = store.get('capsules', []);
function renderStats() {
  const st = store.get('streak', { n: 1 });
  const photos = outItems.filter(i => i.hasImage).length;
  $('stats').innerHTML = [[`🔥 ${st.n}`, 'días de racha'], [`📝 ${noteList.length}`, 'notas guardadas'], [`💌 ${outItems.length}`, 'mensajes de él'], [`📸 ${photos}`, 'fotos de él']]
    .map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  renderBadges();
}
function renderFeed() {
  const box = $('from-him'), seen = store.get('seenOut', 0); box.innerHTML = '';
  if (!outItems.length) box.textContent = 'Aquí aparecerán los mensajes y fotos que te mande 💕';
  outItems.forEach(it => {
    const a = mk('article', it.at > seen ? 'fresh' : '');
    a.append(mk('small', '', new Date(it.at).toLocaleString('es-MX')));
    if (it.replyText) a.append(mk('blockquote', '', 'Respondiendo a: ' + it.replyText));
    if (it.text) a.append(mk('p', '', it.text));
    if (it.hasImage) { const i = mk('img'); i.src = '/api/outbox?img=' + encodeURIComponent(it.id); i.alt = 'Foto de él'; i.loading = 'lazy'; a.append(i); }
    box.append(a);
  });
  const fresh = outItems.filter(i => i.at > seen).length, bd = $('new-badge');
  bd.textContent = fresh + (fresh === 1 ? ' nuevo' : ' nuevos'); bd.classList.toggle('hidden', !fresh);
  if (fresh && fresh !== toastedNew) { toastedNew = fresh; toast('Tienes un mensajito nuevo 💌'); }
  renderStats();
}
async function loadOut() {
  try { const r = await fetch('/api/outbox'); if (r.ok) { outItems = await r.json(); renderFeed(); } } catch {}
}
new IntersectionObserver((e, o) => { if (e[0].isIntersecting && outItems.length) setTimeout(() => {
  store.set('seenOut', Math.max(...outItems.map(i => i.at))); $('new-badge').classList.add('hidden'); }, 2500); }, { threshold: 0.4 }).observe($('dashboard'));
renderNotes(); loadOut(); setInterval(loadOut, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadOut(); });

// --- Buzón (solo si abres la página con ?admin=TU_CLAVE) ---
const ADMIN = new URLSearchParams(location.search).get('admin');
if (ADMIN) {
  $('admin').classList.remove('hidden'); $('welcome-modal').style.display = 'none';
  const load = async () => {
    try {
      const r = await fetch('/api/inbox?key=' + encodeURIComponent(ADMIN)); if (!r.ok) throw 0;
      const items = await r.json(), box = $('inbox'); box.innerHTML = '';
      if (!items.length) box.textContent = 'Aún no hay nada en el buzón.';
      items.forEach(it => {
        const a = document.createElement('article'), s = document.createElement('small');
        s.textContent = new Date(it.at).toLocaleString('es-MX') + ' · ' + { photo: '📸 Foto', message: '✉️ Mensaje', mood: '🌈 Ánimo' }[it.type];
        a.append(s);
        const txt = it.type === 'mood' ? it.mood : it.type === 'photo' ? it.caption : it.text;
        if (txt) { const p = document.createElement('p'); p.textContent = txt; a.append(p); }
        if (it.image) { const i = document.createElement('img'); i.src = it.image; i.alt = it.caption || 'Foto'; a.append(i); }
        box.append(a);
      });
    } catch { toast('Clave incorrecta o sin conexión'); }
  };
  $('admin-refresh').addEventListener('click', load); load();
}

// --- Tema día / noche ---
const themeBtn = $('theme-btn'), hnow = new Date().getHours();
function applyTheme(t) {
  document.body.dataset.theme = t; themeBtn.textContent = t === 'night' ? '☀️' : '🌙';
  document.querySelector('meta[name=theme-color]').content = t === 'night' ? '#2b2140' : '#ff5d8f';
}
applyTheme(store.get('theme', hnow >= 20 || hnow < 6 ? 'night' : 'day'));
themeBtn.addEventListener('click', () => { const t = document.body.dataset.theme === 'night' ? 'day' : 'night'; store.set('theme', t); applyTheme(t); });

// --- Pregunta del día (la respuesta me llega al buzón) ---
const questions = [
  "¿Qué fue lo mejor que te pasó esta semana?", "Si pudiéramos viajar mañana, ¿a dónde iríamos?",
  "¿Qué canción te hace pensar en mí?", "¿Qué comida te levanta el ánimo siempre?",
  "¿Cuál es un recuerdo nuestro que te saca una sonrisa?", "¿Qué te gustaría que hiciéramos juntos este mes?",
  "¿Qué es algo pequeño que te hace feliz?", "¿Qué sueño tuyo todavía no me has contado?",
  "¿Cómo sería tu día perfecto?", "¿Qué te hizo reír hoy?",
  "¿Qué cosa nueva te gustaría aprender?", "¿Qué te gustaría que supiera de ti que no sé?",
  "¿Cuál es tu lugar favorito para estar tranquila?", "¿Qué te gustaría pedirme hoy?"
];
const qToday = questions[dayIdx % questions.length];
$('q-text').textContent = qToday;
function syncQ() {
  const done = store.get('qDone', '') === new Date().toDateString();
  $('q-answer').classList.toggle('hidden', done); $('q-send').disabled = done;
  $('q-send').textContent = done ? 'Respondida hoy ✅' : 'Enviar respuesta';
}
$('q-send').addEventListener('click', async e => {
  const t = $('q-answer').value.trim(); if (!t) return toast('Escribe tu respuesta primero ✍️');
  try {
    await api({ type: 'message', text: `💭 ${qToday}\n${t}` });
    store.set('qDone', new Date().toDateString()); store.set('qCount', store.get('qCount', 0) + 1);
    $('q-answer').value = ''; syncQ(); renderStats(); toast('Respuesta enviada 💌'); burst(e.clientX, e.clientY, '💭', 8);
  } catch { toast('No se pudo enviar. Inténtalo otra vez 💔'); }
});
syncQ();

// --- Cápsula del tiempo (queda en el teléfono hasta que llega la fecha) ---
const ymd = d => d.toLocaleDateString('en-CA');
$('cap-date').min = ymd(new Date(Date.now() + 864e5));
function renderCaps() {
  const box = $('caps'); box.innerHTML = '';
  capsules.sort((a, b) => a.open.localeCompare(b.open)).forEach(c => {
    const locked = c.open > ymd(new Date()), n = mk('div', 'note'), r = mk('div', 'row'), del = mk('button', '', '🗑️ Borrar');
    const when = new Date(c.open + 'T00:00:00').toLocaleDateString('es-MX', { dateStyle: 'long' });
    n.append(mk('small', '', locked ? '🔒 Se abre el ' + when : '🔓 Se abrió el ' + when), mk('p', '', locked ? 'Todavía no es momento… 💌' : c.text));
    del.addEventListener('click', () => { if (confirm('¿Borrar esta cápsula?')) { capsules = capsules.filter(x => x.id !== c.id); store.set('capsules', capsules); renderCaps(); } });
    r.append(del); n.append(r); box.append(n);
  });
}
$('cap-add').addEventListener('click', () => {
  const t = $('cap-text').value.trim(), d = $('cap-date').value;
  if (!t || !d) return toast('Escribe tu mensaje y elige una fecha ✍️');
  if (d <= ymd(new Date())) return toast('Elige una fecha futura ⏳');
  capsules.push({ id: Date.now(), text: t, open: d }); store.set('capsules', capsules);
  $('cap-text').value = ''; $('cap-date').value = ''; renderCaps(); toast('Cápsula guardada. ¡Nos vemos en el futuro! ⏳');
});
renderCaps();
if (capsules.some(c => c.open === ymd(new Date()))) setTimeout(() => toast('⏳ ¡Hoy se abre una de tus cápsulas del tiempo!'), 2500);

// --- Logros ---
function renderBadges() {
  const st = store.get('streak', { n: 1 });
  const list = [['🌱', 'Llegaste al rincón', true], ['🔥', '7 días de racha', st.n >= 7], ['📸', 'Primera foto enviada', store.get('sentPhoto', 0) > 0],
    ['💭', 'Respondiste una pregunta', store.get('qCount', 0) > 0], ['🎮', 'Récord de 15 puntos', best >= 15], ['📝', '5 notas guardadas', noteList.length >= 5],
    ['⏳', 'Creaste una cápsula', capsules.length > 0]];
  $('badges').innerHTML = list.map(([e, l, ok]) => `<span class="${ok ? '' : 'off'}" title="${ok ? 'Logro desbloqueado' : 'Aún bloqueado'}">${e} ${l}</span>`).join('');
}

// --- Service Worker y notificaciones push ---
const notifBtn = $('enable-notif');
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(console.error);
if (!('PushManager' in window) || !('Notification' in window)) {
  notifBtn.textContent = '📲 Instálame en tu inicio para los mensajitos';
  notifBtn.addEventListener('click', () => toast('En iPhone: Compartir → Añadir a pantalla de inicio, y ábreme desde ahí 💕'));
} else {
  if (Notification.permission === 'granted') { notifBtn.textContent = '✅ Mensajitos activados'; notifBtn.disabled = true; resync(); }
  notifBtn.addEventListener('click', async () => {
    try {
      if (await Notification.requestPermission() !== 'granted') return toast('Permite las notificaciones para recibir mensajitos lindos ❤️');
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(CONFIG.vapidKey) });
      const r = await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(sub), headers: { 'Content-Type': 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      notifBtn.textContent = '✅ Mensajitos activados'; notifBtn.disabled = true;
      reg.showNotification('¡Hola preciosa! ❤️', { body: 'A partir de ahora te recordaré lo mucho que me importas.', icon: '/icon.svg' });
    } catch (err) { console.error(err); toast('No se pudo activar. Inténtalo de nuevo 💔'); }
  });
}
function urlB64(s) {
  const b = (s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b), c => c.charCodeAt(0));
}

// Si cambió la clave VAPID, renueva la suscripción sin pedir permiso otra vez y la guarda en el servidor
async function resync() {
  try {
    const reg = await navigator.serviceWorker.ready, want = urlB64(CONFIG.vapidKey);
    let sub = await reg.pushManager.getSubscription();
    const have = sub && sub.options && sub.options.applicationServerKey ? new Uint8Array(sub.options.applicationServerKey) : null;
    if (!have || have.length !== want.length || !have.every((v, i) => v === want[i])) {
      if (sub) await sub.unsubscribe();
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: want });
    }
    await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(sub), headers: { 'Content-Type': 'application/json' } });
  } catch (e) { console.error('resync', e); }
}