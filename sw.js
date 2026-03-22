const CACHE_NAME = 'banda-aviva-v3';

const PRECACHE = [
  '/Escala/',
  '/Escala/index.html',
  '/Escala/manifest.json',
  '/Escala/icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network First com fallback para cache
self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com') ||
      e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(e.request).then(cached =>
          cached || caches.match('/Escala/index.html')
        )
      )
  );
});
