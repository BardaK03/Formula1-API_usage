import { FIREBASE_AUTH } from '../../FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth';

// Key for storing auth state
const AUTH_STATE_KEY = '@auth_state';

/**
 * Enable Firebase Auth persistence using AsyncStorage
 * This ensures the user stays logged in across app restarts
 */
export const enablePersistence = async (): Promise<void> => {
  try {
    // Set Firebase auth to use local persistence
    await setPersistence(FIREBASE_AUTH, browserLocalPersistence);
  } catch (error) {
    console.error('Error enabling persistence:', error);
  }
};

/**
 * Store user auth data in AsyncStorage to maintain session
 * @param uid User ID to store
 */
export const storeAuthState = async (uid: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STATE_KEY, uid);
  } catch (error) {
    console.error('Error storing auth state:', error);
  }
};

/**
 * Clear auth state from AsyncStorage on logout
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

/**
 * Get stored auth state from AsyncStorage
 * @returns User ID if stored, null otherwise
 */
export const getStoredAuthState = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_STATE_KEY);
  } catch (error) {
    console.error('Error retrieving auth state:', error);
    return null;
  }
};

/**
 * Check if user is already authenticated from AsyncStorage
 * and restore their session if they are
 */
export const restoreAuthState = async (): Promise<boolean> => {
  try {
    const uid = await getStoredAuthState();
    // If uid exists and there's no current user, we can consider them logged in
    return !!uid && !FIREBASE_AUTH.currentUser;
  } catch (error) {
    console.error('Error restoring auth state:', error);
    return false;
  }
};