const CACHE_NAME = 'edpc-dough-v1';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Do not interfere with Google Apps Script.
  if (
    requestUrl.hostname === 'script.google.com' ||
    requestUrl.hostname.endsWith('.googleusercontent.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, copy);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );

});
