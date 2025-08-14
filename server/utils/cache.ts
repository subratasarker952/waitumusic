interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string, queryFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < (ttl || this.defaultTTL)) {
      return cached.data as T;
    }

    const data = await queryFn();
    this.cache.set(key, { data, timestamp: now });
    
    return data;
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Clean up expired entries periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.defaultTTL) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000); // Run every minute
  }
}

export const queryCache = new QueryCache();
queryCache.startCleanup();