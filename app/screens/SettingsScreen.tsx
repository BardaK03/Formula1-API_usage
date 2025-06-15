import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Switch, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { getDisplayName, getTheme, saveUserSettings } from '../services/userSettings';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../App'; // Import the ThemeContext

export default function SettingsScreen() {
  const { theme: appTheme, toggleTheme } = useContext(ThemeContext); // Get theme from context
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (FIREBASE_AUTH.currentUser) {
          const savedTheme = await getTheme();
          const savedName = await getDisplayName();
          setDarkMode(savedTheme === 'dark');
          if (savedName) setName(savedName);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [refreshKey]); // Refresh when key changes

  // Update darkMode state when app theme changes
  useEffect(() => {
    setDarkMode(appTheme === 'dark');
  }, [appTheme]);

  const saveSettings = async () => {
    try {
      setLoading(true);
      await saveUserSettings(name, darkMode ? 'dark' : 'light');
      
      // Update app theme through context if it's different
      if ((darkMode && appTheme === 'light') || (!darkMode && appTheme === 'dark')) {
        toggleTheme();
      }
      
      // Trigger refresh and show success message
      setRefreshKey(prevKey => prevKey + 1);
      alert('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };  // Apply theming
  const backgroundColor = darkMode ? '#181818' : COLORS.background;
  const textColor = darkMode ? '#ffffff' : COLORS.text;
  const titleColor = darkMode ? '#ff6b6b' : COLORS.primary;
  const inputBackgroundColor = darkMode ? '#333333' : COLORS.inputBg;
  const borderColor = darkMode ? '#444444' : COLORS.border;
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={titleColor} />
        <Text style={{ color: textColor, marginTop: 16 }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <PrimaryButton
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
        style={styles.backButton}
      />
      <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
      <Switch 
        value={darkMode} 
        onValueChange={setDarkMode}
        trackColor={{ false: '#767577', true: '#ff6b6b' }}
        thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
      />
      
      <Text style={[styles.label, { color: textColor }]}>Display Name</Text>      
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: inputBackgroundColor, 
            borderColor: borderColor,
            color: textColor 
          }
        ]}
        value={name}
        placeholder="Enter your name"
        placeholderTextColor={darkMode ? '#aaaaaa' : '#999999'}
        onChangeText={setName}
      />

      <PrimaryButton title="Save Settings" onPress={saveSettings} style={styles.saveButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 24,
    flex: 1,
  },  backButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  saveButton: {
    marginTop: SIZES.margin,
  },
  label: { marginTop: 16, fontSize: 16 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 12,
    borderRadius: 8,
  },
});
