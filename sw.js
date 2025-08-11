const CACHE_NAME = 'safety-report-v26';
const API_CACHE_NAME = 'safety-report-api-v1';
const ASSETS_TO_CACHE = [
  './',
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
          if (cache !== CACHE_NAME && cache !== API_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip unsupported schemes
  if (!['http', 'https'].includes(url.protocol.replace(':', ''))) {
    return;
  }

  if (event.request.method !== 'GET') return;
  
  // Network-first strategy for HTML documents
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))
            .catch(err => console.error('Failed to cache HTML:', err));
          return response;
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('index.html');
        })
    );
    return;
  }

  // Network-first strategy for API calls
  if (url.href.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache API responses for offline use
          const responseToCache = response.clone();
          caches.open(API_CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))
            .catch(err => console.error('Failed to cache API response:', err));
          return response;
        })
        .catch(() => {
          // Try to serve from cache if offline
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(JSON.stringify({
                error: "Offline mode",
                message: "You're offline. Some features may not be available."
              }), {
                headers: {'Content-Type': 'application/json'}
              });
            });
        })
    );
    return;
  }

  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          // Update cache in the background
          fetch(event.request)
            .then(response => {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, response))
                .catch(err => console.error('Background cache update failed:', err));
            })
            .catch(err => console.error('Background fetch failed:', err));
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache the response if valid
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache))
                .catch(err => console.error('Failed to cache response:', err));
            }
            return response;
          })
          .catch(() => {
            // Generic offline fallback
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
