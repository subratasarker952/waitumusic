import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Icons
import { 
  Download, Bell, Wifi, WifiOff, Smartphone, 
  CheckCircle, AlertCircle, Settings, Home
} from 'lucide-react';

interface PWAFeaturesProps {
  className?: string;
}

export default function PWAFeatures({ className = '' }: PWAFeaturesProps) {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = 'standalone' in window.navigator && (window.navigator as any).standalone;
      setIsInstalled(isStandalone || isInApp);
    };

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your connection has been restored."
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're now in offline mode. Some features may be limited.",
        variant: "destructive"
      });
    };

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Handle successful app install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed!",
        description: "WaituMusic has been installed to your device."
      });
    };

    // Check notification permissions
    const checkNotifications = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial checks
    checkInstalled();
    checkNotifications();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "WaituMusic is being installed to your device."
        });
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          
          // Register for push notifications
          if ('serviceWorker' in navigator) {
            try {
              const registration = await navigator.serviceWorker.getRegistration();
              if (registration) {
                // Subscribe to push notifications
                const subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(
                    import.meta.env.VITE_VAPID_PUBLIC_KEY || 'mock-key'
                  )
                });
                
                // Send subscription to server
                await fetch('/api/push/subscribe', {
                  method: 'POST',
                  body: JSON.stringify(subscription),
                  headers: { 'Content-Type': 'application/json' }
                });
                
                toast({
                  title: "Notifications Enabled",
                  description: "You'll receive push notifications for important updates."
                });
              }
            } catch (error) {
              console.error('Failed to subscribe to push notifications:', error);
            }
          }
        } else {
          setNotificationsEnabled(false);
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive"
          });
        }
      }
    } else {
      setNotificationsEnabled(false);
      
      // Unsubscribe from push notifications
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
              await fetch('/api/push/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        } catch (error) {
          console.error('Failed to unsubscribe from push notifications:', error);
        }
      }
      
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore."
      });
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('WaituMusic Test', {
        body: 'This is a test notification from WaituMusic!',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png'
      });
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        toast({
          title: "Cache Cleared",
          description: "App cache has been cleared. Refresh to reload content."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear cache.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Progressive Web App Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Online - All features available' : 'Offline - Limited functionality'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* App Installation */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isInstalled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Download className="w-5 h-5 text-blue-600" />
              )}
              <div>
                <p className="font-medium">App Installation</p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled 
                    ? 'WaituMusic is installed on your device'
                    : 'Install WaituMusic for a native app experience'
                  }
                </p>
              </div>
            </div>
            {isInstalled ? (
              <Badge variant="default">Installed</Badge>
            ) : isInstallable ? (
              <Button onClick={handleInstallApp} size="sm">
                <Download className="w-4 h-4 mr-1" />
                Install App
              </Button>
            ) : (
              <Badge variant="outline">Not Available</Badge>
            )}
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about bookings, releases, and updates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
              {notificationsEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testNotification}
                >
                  Test
                </Button>
              )}
            </div>
          </div>

          {/* Offline Features */}
          <div className="space-y-4">
            <h3 className="font-medium">Offline Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Booking Forms</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create and save booking forms while offline
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Music Catalog</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Browse previously loaded music content
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Profile Management</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Update profile information and sync when online
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-sm">Real-time Features</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Limited when offline - requires internet connection
                </p>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Cache Management</p>
                <p className="text-sm text-muted-foreground">
                  Clear stored data to free up space
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearCache}>
              Clear Cache
            </Button>
          </div>

          {/* Add to Home Screen Hint */}
          {!isInstalled && !isInstallable && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Add to Home Screen
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    For the best experience, add WaituMusic to your home screen:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                    <li>• iOS: Tap Share → Add to Home Screen</li>
                    <li>• Android: Tap Menu → Add to Home Screen</li>
                    <li>• Desktop: Look for install prompt in address bar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}