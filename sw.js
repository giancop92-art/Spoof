const CACHE_NAME = 'chef-academy-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
 './spoon.png',     // Aggiunto
  './teaspoon.png' // Aggiunto
];

// Installazione: salva i file nella memoria del telefono
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Gestione richieste: se non c'è internet, usa la cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
