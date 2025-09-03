// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for other Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqDTTZ8D6W7TQIN1544HGBhHLCSM24MAw",
  authDomain: "formula1-fe4d6.firebaseapp.com",
  projectId: "formula1-fe4d6",
  storageBucket: "formula1-fe4d6.firebasestorage.app",
  messagingSenderId: "777262516165",
  appId: "1:777262516165:web:cbb125245bc0b00011edac",
  measurementId: "G-7XZ7X2NT0G",
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Firebase Authentication - React Native automatically handles persistence
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export default FIREBASE_APP;
