const CACHE_NAME = "absen-sds-v2.24";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./home.html",
  "./kasir.html",
  "./print-epson-final.js",
  "./manifest.json",
  "./logo.png",
  "./install.html",
  "./style.css",
  "./utils.js",
  "./offline.html",
];

// === INSTALL ===
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell...");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => console.warn("[SW] Cache failed:", err))
  );
  self.skipWaiting();
});

// === ACTIVATE ===
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// === FETCH (Stale-While-Revalidate) ===
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 🛑 Abaikan URL printer atau base64 supaya tidak diblokir
  if (
    url.startsWith("intent:") ||
    url.includes("rawbt") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    console.log("[SW] Bypass special URL:", url);
    return;
  }

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => response || caches.match("./offline.html"));
        return response || fetchPromise;
      });
    })
  );
});

// === AUTO UPDATE NOTIFIER ===
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting - activating new version...");
    self.skipWaiting();
  }
});
