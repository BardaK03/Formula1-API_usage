import { FIREBASE_AUTH } from "../../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  enablePersistence,
  storeAuthState,
  clearAuthState,
  getStoredAuthState,
  restoreAuthState,
} from "./authPersistence";

// Initialize persistence when the module is loaded
enablePersistence().catch(console.error);

export const register = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    FIREBASE_AUTH,
    email,
    password
  );
  // Store the user ID for persistence
  if (userCredential.user) {
    await storeAuthState(userCredential.user.uid);
  }
  return userCredential;
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    FIREBASE_AUTH,
    email,
    password
  );
  // Store the user ID for persistence
  if (userCredential.user) {
    await storeAuthState(userCredential.user.uid);
  }
  return userCredential;
};

export const logout = async () => {
  await clearAuthState();
  return signOut(FIREBASE_AUTH);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  // First check if we have stored auth state
  restoreAuthState().catch(console.error);

  // Then return the subscription to auth state changes
  return onAuthStateChanged(FIREBASE_AUTH, (user) => {
    if (user) {
      // Update stored auth state when user changes
      storeAuthState(user.uid).catch(console.error);
    }
    callback(user);
  });
};
