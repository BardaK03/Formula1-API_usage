import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { getTheme } from './app/services/userSettings';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
          setTheme('light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Apply the theme's background color to the entire app
  const backgroundColor = theme === 'dark' ? '#181818' : '#f5f5f5';

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor }}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}