// OpenCode Mobile PWA - Service Worker

const CACHE_NAME = 'opencode-mobile-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/marked.min.js',
    '../assets/icon.png',
    '../assets/favicon.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip API requests and external resources
    if (request.url.includes('/api/') ||
        request.url.includes('googleapis.com') ||
        request.url.includes('gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(request).then((networkResponse) => {
                    // Cache successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Return offline page if available
                if (request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Background sync for offline messages (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // TODO: Implement message sync when back online
    console.log('[Service Worker] Syncing messages...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New message from OpenCode',
        icon: '../assets/icon.png',
        badge: '../assets/favicon.png',
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification('OpenCode Mobile', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
