/* sw.js - Strategia Network-First per aggiornamenti immediati */
const CACHE_NAME = 'chef-academy-v8';
const ASSETS_TO_CACHE = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './spoon.png',
  './teaspoon.png',
  './mug.png',
  './glass.png',
  './flour.png',
  './oil.png',
  './sugar.png',
  './salt.png',
  './rice.png',
  './milk.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // STRATEGIA: Network-First per l'HTML (index.html)
  // Questo assicura che le modifiche grafiche siano caricate subito se c'è rete.
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Copia la nuova versione in cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return response;
        })
        .catch(() => caches.match(e.request)) // Se offline, usa la cache
    );
    return;
  }

  // STRATEGIA: Cache-First per le immagini (asset pesanti che non cambiano spesso)
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
