/* sw.js - Chef Academy / Peso Senza Bilancia */
const CACHE_NAME = 'chef-academy-v5'; 
const ASSETS = [
  './',
  './index.html',
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
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
