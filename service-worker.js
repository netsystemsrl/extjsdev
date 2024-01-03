var cacheName = 'pwa-geqo';
 var filesToCache = [
 ]; 
 /* Avvia il Service Worker e Memorizza il contenuto nella cache */
 self.addEventListener('install', function(e) {
	 e.waitUntil(
		 caches.open(cacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		 })
	 );
 });  
/* Serve i Contenuti Memorizzati quando sei Offline */
 self.addEventListener('fetch', function(e) {
	 e.respondWith(
		 caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		 })
	 );
 });