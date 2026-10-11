// Memorează paginile deschise, ca aplicația să pornească și fără internet. Datele Cărții sunt în IndexedDB, nu aici.
const CACHE = "ritualul-de-azi-v2";
const SHELL = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === "basic") { const clone = response.clone(); caches.open(CACHE).then(cache => cache.put(request, clone)); }
    return response;
  }).catch(() => caches.match(request).then(hit => hit || (request.mode === "navigate" ? caches.match("/offline") : Response.error()))));
});
