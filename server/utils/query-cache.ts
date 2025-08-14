import NodeCache from 'node-cache';

// Cache configuration
interface CacheConfig {
  stdTTL: number; // Default TTL in seconds
  checkperiod: number; // Check period for expired keys
  maxKeys: number; // Maximum number of keys
}

// Default cache configurations for different data types
const cacheConfigs: Record<string, CacheConfig> = {
  // Frequently accessed, rarely changing data
  roles: { stdTTL: 3600, checkperiod: 600, maxKeys: 20 }, // 1 hour
  permissions: { stdTTL: 3600, checkperiod: 600, maxKeys: 100 }, // 1 hour
  genres: { stdTTL: 3600, checkperiod: 600, maxKeys: 50 }, // 1 hour
  instruments: { stdTTL: 3600, checkperiod: 600, maxKeys: 200 }, // 1 hour
  
  // User-specific data
  userProfile: { stdTTL: 300, checkperiod: 60, maxKeys: 1000 }, // 5 minutes
  userPermissions: { stdTTL: 600, checkperiod: 120, maxKeys: 500 }, // 10 minutes
  
  // Content data
  songs: { stdTTL: 300, checkperiod: 60, maxKeys: 2000 }, // 5 minutes
  albums: { stdTTL: 300, checkperiod: 60, maxKeys: 500 }, // 5 minutes
  artists: { stdTTL: 300, checkperiod: 60, maxKeys: 1000 }, // 5 minutes
  
  // Dynamic data
  bookings: { stdTTL: 60, checkperiod: 30, maxKeys: 500 }, // 1 minute
  opportunities: { stdTTL: 120, checkperiod: 60, maxKeys: 300 }, // 2 minutes
  
  // Default for unspecified types
  default: { stdTTL: 300, checkperiod: 60, maxKeys: 1000 } // 5 minutes
};

// Create cache instances
const caches: Record<string, NodeCache> = {};

// Get or create cache for specific data type
function getCache(dataType: string): NodeCache {
  if (!caches[dataType]) {
    const config = cacheConfigs[dataType] || cacheConfigs.default;
    caches[dataType] = new NodeCache({
      stdTTL: config.stdTTL,
      checkperiod: config.checkperiod,
      maxKeys: config.maxKeys,
      useClones: false // For better performance
    });
  }
  return caches[dataType];
}

// Cache key generator
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

// Main caching wrapper
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Extract data type from key prefix
  const dataType = key.split(':')[0];
  const cache = getCache(dataType);
  
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch fresh data
  try {
    const data = await fetchFn();
    
    // Store in cache
    if (ttl) {
      cache.set(key, data, ttl);
    } else {
      cache.set(key, data); // Use default TTL
    }
    
    return data;
  } catch (error) {
    // If fetch fails, try to return stale cache if available
    const stale = cache.get<T>(key, true); // Get even if expired
    if (stale !== undefined) {
      console.warn(`Returning stale cache for ${key} due to fetch error:`, error);
      return stale;
    }
    throw error;
  }
}

// Invalidate cache entries
export function invalidateCache(pattern: string | string[]): void {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  
  patterns.forEach(pat => {
    // If pattern is exact cache type, clear entire cache
    if (caches[pat]) {
      caches[pat].flushAll();
      return;
    }
    
    // Otherwise, invalidate matching keys across all caches
    Object.values(caches).forEach(cache => {
      const keys = cache.keys();
      const toDelete = keys.filter(key => {
        if (pat.includes('*')) {
          // Support wildcard patterns
          const regex = new RegExp(pat.replace(/\*/g, '.*'));
          return regex.test(key);
        }
        return key.startsWith(pat);
      });
      
      toDelete.forEach(key => cache.del(key));
    });
  });
}

// Cache statistics
export function getCacheStats(): Record<string, any> {
  const stats: Record<string, any> = {};
  
  Object.entries(caches).forEach(([name, cache]) => {
    stats[name] = {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
    };
  });
  
  return stats;
}

// Clear all caches
export function clearAllCaches(): void {
  Object.values(caches).forEach(cache => cache.flushAll());
}

// Middleware to add cache helpers to request
export function cacheMiddleware(req: any, res: any, next: any): void {
  req.cache = {
    get: (key: string) => {
      const dataType = key.split(':')[0];
      return getCache(dataType).get(key);
    },
    set: (key: string, value: any, ttl?: number) => {
      const dataType = key.split(':')[0];
      return getCache(dataType).set(key, value, ttl);
    },
    invalidate: invalidateCache,
    withCache
  };
  
  next();
}

// Common cache operations for routes
export const cacheHelpers = {
  // User-related caching
  async getUserWithCache(userId: number, fetchFn: () => Promise<any>): Promise<any> {
    return withCache(
      generateCacheKey('userProfile', userId),
      fetchFn
    );
  },
  
  // Song-related caching
  async getSongsWithCache(artistId?: number, fetchFn?: () => Promise<any>): Promise<any> {
    const key = artistId 
      ? generateCacheKey('songs', 'artist', artistId)
      : generateCacheKey('songs', 'all');
    return withCache(key, fetchFn!);
  },
  
  // Album-related caching
  async getAlbumsWithCache(artistId?: number, fetchFn?: () => Promise<any>): Promise<any> {
    const key = artistId
      ? generateCacheKey('albums', 'artist', artistId)
      : generateCacheKey('albums', 'all');
    return withCache(key, fetchFn!);
  },
  
  // Booking-related caching
  async getBookingsWithCache(userId?: number, fetchFn?: () => Promise<any>): Promise<any> {
    const key = userId
      ? generateCacheKey('bookings', 'user', userId)
      : generateCacheKey('bookings', 'all');
    return withCache(key, fetchFn!);
  },
  
  // Invalidation helpers
  invalidateUserCache(userId: number): void {
    invalidateCache([
      generateCacheKey('userProfile', userId),
      generateCacheKey('userPermissions', userId),
      generateCacheKey('songs', 'artist', userId),
      generateCacheKey('albums', 'artist', userId),
      generateCacheKey('bookings', 'user', userId)
    ]);
  },
  
  invalidateSongCache(artistId?: number): void {
    if (artistId) {
      invalidateCache(generateCacheKey('songs', 'artist', artistId));
    }
    invalidateCache(generateCacheKey('songs', 'all'));
  },
  
  invalidateBookingCache(bookingId?: number, userId?: number): void {
    const patterns = ['bookings:all'];
    if (bookingId) patterns.push(generateCacheKey('bookings', bookingId));
    if (userId) patterns.push(generateCacheKey('bookings', 'user', userId));
    invalidateCache(patterns);
  }
};

// Export individual functions for direct use
export { getCache, clearAllCaches as flushAllCaches };