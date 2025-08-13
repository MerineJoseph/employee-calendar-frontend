// SW VERSION v10
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install: activate immediately
self.addEventListener('install', (event) => {
  console.log('Service worker installed.');
  self.skipWaiting();
});

// Activate: claim all pages and clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k))); // nuke old caches
    await self.clients.claim();
  })());
});

// Network‑first for everything; fall back only if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});