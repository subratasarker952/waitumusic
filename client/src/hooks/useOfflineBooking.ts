import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OfflineBooking {
  id: string;
  data: any;
  token: string;
  timestamp: number;
}

export function useOfflineBooking() {
  const [offlineBookings, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load offline bookings from IndexedDB
    loadOfflineBookings();

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineBookings();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineBookings = async () => {
    try {
      const db = await openDB();
      const bookings = await getAllOfflineBookings(db);
      setOfflineBookings(bookings);
    } catch (error) {
      console.error('Failed to load offline bookings:', error);
    }
  };

  const saveOfflineBooking = async (bookingData: any) => {
    const booking: OfflineBooking = {
      id: Date.now().toString(),
      data: bookingData,
      token: localStorage.getItem('token') || '',
      timestamp: Date.now()
    };

    try {
      const db = await openDB();
      await db.add('offline-bookings', booking);
      setOfflineBookings(prev => [...prev, booking]);
      
      // Register background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('booking-sync');
      }
      
      return { success: true, id: booking.id };
    } catch (error) {
      console.error('Failed to save offline booking:', error);
      return { success: false, error: error.message };
    }
  };

  const syncOfflineBookings = async () => {
    if (!isOnline || offlineBookings.length === 0) return;

    const syncPromises = offlineBookings.map(async (booking) => {
      try {
        await apiRequest('/api/bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${booking.token}`
          },
          body: booking.data
        });

        // Remove from offline storage
        const db = await openDB();
        await db.delete('offline-bookings', booking.id);
        
        return booking.id;
      } catch (error) {
        console.error(`Failed to sync booking ${booking.id}:`, error);
        return null;
      }
    });

    const syncedIds = (await Promise.all(syncPromises)).filter(Boolean);
    
    if (syncedIds.length > 0) {
      setOfflineBookings(prev => prev.filter(b => !syncedIds.includes(b.id)));
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WaituMusic', {
          body: `${syncedIds.length} offline booking(s) synchronized`,
          icon: '/icon-192x192.png'
        });
      }
    }
  };

  const offlineBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (isOnline) {
        return apiRequest('/api/bookings', {
          method: 'POST',
          body: bookingData
        });
      } else {
        return saveOfflineBooking(bookingData);
      }
    },
    onSuccess: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      }
    }
  });

  return {
    isOnline,
    offlineBookings,
    saveOfflineBooking,
    syncOfflineBookings,
    offlineBookingMutation
  };
}

// IndexedDB utilities
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('waitumusic-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('offline-bookings')) {
        db.createObjectStore('offline-bookings', { keyPath: 'id' });
      }
    };
  });
}

async function getAllOfflineBookings(db: IDBDatabase): Promise<OfflineBooking[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline-bookings'], 'readonly');
    const store = transaction.objectStore('offline-bookings');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}