import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  duration: number;
}

/**
 * API Response Cache Service
 * Reduces network requests by caching API responses in AsyncStorage
 */
export const cacheService = {
  /**
   * Get cached data if valid
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`@cache_${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > entry.duration;

      if (isExpired) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set data in cache
   */
  async set<T>(
    key: string,
    data: T,
    duration: number = DEFAULT_CACHE_DURATION
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        duration,
      };
      await AsyncStorage.setItem(`@cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  },

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@cache_${key}`);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  },

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith('@cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  },

  /**
   * Get or fetch data with caching
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    duration: number = DEFAULT_CACHE_DURATION
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Cache hit: ${key}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`🌐 Cache miss, fetching: ${key}`);
    const data = await fetchFn();
    await this.set(key, data, duration);
    return data;
  },
};

// Cache duration presets
export const CacheDuration = {
  SHORT: 2 * 60 * 1000, // 2 minutes - for frequently changing data
  MEDIUM: 5 * 60 * 1000, // 5 minutes - default
  LONG: 15 * 60 * 1000, // 15 minutes - for stable data
  HOUR: 60 * 60 * 1000, // 1 hour - for rarely changing data
  DAY: 24 * 60 * 60 * 1000, // 24 hours - for static data
};

export default cacheService;

