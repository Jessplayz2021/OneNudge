// OneNudge service worker: makes the app installable and usable offline.
// Network-first, so online visitors always get the latest version; the cache is only a fallback.
// Bump CACHE_NAME when the list of files below changes.

const CACHE_NAME = "onenudge-v8";
const APP_SHELL = [
  "./",
  "index.html",
  "guide.html",
  "support.html",
  "style.css",
  "common.js",
  "script.js",
  "manifest.webmanifest",
  "favicon.svg",
  "favicon-32.png",
  "icon-192.png",
  "icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("index.html");
        return Response.error();
      }),
  );
});
