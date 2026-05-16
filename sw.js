const CACHE_NAME = 'shreyash-portfolio-v1';
const ASSETS = [
  'index.html',
  'about.html',
  'projects.html',
  'contact.html',
  'styles.css',
  'main.js',
  'manifest.json',
  'assets/images/avatar.png',
  'assets/images/hero-bg.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
