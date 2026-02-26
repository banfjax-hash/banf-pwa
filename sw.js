const CACHE_NAME = 'banf-pwa-v1';
const BASE = self.registration.scope;
const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'css/app.css',
  BASE + 'js/app.js',
  BASE + 'js/api.js',
  BASE + 'js/router.js',
  BASE + 'js/radio.js',
  BASE + 'js/pages.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192x192.png',
  BASE + 'icons/icon-512x512.png'
];

// Install - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first for API, cache first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls: network first, no cache
  if (url.pathname.includes('/_functions/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses for offline
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME + '-api').then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BANF';
  const options = {
    body: data.body || 'New update from BANF',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    tag: data.tag || 'banf-notification',
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
        windowClients[0].navigate(event.notification.data.url);
      } else {
        clients.openWindow(event.notification.data.url);
      }
    })
  );
});
