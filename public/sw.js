/**
 * Auth247 Service Worker
 * Provides offline authentication state management and caching
 */

const CACHE_NAME = 'auth247-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/signup',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle offline authentication
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful auth responses
          if (request.url.includes('/api/auth/session') && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached auth data when offline
          if (request.url.includes('/api/auth/session')) {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving cached auth session');
                return cachedResponse;
              }
              // Return offline indicator
              return new Response(
                JSON.stringify({ error: 'offline', cached: false }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          }
          
          // Fallback for other API calls
          return new Response(
            JSON.stringify({ error: 'Network unavailable' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle static asset requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
      .catch(() => {
        // Fallback to cached main page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Handle background sync for auth state
self.addEventListener('sync', (event) => {
  if (event.tag === 'auth-sync') {
    event.waitUntil(
      // Sync authentication state when connection restored
      fetch('/api/auth/session')
        .then((response) => {
          if (response.ok) {
            console.log('[SW] Auth state synced');
            // Notify clients of auth state update
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'AUTH_SYNCED',
                  timestamp: Date.now()
                });
              });
            });
          }
        })
        .catch((error) => {
          console.log('[SW] Auth sync failed:', error);
        })
    );
  }
});

// Handle push notifications for auth events
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'auth_event') {
      event.waitUntil(
        self.registration.showNotification('Auth247', {
          body: data.message,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'auth-notification'
        })
      );
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window or open new one
      if (clients.length > 0) {
        return clients[0].focus();
      } else {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});