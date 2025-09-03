import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache duration - 24 hours for stock data (since we have limited API calls)
const EXPIRATION_TIME =
  1000 * 60 * 60 * parseInt(process.env.CACHE_DURATION_HOURS || "24");

// Cache version for data migration
const CACHE_VERSION = "1.0";
const VERSION_KEY = "@cache_version";

type CachedItem = {
  data: any;
  timestamp: number;
  version: string;
};

// Initialize cache version
const initializeCacheVersion = async (): Promise<void> => {
  try {
    const currentVersion = await AsyncStorage.getItem(VERSION_KEY);
    if (currentVersion !== CACHE_VERSION) {
      // Clear old cache if version changed
      await clearAllCache();
      await AsyncStorage.setItem(VERSION_KEY, CACHE_VERSION);
      console.log("Cache cleared due to version change");
    }
  } catch (error) {
    console.error("Error initializing cache version:", error);
  }
};

// Initialize cache on module load
initializeCacheVersion();

export const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedItem = JSON.parse(cached);

    // Check version compatibility
    if (parsed.version !== CACHE_VERSION) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    const isExpired = Date.now() - parsed.timestamp > EXPIRATION_TIME;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error("Error reading cache:", err);
    return null;
  }
};

export const setCachedData = async (key: string, data: any): Promise<void> => {
  try {
    const payload: CachedItem = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error("Error saving to cache:", err);
  }
};

export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
};

// Clear all cached data
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      (key) =>
        !key.startsWith("@auth") &&
        !key.startsWith("@settings") &&
        !key.startsWith("@bookmarks")
    );
    await AsyncStorage.multiRemove(cacheKeys);
    console.log("All cache cleared");
  } catch (err) {
    console.error("Error clearing all cache:", err);
  }
};

// Get cache statistics
export const getCacheStats = async (): Promise<{
  totalItems: number;
  expiredItems: number;
  totalSize: number;
}> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      (key) =>
        !key.startsWith("@") ||
        key.includes("stock") ||
        key.includes("popular") ||
        key.includes("search")
    );

    let totalItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const key of cacheKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        totalItems++;
        totalSize += cached.length;

        try {
          const parsed: CachedItem = JSON.parse(cached);
          const isExpired = Date.now() - parsed.timestamp > EXPIRATION_TIME;
          if (isExpired) expiredItems++;
        } catch {
          expiredItems++;
        }
      }
    }

    return { totalItems, expiredItems, totalSize };
  } catch (err) {
    console.error("Error getting cache stats:", err);
    return { totalItems: 0, expiredItems: 0, totalSize: 0 };
  }
};

// Check if data is fresh (less than 1 hour old)
export const isFreshData = async (key: string): Promise<boolean> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return false;

    const parsed: CachedItem = JSON.parse(cached);
    const hoursSinceCache = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    return hoursSinceCache < 1;
  } catch {
    return false;
  }
};
