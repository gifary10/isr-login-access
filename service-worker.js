// Ganti ke versi fix (pakai versi app, bisa diganti hash hasil build)
const CACHE_PREFIX = 'login-access-';
const CACHE_VERSION = 'v1.0.3'; // naikin angka/hashing saat ada perubahan
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

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
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

const API_URL = 'https://script.google.com/macros/s/AKfycbxmmdgHsgikOoJ_H5ppkFLSKIZfwmgQbcl2xMjon3naP-c-Oqf8t-q2X80tuvtYM-MF5w/exec';

// Install: cache assets baru
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);

      await Promise.all(CDN_ASSETS.map(async url => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) await cache.put(url, response.clone());
        } catch (err) {
          console.warn('CDN cache failed', url, err);
        }
      }));

      self.skipWaiting(); // langsung aktif tanpa tunggu
    })()
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key.startsWith(CACHE_PREFIX)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', event => {
  const request = event.request;

  // Untuk API → network first
  if (request.url.includes(API_URL)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch {
          return (await cache.match(request)) ||
            new Response(JSON.stringify({ error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
        }
      })()
    );
    return;
  }

  // Untuk asset → stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => null);

      // kalau ada cache → langsung return, sambil update di belakang
      return cachedResponse || fetchPromise || (request.mode === 'navigate'
        ? caches.match('/offline.html')
        : new Response('', { status: 404 }));
    })()
  );
});
