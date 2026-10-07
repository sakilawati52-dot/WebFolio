// WebFolio — service worker sederhana: cache offline dasar + dukungan "Pasang aplikasi".
// Tidak menyimpan/menyadap data pengguna apa pun.
const CACHE = 'webfolio-v1';
const ALLOWED_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'api.qrserver.com', 'challenges.cloudflare.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // jangan cache permintaan Firestore/Auth (POST)

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const allowedExternal = ALLOWED_HOSTS.includes(url.hostname);
  if (!sameOrigin && !allowedExternal) return; // biarkan Firestore/Auth lewat apa adanya, tanpa cache

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || (sameOrigin ? caches.match('./index.html') : undefined)))
  );
});
