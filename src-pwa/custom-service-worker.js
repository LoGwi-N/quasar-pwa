/* eslint-env serviceworker */

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import {StaleWhileRevalidate} from "workbox-strategies";

self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }
    ),
    new StaleWhileRevalidate()
  )
}

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log(data)
  console.log(event)
  event.waitUntil(
    self.registration.showNotification(data.title, data)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('notificationclick', event);
  console.log('notificationclick json', event?.data?.json());
});
