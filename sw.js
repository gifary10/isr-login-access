const CACHE_NAME = 'safety-report-v25';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/modules/LoginSystem.js',
  './js/modules/helpers/fetch.js',
  './js/modules/helpers/offcanvas.js',
  './js/modules/helpers/splash.js',
  './2.png',
  './3.png',
  './logoh.png',
  './logop.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
          .catch(err => {
            console.error('Failed to cache some assets:', err);
          });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip unsupported schemes
  if (!['http', 'https'].includes(new URL(event.request.url).protocol.replace(':', ''))) {
    return;
  }

  if (event.request.method !== 'GET') return;
  
  // Network-first strategy for API calls
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(JSON.stringify({error: "Offline mode not supported for this feature"}), {
            headers: {'Content-Type': 'application/json'}
          });
        })
    );
    return;
  }

  // Cache-first strategy for assets
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request)
          .then((response) => {
            // Don't cache API responses
            if (!event.request.url.includes('script.google.com') && 
                response.status === 200 && 
                response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache))
                .catch(err => console.error('Failed to cache response:', err));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('index.html');
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

