// Versi cache otomatis berdasarkan timestamp atau hash
const CACHE_PREFIX = 'login-access-';
const CACHE_VERSION = Date.now(); // Bisa diganti hash file kalau mau lebih presisi
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

// Install: cache assets
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

      self.skipWaiting();
    })()
  );
});

// Activate: hapus semua cache lama kecuali versi terbaru
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!key.startsWith(CACHE_PREFIX) || key === CACHE_NAME) return;
          return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network first untuk API, cache first untuk asset lain
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.url.includes(API_URL)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch (err) {
          const cachedResponse = await cache.match(request);
          return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
  } else {
    event.respondWith(
      caches.match(request).then(async cached => {
        if (cached) return cached;
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch (err) {
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', { status: 404 });
        }
      })
    );
  }
});