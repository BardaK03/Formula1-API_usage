import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

// Get a user-specific settings key
const getUserSettingsKey = (setting: string) => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  if (!userId) throw new Error("No user logged in");
  return `${setting}_${userId}`;
};

// Display name functions
export const saveDisplayName = async (name: string): Promise<void> => {
  try {
    const key = getUserSettingsKey("displayName");
    await AsyncStorage.setItem(key, name);
  } catch (error) {
    console.error("Error saving display name:", error);
  }
};

export const getDisplayName = async (): Promise<string> => {
  try {
    const key = getUserSettingsKey("displayName");
    const name = await AsyncStorage.getItem(key);
    return name || "";
  } catch (error) {
    console.error("Error getting display name:", error);
    return "";
  }
};

// Theme functions
export const saveTheme = async (theme: "light" | "dark"): Promise<void> => {
  try {
    const key = getUserSettingsKey("theme");
    await AsyncStorage.setItem(key, theme);
  } catch (error) {
    console.error("Error saving theme:", error);
  }
};

export const getTheme = async (): Promise<"light" | "dark"> => {
  try {
    const key = getUserSettingsKey("theme");
    const theme = await AsyncStorage.getItem(key);
    return theme === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Error getting theme:", error);
    return "light";
  }
};

// Currency functions
export const saveCurrency = async (
  currency: "USD" | "EUR" | "RON"
): Promise<void> => {
  try {
    const key = getUserSettingsKey("currency");
    await AsyncStorage.setItem(key, currency);
  } catch (error) {
    console.error("Error saving currency:", error);
  }
};

export const getCurrency = async (): Promise<"USD" | "EUR" | "RON"> => {
  try {
    const key = getUserSettingsKey("currency");
    const currency = await AsyncStorage.getItem(key);
    return (currency as "USD" | "EUR" | "RON") || "USD";
  } catch (error) {
    console.error("Error getting currency:", error);
    return "USD";
  }
};

// Save all user settings at once
export const saveUserSettings = async (
  displayName: string,
  theme: "light" | "dark",
  currency?: "USD" | "EUR" | "RON"
): Promise<void> => {
  try {
    await saveDisplayName(displayName);
    await saveTheme(theme);
    if (currency) await saveCurrency(currency);
  } catch (error) {
    console.error("Error saving user settings:", error);
  }
};
