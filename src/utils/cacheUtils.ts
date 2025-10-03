// Utility functions for managing local storage cache

interface CacheData<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

// Cache expiration times (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 30 * 60 * 1000, // 30 minutes (increased from 5)
  MEDIUM: 2 * 60 * 60 * 1000, // 2 hours (increased from 15 min)
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  HOUR: 60 * 60 * 1000, // 1 hour
};

/**
 * Save data to localStorage with expiration
 */
export const saveToCache = <T>(
  key: string,
  data: T,
  expiresIn: number = CACHE_DURATION.MEDIUM
): void => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
};

/**
 * Get data from localStorage if not expired
 */
export const getFromCache = <T>(
  key: string,
  ignoreExpiration: boolean = false
): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData: CacheData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (!ignoreExpiration && now - cacheData.timestamp > cacheData.expiresIn) {
      // Don't remove expired cache - it can be used as fallback for 429 errors
      console.log(`Cache expired but keeping for fallback: ${key}`);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
};

/**
 * Clear specific cache entry
 */
export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

/**
 * Clear all cache entries that match a pattern
 */
export const clearCachePattern = (pattern: string): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing cache pattern:", error);
  }
};

/**
 * Clear all news-related cache
 */
export const clearAllNewsCache = (): void => {
  clearCachePattern("news-");
};

/**
 * Get cache info (for debugging)
 */
export const getCacheInfo = (): {
  totalSize: number;
  items: string[];
} => {
  try {
    let totalSize = 0;
    const items: string[] = [];

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          items.push(key);
        }
      }
    }

    return { totalSize, items };
  } catch (error) {
    console.error("Error getting cache info:", error);
    return { totalSize: 0, items: [] };
  }
};
