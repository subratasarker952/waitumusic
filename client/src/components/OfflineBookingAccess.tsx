import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, Download, Upload, Calendar, Music } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface OfflineBooking {
  id: string;
  artistName: string;
  eventDate: string;
  venue: string;
  status: 'draft' | 'pending_sync' | 'synced';
  createdOffline: boolean;
  lastModified: string;
}

export const OfflineBookingAccess: React.FC = () => {
  const { isOnline } = usePWA();
  const [offlineBookings, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [syncQueue, setSyncQueue] = useState<number>(0);

  useEffect(() => {
    // Load offline bookings from localStorage
    const loadOfflineBookings = () => {
      try {
        const stored = localStorage.getItem('waitumusic_offline_bookings');
        if (stored) {
          const bookings = JSON.parse(stored);
          setOfflineBookings(bookings);
          const pendingSync = bookings.filter((b: OfflineBooking) => b.status === 'pending_sync').length;
          setSyncQueue(pendingSync);
        }
      } catch (error) {
        console.error('Error loading offline bookings:', error);
      }
    };

    loadOfflineBookings();

    // Set up periodic sync attempts when online
    let syncInterval: NodeJS.Timeout;
    if (isOnline && syncQueue > 0) {
      syncInterval = setInterval(() => {
        syncOfflineBookings();
      }, 30000); // Attempt sync every 30 seconds
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [isOnline, syncQueue]);

  const syncOfflineBookings = async () => {
    if (!isOnline) return;

    try {
      const pendingBookings = offlineBookings.filter(b => b.status === 'pending_sync');
      
      for (const booking of pendingBookings) {
        try {
          // Attempt to sync booking to server
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              ...booking,
              syncedFromOffline: true,
            }),
          });

          if (response.ok) {
            // Mark as synced
            const updatedBookings = offlineBookings.map(b => 
              b.id === booking.id ? { ...b, status: 'synced' as const } : b
            );
            setOfflineBookings(updatedBookings);
            localStorage.setItem('waitumusic_offline_bookings', JSON.stringify(updatedBookings));
            setSyncQueue(prev => prev - 1);
          }
        } catch (error) {
          console.error('Error syncing booking:', booking.id, error);
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    }
  };

  const downloadOfflineData = async () => {
    try {
      // Cache critical booking data for offline use
      const criticalData = {
        artists: await fetchAndCache('/api/artists'),
        venues: await fetchAndCache('/api/venues'),
        userProfile: await fetchAndCache('/api/user/profile'),
        recentBookings: await fetchAndCache('/api/bookings?limit=20'),
      };

      localStorage.setItem('waitumusic_offline_cache', JSON.stringify({
        data: criticalData,
        timestamp: new Date().toISOString(),
      }));

      // Show success feedback
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Offline Data Downloaded',
          description: 'Critical booking data is now available offline',
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error downloading offline data:', error);
    }
  };

  const fetchAndCache = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Error fetching data for offline cache:', url, error);
      return null;
    }
  };

  const getStatusColor = (status: OfflineBooking['status']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending_sync':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <CardTitle>
                {isOnline ? 'Online' : 'Offline Mode'}
              </CardTitle>
            </div>
            {syncQueue > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Upload className="h-3 w-3" />
                <span>{syncQueue} pending sync</span>
              </Badge>
            )}
          </div>
          <CardDescription>
            {isOnline 
              ? 'Connected to WaituMusic servers. All features available.'
              : 'Working offline. Some features may be limited, but you can still create bookings.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={downloadOfflineData}
              disabled={!isOnline}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download for Offline
            </Button>
            {syncQueue > 0 && (
              <Button
                onClick={syncOfflineBookings}
                disabled={!isOnline}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Bookings */}
      {offlineBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Offline Bookings</span>
            </CardTitle>
            <CardDescription>
              Bookings created or modified while offline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offlineBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.artistName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.venue} • {new Date(booking.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getStatusColor(booking.status)}
                      variant="secondary"
                    >
                      {booking.status.replace('_', ' ')}
                    </Badge>
                    {booking.createdOffline && (
                      <Badge variant="outline" className="text-xs">
                        Created Offline
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Capabilities</CardTitle>
          <CardDescription>
            What you can do while offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600 dark:text-green-400">Available Offline:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Create new bookings</li>
                <li>• View cached artist profiles</li>
                <li>• Access recent booking history</li>
                <li>• Edit draft bookings</li>
                <li>• Browse cached venue information</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Requires Internet:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Submit booking requests</li>
                <li>• Real-time availability checks</li>
                <li>• Payment processing</li>
                <li>• Live chat support</li>
                <li>• Social media integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};