// service-worker.js

self.addEventListener('install', event => {
  console.log('✅ Service Worker berhasil diinstal');
  event.waitUntil(
    caches.open('absen-cache-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './home.html',
        './form.html',
        './logo.png',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
