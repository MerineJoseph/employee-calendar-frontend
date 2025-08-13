// public/service-worker.js

console.log('SW running v9');

// Basic skip-waiting handler so updates apply immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  // Precache if you want (optional)
  console.log('Service worker installed.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of pages immediately
  console.log('Service worker activated.');
  event.waitUntil(self.clients.claim());
});

// Example fetch passthrough (customize with caching strategies if needed)
self.addEventListener('fetch', (event) => {
  // Default: network first; you can add cache logic here
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
