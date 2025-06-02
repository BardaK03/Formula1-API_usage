import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARK_KEY = 'bookmarkedDrivers';
const CIRCUIT_BOOKMARK_KEY = 'bookmarkedCircuits';

export const getBookmarkedDrivers = async (): Promise<string[]> => {
  const json = await AsyncStorage.getItem(BOOKMARK_KEY);
  return json ? JSON.parse(json) : [];
};

export const addBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedDrivers();
  if (!bookmarks.includes(id)) {
    bookmarks.push(id);
    await AsyncStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedDrivers();
  const filtered = bookmarks.filter((d) => d !== id);
  await AsyncStorage.setItem(BOOKMARK_KEY, JSON.stringify(filtered));
};

export const isBookmarked = async (id: string): Promise<boolean> => {
  const bookmarks = await getBookmarkedDrivers();
  return bookmarks.includes(id);
};

export const getBookmarkedCircuits = async (): Promise<string[]> => {
  const json = await AsyncStorage.getItem(CIRCUIT_BOOKMARK_KEY);
  return json ? JSON.parse(json) : [];
};

export const addCircuitBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedCircuits();
  if (!bookmarks.includes(id)) {
    bookmarks.push(id);
    await AsyncStorage.setItem(CIRCUIT_BOOKMARK_KEY, JSON.stringify(bookmarks));
  }
};

export const removeCircuitBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedCircuits();
  const filtered = bookmarks.filter((c) => c !== id);
  await AsyncStorage.setItem(CIRCUIT_BOOKMARK_KEY, JSON.stringify(filtered));
};

export const isCircuitBookmarked = async (id: string): Promise<boolean> => {
  const bookmarks = await getBookmarkedCircuits();
  return bookmarks.includes(id);
};
