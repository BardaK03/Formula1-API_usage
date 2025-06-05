import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPIRATION_TIME = 1000 * 60 * 60 * 2; // 2 hours

type CachedItem = {
  data: any;
  timestamp: number;
};

export const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedItem = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > EXPIRATION_TIME;

    return isExpired ? null : parsed.data;
  } catch (err) {
    console.error('Error reading cache:', err);
    return null;
  }
};

export const setCachedData = async (key: string, data: any): Promise<void> => {
  try {
    const payload: CachedItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error('Error saving to cache:', err);
  }
};

export const clearCache = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};
