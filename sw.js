/* ==========================================================================
   Service worker · hace del portafolio una app instalable (PWA) que
   funciona sin conexión.

   Estrategias:
   - Páginas (/, /en/): primero la red (siempre lo último publicado) y, si
     no hay conexión, la copia guardada.
   - CSS, JS e imágenes: primero la caché (llevan ?v=… o casi nunca cambian)
     y, si no está, la red.
   - Solo actúa sobre los archivos del portafolio: /serenagpt/ y el resto de
     carpetas del servidor no se tocan.

   __VERSION__ y [
  "/",
  "/en/",
  "/manifest.webmanifest",
  "/avatar/assets/serena-color.webp",
  "/avatar/assets/serena-depth.png",
  "/avatar/assets/serena-saludo.webp",
  "/avatar/assets/serena-saludo-depth.png",
  "/assets/foto-serena.jpg",
  "/assets/favicon-32.png",
  "/assets/icon-192.png",
  "/avatar/avatar.css?v=c316adc4",
  "/js/i18n.js?v=b23dbe89",
  "/avatar/js/mini-gl.js?v=bfb05e18",
  "/avatar/js/device-profile.js?v=722cfdcc",
  "/avatar/js/avatar-model.js?v=1f230a2f",
  "/avatar/js/avatar-animator.js?v=16e75451",
  "/avatar/js/avatar-input.js?v=8b7e0cf5",
  "/avatar/js/avatar-behaviors.js?v=73a07fb9",
  "/avatar/js/avatar-engine.js?v=9597de7d"
] los rellena scripts/build.py en cada
   publicación; al cambiar la versión, la app descarga lo nuevo y borra
   la caché vieja.
   ========================================================================== */
'use strict';

var VERSION = '05df8be256';
var CACHE = 'serena-' + VERSION;
var PRECACHE = [
  "/",
  "/en/",
  "/manifest.webmanifest",
  "/avatar/assets/serena-color.webp",
  "/avatar/assets/serena-depth.png",
  "/avatar/assets/serena-saludo.webp",
  "/avatar/assets/serena-saludo-depth.png",
  "/assets/foto-serena.jpg",
  "/assets/favicon-32.png",
  "/assets/icon-192.png",
  "/avatar/avatar.css?v=c316adc4",
  "/js/i18n.js?v=b23dbe89",
  "/avatar/js/mini-gl.js?v=bfb05e18",
  "/avatar/js/device-profile.js?v=722cfdcc",
  "/avatar/js/avatar-model.js?v=1f230a2f",
  "/avatar/js/avatar-animator.js?v=16e75451",
  "/avatar/js/avatar-input.js?v=8b7e0cf5",
  "/avatar/js/avatar-behaviors.js?v=73a07fb9",
  "/avatar/js/avatar-engine.js?v=9597de7d"
];

var OURS = /^\/(?:$|index\.html$|en\/(?:index\.html)?$|avatar\/|assets\/|js\/|manifest\.webmanifest$)/;
var FONTS = /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('serena-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var same = url.origin === self.location.origin;

  if (same && !OURS.test(url.pathname)) return;     // otras webs del servidor: sin tocar
  if (!same && !FONTS.test(req.url)) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

function networkFirst(req) {
  return fetch(req).then(function (res) {
    var copy = res.clone();
    if (res.ok) caches.open(CACHE).then(function (c) { c.put(req, copy); });
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      var home = new URL(req.url).pathname.indexOf('/en/') === 0 ? '/en/' : '/';
      return caches.match(home);
    });
  });
}

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res.ok || res.type === 'opaque') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}
