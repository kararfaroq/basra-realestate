const CACHE_NAME = 'basra-aqar-v1';
const assets = [
  '/',
  '/index.html' // أضف هنا روابط ملفات الـ CSS أو الصور الأساسية إن أردت
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// تفعيل استجابة المتصفح من الكاش عند انقطاع الشبكة
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});