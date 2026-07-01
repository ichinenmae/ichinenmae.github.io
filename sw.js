const CACHE_NAME = "smdelivery-pwa-v2";

const APP_SHELL = [
  "/manifest.webmanifest",
  "/sumureco/preview.html",
  "/sumureco/index.html",
  "/sumureco/smrc-icon.png",
  "/sumureco/smrc-icon-512.png",
  "/sumureco/sumumeter.png",
  "/sumucopy/index.html",
  "/sumucopy/templates.json",
  "/sumucopy/title-image.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (
          !response
          || response.status !== 200
          || response.type !== "basic"
        ) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
