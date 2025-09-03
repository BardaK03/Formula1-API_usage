import React, { useState, useEffect, createContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./app/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { getTheme, saveTheme } from "./app/services/userSettings";
import { getStoredAuthState } from "./app/services/authPersistence";

// Create a theme context to share theme across the app
export const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);

  // Toggle theme function that will be passed to context
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Try to save the theme, only if user is logged in
    if (FIREBASE_AUTH.currentUser) {
      await saveTheme(newTheme);
    }
  };

  // Check for stored auth state and load theme when app starts
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        // Check if user has stored auth state
        const storedUid = await getStoredAuthState();

        // If user is authenticated, try to load their theme
        if (storedUid || FIREBASE_AUTH.currentUser) {
          const userTheme = await getTheme();
          setTheme(userTheme);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Listen for auth state changes and load theme
  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // User is signed in, get their theme preference
          const userTheme = await getTheme();
          setTheme(userTheme);
        } else {
          // User is signed out, use default theme
          setTheme("light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Apply the theme's background color to the entire app
  const backgroundColor = theme === "dark" ? "#181818" : "#f5f5f5";

  // If still loading initial state, could show a splash screen here
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            backgroundColor,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <View style={{ flex: 1, backgroundColor }}>
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <AppNavigator />
        </View>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
