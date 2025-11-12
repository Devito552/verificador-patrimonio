// Service Worker para funcionar offline
const CACHE_NAME = 'patrimonio-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar e cachear recursos
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        // Adicionar URLs uma por uma para evitar erros
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn('Não foi possível cachear:', url, err);
            });
          })
        );
      })
      .catch(err => {
        console.error('Erro ao abrir cache:', err);
      })
  );
  self.skipWaiting();
});

// Servir do cache quando offline
self.addEventListener('fetch', event => {
  // Apenas cachear requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para APIs externas (CDN e Google)
  if (event.request.url.includes('unpkg.com') || 
      event.request.url.includes('jsdelivr.net') ||
      event.request.url.includes('script.google.com') ||
      event.request.url.includes('docs.google.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          }
        ).catch(err => {
          console.log('Fetch falhou:', err);
        });
      })
  );
});

// Limpar cache antigo
self.addEventListener('activate', event => {
  console.log('Service Worker ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
