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

// Generic bookmark functions - updated to prioritize stocks
export const isBookmarked = async (id: string): Promise<boolean> => {
  // First check if it's a stock symbol (typically uppercase, short)
  if (id.match(/^[A-Z]{1,5}$/)) {
    return await isStockBookmarked(id);
  }
  return false;
};

export const addBookmark = async (id: string): Promise<void> => {
  // If it looks like a stock symbol, add as stock
  if (id.match(/^[A-Z]{1,5}$/)) {
    await addStockBookmark(id);
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  // Try removing from all bookmark types
  await removeStockBookmark(id);
};
