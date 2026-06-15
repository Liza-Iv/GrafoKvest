const CACHE_NAME = 'grafokwest-v' + Date.now();

self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }));
});

self.addEventListener('fetch', function(e) {
    // Пропускаем POST-запросы (API)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(function(response) {
                return caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(e.request, response.clone());
                    return response;
                });
            })
            .catch(function() {
                return caches.match(e.request);
            })
    );
});