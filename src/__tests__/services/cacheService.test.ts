import { cacheService, CacheDuration } from '../../services/cacheService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is already mocked in jest.setup.js

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set and get', () => {
    it('should store data in AsyncStorage', async () => {
      const key = 'test-key';
      const data = { name: 'Test', value: 123 };

      await cacheService.set(key, data);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@cache_test-key',
        expect.any(String)
      );
    });

    it('should retrieve data from AsyncStorage', async () => {
      const key = 'test-key';
      const data = { name: 'Test', value: 123 };
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        duration: CacheDuration.MEDIUM,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cacheEntry));

      const result = await cacheService.get(key);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@cache_test-key');
      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await cacheService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null for expired cache', async () => {
      const data = { name: 'Test' };
      const expiredEntry = {
        data,
        timestamp: Date.now() - 10000, // 10 seconds ago
        duration: 5000, // 5 seconds duration - already expired
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(expiredEntry));

      const result = await cacheService.get('expired-key');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove specific key from AsyncStorage', async () => {
      await cacheService.remove('remove-test');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@cache_remove-test');
    });
  });

  describe('clearAll', () => {
    it('should clear all cache keys', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
        '@cache_key1',
        '@cache_key2',
        '@other_key', // Should not be removed
      ]);

      await cacheService.clearAll();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@cache_key1',
        '@cache_key2',
      ]);
    });
  });

  describe('getOrFetch', () => {
    it('should return cached data if available', async () => {
      const data = { value: 'cached' };
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        duration: CacheDuration.MEDIUM,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cacheEntry));

      const fetchFn = jest.fn().mockResolvedValue({ value: 'fresh' });

      const result = await cacheService.getOrFetch('key', fetchFn);

      expect(result).toEqual(data);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not cached', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const fetchedData = { value: 'fresh' };
      const fetchFn = jest.fn().mockResolvedValue(fetchedData);

      const result = await cacheService.getOrFetch('key', fetchFn);

      expect(result).toEqual(fetchedData);
      expect(fetchFn).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('CacheDuration', () => {
    it('should have correct duration values', () => {
      expect(CacheDuration.SHORT).toBe(2 * 60 * 1000);
      expect(CacheDuration.MEDIUM).toBe(5 * 60 * 1000);
      expect(CacheDuration.LONG).toBe(15 * 60 * 1000);
      expect(CacheDuration.HOUR).toBe(60 * 60 * 1000);
      expect(CacheDuration.DAY).toBe(24 * 60 * 60 * 1000);
    });
  });
});
