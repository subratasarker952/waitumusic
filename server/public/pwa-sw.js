
// PWA Service Worker for Wai'tuMusic Offline Document Access
const CACHE_NAME = 'waitumusic-documents-v1';
const BOOKING_DOCUMENTS_CACHE = 'booking-documents-v1';

// Cache technical riders, booking attachments, and communications
const urlsToCache = [
  '/',
  '/dashboard',
  '/technical-rider-designer',
  '/offline-bookings',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PWA: Caching core resources');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event?.request?.url);
  
  // Handle booking document requests
  if (url?.pathname?.includes('/api/booking-documents') || 
      url?.pathname?.includes('/api/technical-rider') ||
      url?.pathname?.includes('/api/booking-attachments')) {
    
    event.respondWith(
      caches.open(BOOKING_DOCUMENTS_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            // Serve from cache with timestamp
            const cachedData = response.clone();
            cachedData?.headers?.set('X-Cached-At', new Date().toISOString());
            return cachedData;
          }
          
          // Try to fetch from network and cache result
          return fetch(event.request).then((networkResponse) => {
            if ((networkResponse as any).status === 200) {
              const responseClone = networkResponse.clone();
              cache.put(event.request, responseClone);
            }
            return networkResponse;
          }).catch(() => {
            // Return offline fallback
            return new Response(JSON.stringify({
              success: false,
              error: 'Offline - cached data not available',
              offlineMode: true,
              cachedAt: null
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((item: any) => {
          if (cacheName !== CACHE_NAME && cacheName !== BOOKING_DOCUMENTS_CACHE) {
            console.log('PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - handle cache updates from main thread
self.addEventListener('message', (event) => {
  if (event.data && event?.data?.type === 'CACHE_BOOKING_DOCUMENT') {
    const { url, data, timestamp } = event.data;
    
    caches.open(BOOKING_DOCUMENTS_CACHE).then((cache) => {
      const response = new Response(JSON.stringify({
        ...data,
        cachedAt: timestamp,
        offlineAvailable: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Cached-At': timestamp
        }
      });
      
      cache.put(url, response);
      console.log('PWA: Cached booking document:', url);
    });
  }
  
  if (event.data && event?.data?.type === 'GET_CACHE_STATUS') {
    caches.open(BOOKING_DOCUMENTS_CACHE).then((cache) => {
      cache.keys().then((keys) => {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          cachedDocuments: keys.length,
          cacheSize: keys.map(k => k.url)
        });
      });
    });
  }
});