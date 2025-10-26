const CACHE_NAME = "absen-sds-v2.13"; // ✅ Ganti versi saat ada update
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "home.html",
  "kasir.html",
  "print.js",
  "manifest.json",
  "logo.png",
  "install.html",
  "style.css",
  "utils.js",
  "service-worker.js",
];

// 📦 Install Service Worker dan simpan cache
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 🔁 Activate Service Worker dan hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🌐 Intercept fetch request
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Offline fallback: bisa arahkan ke halaman offline.html jika mau
          return caches.match("index.html");
        })
      );
    })
  );
});
