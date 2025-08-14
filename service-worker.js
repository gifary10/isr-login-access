const CACHE_NAME = 'login-access-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/offline.html',
  '/manifest.json',
  '/js/main.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logop.png'
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Precache saat install
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);

      // Cache CDN dengan no-cors
      await Promise.all(CDN_ASSETS.map(url =>
        fetch(url, { mode: 'no-cors' })
          .then(resp => cache.put(url, resp))
          .catch(err => console.warn('CDN cache failed', url, err))
      ));
      self.skipWaiting();
    })()
  );
});

// Hapus cache lama saat activate
self.addEventListener('activate', event => {
  const CACHE_WHITELIST = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => !CACHE_WHITELIST.includes(key) && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  const request = event.request;
  const API_URL = 'https://script.google.com/macros/s/AKfycbxmmdgHsgikOoJ_H5ppkFLSKIZfwmgQbcl2xMjon3naP-c-Oqf8t-q2X80tuvtYM-MF5w/exec';

  if (request.url.includes(API_URL)) {
    // Network first for API
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  } else {
    // Cache first for other assets
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).catch(() =>
          request.mode === 'navigate' ? caches.match('/offline.html') : null
        );
      })
    );
  }
});
