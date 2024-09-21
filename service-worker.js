// Check if we're in development mode
const isDevMode = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const CACHE_NAME = 'health-tracker-v2'; // Increment this version number when you make changes

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
  const CACHE_NAME = 'health-tracker-v1';

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/app.js'
        ]);
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
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});