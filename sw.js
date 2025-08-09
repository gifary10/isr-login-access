const CACHE_NAME = 'safety-report-v4';
const PRECACHE_URLS = [
  '',
  'index.html',
  'style.css',
  'app.js',
  'fetch.js',
  'access-control.js',
  'offcanvas.js',
  'splash.js',
  'logop.png',
  'logoh.png',
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://cdn.tailwindcss.com'
];

const STRATEGY = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

const ROUTES = [
  {
    url: new RegExp('/index.html|/$'),
    strategy: STRATEGY.NETWORK_FIRST
  },
  {
    url: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp)$/,
    strategy: STRATEGY.CACHE_FIRST
  },
  {
    url: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/,
    strategy: STRATEGY.CACHE_FIRST
  },
  {
    url: /^https:\/\/cdn\.tailwindcss\.com/,
    strategy: STRATEGY.CACHE_FIRST
  },
  {
    url: /^https:\/\/script\.google\.com/,
    strategy: STRATEGY.NETWORK_FIRST
  }
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets during install');
        return cache.addAll(PRECACHE_URLS);
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
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Check for matching route
  const route = ROUTES.find(r => r.url.test(url.href));
  const strategy = route?.strategy || STRATEGY.NETWORK_FIRST;

  event.respondWith(
    strategy === STRATEGY.CACHE_FIRST ? cacheFirst(request) :
    strategy === STRATEGY.STALE_WHILE_REVALIDATE ? staleWhileRevalidate(request) :
    networkFirst(request)
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('Cache hit:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      console.log('Caching new resource:', request.url);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return offlineResponse(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      console.log('Updating cache:', request.url);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || offlineResponse(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      console.log('Background cache update:', request.url);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  return cachedResponse || fetchPromise || offlineResponse(request);
}

function offlineResponse(request) {
  if (request.headers.get('Accept').includes('text/html')) {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline</title>
          <style>
            body { 
              font-family: 'Roboto', sans-serif; 
              background: #f8fafc; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              padding: 1rem;
              text-align: center;
            }
            .container {
              max-width: 400px;
            }
            h1 { 
              color: #1f2937; 
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }
            p {
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Anda sedang offline</h1>
            <p>Aplikasi membutuhkan koneksi internet untuk verifikasi pengguna. Silakan periksa koneksi Anda dan coba lagi.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});