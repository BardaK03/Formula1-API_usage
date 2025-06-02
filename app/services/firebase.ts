import { FIREBASE_AUTH } from '../../FirebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export const register = (email: string, password: string) =>
  createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(FIREBASE_AUTH, email, password);

export const logout = () => signOut(FIREBASE_AUTH);

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(FIREBASE_AUTH, callback);
