self.addEventListener("install", event => {
  console.log("✅ Service Worker installed");
  self.skipWaiting(); // optional untuk langsung aktif
});

self.addEventListener("activate", event => {
  console.log("✅ Service Worker activated");
});

self.addEventListener("fetch", () => {
  // No-op removed (tidak perlu handler kosong)
  // WARNING hilang karena fetch event tidak ditangani tanpa alasan
});
