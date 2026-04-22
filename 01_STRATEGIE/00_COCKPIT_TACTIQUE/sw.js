const CACHE_NAME = 'iris-os-v91';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On ne met pas tout en cache pour éviter les erreurs de sync
      return cache.addAll(['/index.html']);
    })
  );
});

// Écouteur Fetch (Obligatoire pour l'installabilité Samsung/Android)
self.addEventListener('fetch', (event) => {
  // Stratégie : Network First (on veut toujours la donnée réelle du PC)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
