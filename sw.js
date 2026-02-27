/* sw.js - Chef Academy / Peso Senza Bilancia (GitHub Pages friendly) */

const CACHE_VERSION = 'v2026-02-27-01';
const STATIC_CACHE = `chef-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `chef-runtime-${CACHE_VERSION}`;

/**
 * Lista asset da pre-cachare.
 * NOTA: usa path relativi "./" così funziona bene anche su GitHub Pages in sottocartella (/Spoof/).
 */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // Icone PWA
  './icon-192.png',
  './icon-512.png',

  // Immagini UI
  './spoon.png',
  './teaspoon.png',
  './mug.png',
  './glass.png',

  // Immagini ingredienti
  './flour.png',
  './oil.png',
  './sugar.png',
  './salt.png',
  './rice.png',
  './milk.png'
];

// Install: precache + attiva subito
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(PRECACHE_ASSETS);
    await self.skipWaiting();
  })());
});

// Activate: pulizia cache vecchie + prendi controllo immediato delle pagine aperte
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        const isOurCache = key.startsWith('chef-static-') || key.startsWith('chef-runtime-');
        const isCurrent = key === STATIC_CACHE || key === RUNTIME_CACHE;
        if (isOurCache && !isCurrent) return caches.delete(key);
        return Promise.resolve();
      })
    );

    await self.clients.claim();
  })());
});

// Permette alla pagina di chiedere l’update immediato (opzionale, utile)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch strategy:
// - Navigazioni HTML: Network-first (così prendi aggiornamenti quando online), fallback cache/index offline
// - Asset (png, css, js): Cache-first con runtime cache
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Gestiamo solo richieste same-origin (GitHub Pages + asset locali)
  // Le CDN (tailwind/google fonts) non le cachiamo qui per evitare complicazioni/opaque.
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get('accept') || '';
  const isHTMLNavigation =
    req.mode === 'navigate' ||
    accept.includes('text/html');

  if (isHTMLNavigation) {
    event.respondWith(networkFirstForHTML(req));
    return;
  }

  // Per asset locali: cache-first
  event.respondWith(cacheFirstForAssets(req));
});

async function networkFirstForHTML(req) {
  const runtime = await caches.open(RUNTIME_CACHE);

  try {
    // Prova rete
    const fresh = await fetch(req);

    // Salva una copia se OK
    if (fresh && fresh.ok) {
      runtime.put(req, fresh.clone());
    }

    return fresh;
  } catch (e) {
    // Offline: prova cache della richiesta
    const cached = await runtime.match(req) || await caches.match(req);
    if (cached) return cached;

    // Fallback finale: index.html (single page app-like)
    const fallback = await caches.match('./index.html');
    return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function cacheFirstForAssets(req) {
  // Prima cerca in cache (static + runtime)
  const cached = await caches.match(req);
  if (cached) return cached;

  const runtime = await caches.open(RUNTIME_CACHE);

  try {
    const fresh = await fetch(req);

    // Cache solo risposte valide
    if (fresh && (fresh.ok || fresh.type === 'opaque')) {
      runtime.put(req, fresh.clone());
    }

    return fresh;
  } catch (e) {
    // Offline e non in cache
    return new Response('', { status: 504 });
  }
}
