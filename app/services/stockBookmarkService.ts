import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

// Keys with user ID
const getUserBookmarkKey = (type: string) => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  if (!userId) throw new Error("No user logged in");
  return `${type}_${userId}`;
};

// Stock bookmarks
export const isStockBookmarked = async (symbol: string): Promise<boolean> => {
  try {
    const key = getUserBookmarkKey("bookmarkedStocks");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return false;
    return JSON.parse(bookmarks).includes(symbol);
  } catch (error) {
    console.error("Error checking if stock is bookmarked:", error);
    return false;
  }
};

export const addStockBookmark = async (symbol: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedStocks");
    const bookmarks = await AsyncStorage.getItem(key);
    let bookmarkArray = bookmarks ? JSON.parse(bookmarks) : [];
    if (!bookmarkArray.includes(symbol)) {
      bookmarkArray.push(symbol);
      await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
    }
  } catch (error) {
    console.error("Error adding stock bookmark:", error);
  }
};

export const removeStockBookmark = async (symbol: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedStocks");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return;

    let bookmarkArray = JSON.parse(bookmarks);
    bookmarkArray = bookmarkArray.filter((s: string) => s !== symbol);
    await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
  } catch (error) {
    console.error("Error removing stock bookmark:", error);
  }
};

// Get all bookmarked stock symbols
export const getBookmarkedStockSymbols = async (): Promise<string[]> => {
  try {
    const key = getUserBookmarkKey("bookmarkedStocks");
    const bookmarks = await AsyncStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error("Error getting bookmarked stock symbols:", error);
    return [];
  }
};

// Legacy driver bookmarks (keeping for backward compatibility)
export const isDriverBookmarked = async (
  driverId: string
): Promise<boolean> => {
  try {
    const key = getUserBookmarkKey("bookmarkedDrivers");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return false;
    return JSON.parse(bookmarks).includes(driverId);
  } catch (error) {
    console.error("Error checking if driver is bookmarked:", error);
    return false;
  }
};

export const addDriverBookmark = async (driverId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedDrivers");
    const bookmarks = await AsyncStorage.getItem(key);
    let bookmarkArray = bookmarks ? JSON.parse(bookmarks) : [];
    if (!bookmarkArray.includes(driverId)) {
      bookmarkArray.push(driverId);
      await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
    }
  } catch (error) {
    console.error("Error adding driver bookmark:", error);
  }
};

export const removeDriverBookmark = async (driverId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedDrivers");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return;

    let bookmarkArray = JSON.parse(bookmarks);
    bookmarkArray = bookmarkArray.filter((id: string) => id !== driverId);
    await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
  } catch (error) {
    console.error("Error removing driver bookmark:", error);
  }
};

// Legacy circuit bookmarks (keeping for backward compatibility)
export const isCircuitBookmarked = async (
  circuitId: string
): Promise<boolean> => {
  try {
    const key = getUserBookmarkKey("bookmarkedCircuits");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return false;
    return JSON.parse(bookmarks).includes(circuitId);
  } catch (error) {
    console.error("Error checking if circuit is bookmarked:", error);
    return false;
  }
};

export const addCircuitBookmark = async (circuitId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedCircuits");
    const bookmarks = await AsyncStorage.getItem(key);
    let bookmarkArray = bookmarks ? JSON.parse(bookmarks) : [];
    if (!bookmarkArray.includes(circuitId)) {
      bookmarkArray.push(circuitId);
      await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
    }
  } catch (error) {
    console.error("Error adding circuit bookmark:", error);
  }
};

export const removeCircuitBookmark = async (
  circuitId: string
): Promise<void> => {
  try {
    const key = getUserBookmarkKey("bookmarkedCircuits");
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return;

    let bookmarkArray = JSON.parse(bookmarks);
    bookmarkArray = bookmarkArray.filter((id: string) => id !== circuitId);
    await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
  } catch (error) {
    console.error("Error removing circuit bookmark:", error);
  }
};

// Generic bookmark functions - updated to prioritize stocks
export const isBookmarked = async (id: string): Promise<boolean> => {
  // First check if it's a stock symbol (typically uppercase, short)
  if (id.match(/^[A-Z]{1,5}$/)) {
    return await isStockBookmarked(id);
  }

  // Fallback to legacy system
  const isDriver = await isDriverBookmarked(id);
  const isCircuit = await isCircuitBookmarked(id);
  return isDriver || isCircuit;
};

export const addBookmark = async (id: string): Promise<void> => {
  // If it looks like a stock symbol, add as stock
  if (id.match(/^[A-Z]{1,5}$/)) {
    await addStockBookmark(id);
  } else {
    // Fallback to legacy driver bookmark
    await addDriverBookmark(id);
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  // Try removing from all bookmark types
  await removeStockBookmark(id);
  await removeDriverBookmark(id);
  await removeCircuitBookmark(id);
};

// Legacy functions for backward compatibility
export const getBookmarkedDriverIds = async (): Promise<string[]> => {
  try {
    const key = getUserBookmarkKey("bookmarkedDrivers");
    const bookmarks = await AsyncStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error("Error getting bookmarked driver IDs:", error);
    return [];
  }
};

export const getBookmarkedCircuitIds = async (): Promise<string[]> => {
  try {
    const key = getUserBookmarkKey("bookmarkedCircuits");
    const bookmarks = await AsyncStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error("Error getting bookmarked circuit IDs:", error);
    return [];
  }
};
