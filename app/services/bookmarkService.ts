import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

// Keys with user ID
const getUserBookmarkKey = (type: string) => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  if (!userId) throw new Error('No user logged in');
  return `${type}_${userId}`;
};

// Driver bookmarks
export const isDriverBookmarked = async (driverId: string): Promise<boolean> => {
  try {
    const key = getUserBookmarkKey('bookmarkedDrivers');
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return false;
    return JSON.parse(bookmarks).includes(driverId);
  } catch (error) {
    console.error('Error checking if driver is bookmarked:', error);
    return false;
  }
};

export const addDriverBookmark = async (driverId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey('bookmarkedDrivers');
    const bookmarks = await AsyncStorage.getItem(key);
    let bookmarkArray = bookmarks ? JSON.parse(bookmarks) : [];
    if (!bookmarkArray.includes(driverId)) {
      bookmarkArray.push(driverId);
      await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
    }
  } catch (error) {
    console.error('Error adding driver bookmark:', error);
  }
};

export const removeDriverBookmark = async (driverId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey('bookmarkedDrivers');
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return;
    
    let bookmarkArray = JSON.parse(bookmarks);
    bookmarkArray = bookmarkArray.filter((id: string) => id !== driverId);
    await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
  } catch (error) {
    console.error('Error removing driver bookmark:', error);
  }
};

// Circuit bookmarks
export const isCircuitBookmarked = async (circuitId: string): Promise<boolean> => {
  try {
    const key = getUserBookmarkKey('bookmarkedCircuits');
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return false;
    return JSON.parse(bookmarks).includes(circuitId);
  } catch (error) {
    console.error('Error checking if circuit is bookmarked:', error);
    return false;
  }
};

export const addCircuitBookmark = async (circuitId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey('bookmarkedCircuits');
    const bookmarks = await AsyncStorage.getItem(key);
    let bookmarkArray = bookmarks ? JSON.parse(bookmarks) : [];
    if (!bookmarkArray.includes(circuitId)) {
      bookmarkArray.push(circuitId);
      await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
    }
  } catch (error) {
    console.error('Error adding circuit bookmark:', error);
  }
};

export const removeCircuitBookmark = async (circuitId: string): Promise<void> => {
  try {
    const key = getUserBookmarkKey('bookmarkedCircuits');
    const bookmarks = await AsyncStorage.getItem(key);
    if (!bookmarks) return;
    
    let bookmarkArray = JSON.parse(bookmarks);
    bookmarkArray = bookmarkArray.filter((id: string) => id !== circuitId);
    await AsyncStorage.setItem(key, JSON.stringify(bookmarkArray));
  } catch (error) {
    console.error('Error removing circuit bookmark:', error);
  }
};

// Generic bookmark functions for BookmarksScreen
export const isBookmarked = async (id: string): Promise<boolean> => {
  const isDriver = await isDriverBookmarked(id);
  const isCircuit = await isCircuitBookmarked(id);
  return isDriver || isCircuit;
};

export const addBookmark = async (id: string): Promise<void> => {
  await addDriverBookmark(id);
};

export const removeBookmark = async (id: string): Promise<void> => {
  await removeDriverBookmark(id);
  await removeCircuitBookmark(id);
};

// Get all bookmarks for the current user
export const getBookmarkedDriverIds = async (): Promise<string[]> => {
  try {
    const key = getUserBookmarkKey('bookmarkedDrivers');
    const bookmarks = await AsyncStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarked driver IDs:', error);
    return [];
  }
};

export const getBookmarkedCircuitIds = async (): Promise<string[]> => {
  try {
    const key = getUserBookmarkKey('bookmarkedCircuits');
    const bookmarks = await AsyncStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarked circuit IDs:', error);
    return [];
  }
};