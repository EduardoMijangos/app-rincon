self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {
        title: 'Pensando en ti ❤️',
        body: 'Solo quería recordarte que eres increíble.'
    };

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
        vibrate: [200, 100, 200],
        data: { url: '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});