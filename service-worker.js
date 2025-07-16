// service-worker.js
self.addEventListener("install", event => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", event => {
  // Caching / offline logic here (optional)
});
