import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from AsyncStorage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setTheme('dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
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