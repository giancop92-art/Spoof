const CACHE_NAME = 'chef-v4'; // Incrementato la versione visto che abbiamo aggiunto suoni e nuove logiche
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './spoon.png',
  './teaspoon.png',
  './mug.png',
  './glass.png',
  './flour.png',
  './oil.png',
  './sugar.png',
  './salt.png',
  './rice.png',   // Aggiunto per il database attuale
  './milk.png',   // Aggiunto per il database attuale
  './chef-hat.png' // Se la usi come icona
];

// Installazione: scarica e salva tutto nella cache
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forza l'attivazione immediata del nuovo SW
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione: pulisce le vecchie cache (fondamentale per vedere gli aggiornamenti)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: serve i file dalla cache se offline, altrimenti usa la rete
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
