var CACHE_NAME = 'sh37c-v1';
var BASE = 'https://pub-4702f6b2fa2043cba545ed8b55e7f952.r2.dev/';
var TOTAL = 12;

/* 캐시할 영상 URL 목록 */
var VIDEO_URLS = [];
for (var i = 1; i <= TOTAL; i++) {
    VIDEO_URLS.push(BASE + (i < 10 ? '0' + i : '' + i) + '.webm');
}

/* install: 모든 영상을 미리 다운로드 */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[SW] Caching all videos...');
            return cache.addAll(VIDEO_URLS);
        }).then(function() {
            console.log('[SW] All videos cached');
            return self.skipWaiting();
        })
    );
});

/* activate: 이전 버전 캐시 삭제 */
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(name) { return name !== CACHE_NAME; })
                     .map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

/* fetch: 캐시 우선, 없으면 네트워크 → 캐시에 저장 */
self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) {
                console.log('[SW] Cache hit:', e.request.url);
                return cached;
            }
            return fetch(e.request).then(function(response) {
                /* 성공한 응답만 캐시 */
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            });
        })
    );
});

