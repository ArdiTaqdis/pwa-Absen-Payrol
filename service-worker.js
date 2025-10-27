const CACHE_NAME = "sds-snack-v3.5";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./home.html",
  "./form.html",
  "./gaji.html",
  "./rekap.html",
  "./kasir.html",
  "./slip-admin.html",
  "./style.css",
  "./print-epson-final.js",
  "./manifest.json",
  "./logo-192.png",
  "./logo-512.png",
  "./offline.html",
];

// 🔹 Saat install — cache semua file
self.addEventListener("install", (event) => {
  console.log("[SW] Installing SDS Snack PWA...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 🔹 Saat activate — hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating SDS Snack PWA...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Hapus cache lama:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 Fetch handler — mode hybrid
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // ⚠️ Abaikan permintaan non-GET & URL khusus
  if (
    request.method !== "GET" ||
    url.startsWith("intent:") ||
    url.includes("rawbt") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return;
  }

  // 📦 Mode cache-first untuk halaman dan asset lokal
  if (FILES_TO_CACHE.some((path) => url.endsWith(path.replace("./", "")))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request)
          .then((netRes) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, netRes.clone());
            });
            return netRes;
          })
          .catch(() => caches.match("./offline.html"));
      })
    );
  } else {
    // 🌐 Stale-while-revalidate untuk API/script luar
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((response) => {
          const fetchPromise = fetch(request)
            .then((netRes) => {
              if (netRes && netRes.status === 200) {
                cache.put(request, netRes.clone());
              }
              return netRes;
            })
            .catch(() => response || caches.match("./offline.html"));
          return response || fetchPromise;
        })
      )
    );
  }
});

// 🔹 Notifikasi update service worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting (update aktif)...");
    self.skipWaiting();
  }
});
