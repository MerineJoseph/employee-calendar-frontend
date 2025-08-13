// src/serviceWorkerRegistration.ts
type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  /^127(?:\.(?:\d{1,3})){3}$/.test(window.location.hostname)
);

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      if (isLocalhost) {
        // On localhost, validate the SW file to avoid HTML/MIME issues
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Service worker ready (localhost).');
        });
      } else {
        // In production, just register and handle updates
        registerValidSW(swUrl, config);
      }

      // Auto reload when a new SW becomes controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // If there is already a waiting worker at registration time, it means an update is ready
      if (registration.waiting) {
        // Ask it to activate immediately
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        config?.onUpdate?.(registration);
      }

      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.onstatechange = () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log('New content is available.');
              // Tell the new SW to activate now
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
              config?.onUpdate?.(registration);
            } else {
              // First install
              console.log('Content is cached for offline use.');
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Make sure we’re getting a JS SW, not an HTML fallback.
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 || !contentType.includes('javascript')) {
        // No valid SW found. Unregister and reload.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}
