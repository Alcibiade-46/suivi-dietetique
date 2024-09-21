// Check if we're in development mode
const isDevMode = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const CACHE_NAME = 'health-tracker-v3'; // Increment this version number when you make changes

const CACHE_URLS = [
  '/suivi-dietetique/',
  '/suivi-dietetique/index.html',
  '/suivi-dietetique/style.css',
  '/suivi-dietetique/app.js',
  '/suivi-dietetique/manifest.json',
  '/suivi-dietetique/icon-192x192.png',
  '/suivi-dietetique/icon-512x512.png'
];

if (isDevMode) {
  // Disable caching in development mode
  self.addEventListener('install', (event) => {
    console.log('Service Worker installed (Development Mode)');
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
} else {
  // Production mode: Use caching
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
}

// Force the waiting service worker to become the active service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});