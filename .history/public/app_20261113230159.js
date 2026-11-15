// --- FRASES ROMÁNTICAS (Personalízalas a tu gusto) ---
const loveQuotes = [
    "Si tuviera que volver a elegir, te elegiría a ti mil veces más.",
    "Tu sonrisa es literalmente mi notificación favorita del día.",
    "No sé qué hiciste, pero desde que llegaste todo tiene más color.",
    "Eres la casualidad más bonita que me ha pasado.",
    "Solo pasaba a recordarte lo increíble y valiosa que eres.",
    "Me encanta cómo eres, incluso en tus días más locos.",
    "Contigo cualquier plan simple se convierte en mi favorito."
];

// --- MODAL DE BIENVENIDA ---
const modal = document.getElementById('welcome-modal');
const closeModalBtn = document.getElementById('close-modal');
const welcomeMsg = document.getElementById('welcome-msg');

window.addEventListener('load', () => {
    const randomWelcome = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
    welcomeMsg.textContent = `"${randomWelcome}"`;
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// --- DETALLES ALEATORIOS ---
const quoteBox = document.getElementById('love-quote');
const newQuoteBtn = document.getElementById('new-quote-btn');

newQuoteBtn.addEventListener('click', () => {
    const random = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
    quoteBox.textContent = `"${random}"`;
});

// --- MINIJUEGO ATRAPA CORAZONES ---
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const startGameBtn = document.getElementById('start-game-btn');
let score = 0;
let gameInterval;

startGameBtn.addEventListener('click', () => {
    score = 0;
    scoreDisplay.textContent = score;
    gameArea.innerHTML = '';
    clearInterval(gameInterval);
    startGameBtn.textContent = 'Reiniciar Juego';

    gameInterval = setInterval(spawnHeart, 800);
    setTimeout(() => {
        clearInterval(gameInterval);
        alert(`¡Tiempo! Hiciste ${score} puntos. Ganaste un abrazo gigante mío ❤️`);
    }, 20000); // Dura 20 segundos
});

function spawnHeart() {
    const heart = document.createElement('div');
    heart.classList.add('target-heart');
    const emojis = ['❤️', '💖', '💕', '💘', '✨'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const maxX = gameArea.clientWidth - 40;
    const maxY = gameArea.clientHeight - 40;
    heart.style.left = Math.random() * maxX + 'px';
    heart.style.top = Math.random() * maxY + 'px';

    heart.addEventListener('click', () => {
        score++;
        scoreDisplay.textContent = score;
        heart.remove();
    });

    gameArea.appendChild(heart);
    setTimeout(() => { if (heart.parentNode) heart.remove(); }, 1200);
}

// --- BLOC DE NOTAS LOCAL ---
const notesArea = document.getElementById('secret-notes');
const saveStatus = document.getElementById('save-status');

notesArea.value = localStorage.getItem('her_secret_notes') || '';

notesArea.addEventListener('input', () => {
    localStorage.setItem('her_secret_notes', notesArea.value);
    saveStatus.textContent = 'Guardando...';
    setTimeout(() => {
        saveStatus.textContent = 'Guardado en tu dispositivo ✨';
    }, 600);
});

// --- REGISTRO DE SERVICE WORKER Y NOTIFICACIONES PUSH ---
const notifBtn = document.getElementById('enable-notif');

// REEMPLAZA ESTO CON TU CLAVE PÚBLICA VAPID (ver instrucciones de despliegue)
const PUBLIC_VAPID_KEY = 'BGovB4Y_bkqmOhy8AjInl_8asWSae9y2_N7KM1REYXRDjlCldQ8WF5wdh8a9Hw9_sPEKYfKZMhvo4rA4uBinqwQ';

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('Service Worker registrado', reg);
    });
}

notifBtn.addEventListener('click', async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('Por favor permite las notificaciones para que pueda enviarte mensajitos lindos ❤️');
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });

    // Aquí envías la suscripción a tu backend/base de datos
    await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
    });

    notifBtn.textContent = '✅ ¡Mensajitos activados!';
    notifBtn.disabled = true;

    // Notificación inmediata de prueba
    registration.showNotification('¡Hola preciosa! ❤️', {
        body: 'A partir de ahora te recordaré lo mucho que me importas.',
        icon: 'https://cdn-icons-png.flaticon.com/512/833/833472.png'
    });
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}