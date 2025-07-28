const CACHE_NAME = 'isr-cache-v3'; // Versi diperbarui
const API_CACHE_NAME = 'isr-api-cache-v1';
const OFFLINE_URL = 'offline.html';

// Daftar asset yang akan di-cache
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'splash.html',
  'offline.html',
  'css/isr.css',
  'js/cores.js',
  'js/handlers.js',
  'assets/main.css',
  'assets/main.js',
  'assets/nodeline.js',
  'logoh.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Daftar CDN dan external resources
const EXTERNAL_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        // Cache asset utama
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return caches.open(API_CACHE_NAME);
      })
      .then((cache) => {
        // Cache external resources
        return cache.addAll(EXTERNAL_RESOURCES);
      })
      .catch((err) => {
        console.error('Cache addAll error:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle API requests
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Simpan response ke cache jika sukses
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            // Fallback ke cache jika offline
            return cache.match(event.request)
              .then(cachedResponse => cachedResponse || 
                new Response(JSON.stringify({error: "You're offline"}), {
                  headers: {'Content-Type': 'application/json'}
                })
              );
          });
      })
    );
    return;
  }

  // Cache-first strategy untuk asset lainnya
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response jika ada, otherwise fetch dari network
        return cachedResponse || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
