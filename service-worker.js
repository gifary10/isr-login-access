// Enhanced Service Worker with Background Sync and Push support
const CACHE_PREFIX = 'login-access-';
const CACHE_VERSION = 'v1.0.4';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const DATA_CACHE_NAME = `${CACHE_PREFIX}data-${CACHE_VERSION}`;
const SYNC_TAG = 'sync-data';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/offline.html',
  '/manifest.json',
  '/js/main.js',
  '/js/bootstrap.bundle.min.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logop.png'
];

const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

const API_URL = 'https://script.google.com/macros/s/AKfycbxmmdgHsgikOoJ_H5ppkFLSKIZfwmgQbcl2xMjon3naP-c-Oqf8t-q2X80tuvtYM-MF5w/exec';

// Install: cache assets and CDN resources
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);

      // Cache CDN resources with network-first strategy
      await Promise.all(CDN_ASSETS.map(async url => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) await cache.put(url, response.clone());
        } catch (err) {
          console.warn('CDN cache failed', url, err);
        }
      }));

      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate: clean up old caches and register sync
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME && key.startsWith(CACHE_PREFIX)) {
            return caches.delete(key);
          }
        })
      );

      // Register periodic sync for background updates
      if ('periodicSync' in self.registration) {
        try {
          await self.registration.periodicSync.register('update-content', {
            minInterval: 24 * 60 * 60 * 1000 // Once per day
          });
          console.log('Periodic sync registered');
        } catch (error) {
          console.log('Periodic sync could not be registered', error);
        }
      }

      // Enable navigation preload for faster responses
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      // Claim clients to ensure SW controls all pages
      self.clients.claim();
    })()
  );
});

// Fetch handler with advanced strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first, then cache
  if (url.href.includes(API_URL)) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          
          // Cache the response for offline use
          const cache = await caches.open(DATA_CACHE_NAME);
          await cache.put(request, networkResponse.clone());
          
          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          
          // If no cache, return offline response
          return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // For navigation requests, use network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first (with preload if available)
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // Network failed, return offline page
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline.html');
          return cachedResponse || Response.error();
        }
      })()
    );
    return;
  }

  // For all other requests, use cache-first with network fallback
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);
        
        // Cache the response for future use
        if (request.url.startsWith('http') && !request.url.includes('chrome-extension')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // If both cache and network fail, return a fallback for images
        if (request.headers.get('Accept').includes('image')) {
          return new Response(
            '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return Response.error();
      }
    })()
  );
});

// Background Sync handler
self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      (async () => {
        // Implement your background sync logic here
        // For example, sync pending API requests
        console.log('Background sync running');
        
        // Show notification when sync completes
        const clients = await self.clients.matchAll();
        if (clients.length === 0) {
          // No clients open, show notification
          self.registration.showNotification('Sync Completed', {
            body: 'Your data has been synchronized in the background',
            icon: '/icons/icon-192x192.png'
          });
        }
      })()
    );
  }
});

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow(event.notification.data.url);
      })
    );
  }
});

// Periodic background sync handler
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(
      (async () => {
        // Update cached data in the background
        const cache = await caches.open(DATA_CACHE_NAME);
        const response = await fetch(API_URL);
        if (response.ok) {
          await cache.put(API_URL, response.clone());
          console.log('Background data update successful');
        }
      })()
    );
  }
});
