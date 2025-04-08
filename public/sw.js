// Nome do cache
const CACHE_NAME = 'zenlife-v2';
const STATIC_CACHE = 'zenlife-static-v2';
const DYNAMIC_CACHE = 'zenlife-dynamic-v2';

// Arquivos para cache inicial (recursos essenciais)
const staticUrlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/index.css', // O CSS principal
  '/assets/index.js'   // O JavaScript principal
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Cache estático aberto');
        return cache.addAll(staticUrlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting(); // Ativa imediatamente sem esperar a página recarregar
      })
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  // Lista de caches que queremos manter
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Agora ativo');
        return self.clients.claim(); // Assume o controle de todos os clientes sem recarregar
      })
  );
});

// Interceptação de requisições - estratégia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições a outras origens
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia para recursos de navegação (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Fallback para página offline');
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Estratégia para outros recursos - Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Tentativa de atualizar o cache com nova versão
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Armazenar a nova resposta no cache dinâmico
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('[Service Worker] Atualizado no cache:', event.request.url);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Erro ao buscar recurso:', error);
            // Se for um recurso de navegação e não houver conexão, mostrar a página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return null;
          });

        // Responder com o cache enquanto atualiza
        return cachedResponse || fetchPromise;
      })
  );
});

// Sincronização em segundo plano (quando conexão é restabelecida)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Evento de sincronização', event.tag);
  if (event.tag === 'sync-data') {
    // Lógica para sincronizar dados pendentes quando a conexão retorna
    // Aqui você pode implementar a lógica para sincronizar alterações feitas offline
    console.log('[Service Worker] Sincronizando dados pendentes');
  }
});

// Lidar com notificações push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificação push recebida');
  
  const title = 'ZenLife';
  const options = {
    body: event.data ? event.data.text() : 'Atualização no ZenLife',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Evento quando o usuário clica em uma notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 