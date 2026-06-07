// Minimal dependency-free service worker for offline app-shell support.
// Same-origin assets/navigations are cached; cross-origin requests (the GitHub
// API) are left untouched — TanStack Query's persisted cache covers data offline.
const CACHE = 'stardust-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so deploys are picked up. The successful shell
  // is cached under a single key (the scope) so any offline route — even ones
  // never visited online — falls back to it. Error responses are not cached.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(self.registration.scope, copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline: fall back to the cached shell. If nothing is cached yet,
          // throw so the browser shows its standard offline page instead of
          // crashing on an undefined respondWith.
          const cached = await caches.match(self.registration.scope);
          if (cached) return cached;
          throw new Error('offline and no cached shell');
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate. Serve the cached copy immediately
  // (revalidating in the background) or wait on the network — never resolve
  // respondWith with undefined.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      if (cached) {
        network.catch(() => {}); // don't let a failed revalidation reject
        return cached;
      }
      return network;
    })
  );
});
