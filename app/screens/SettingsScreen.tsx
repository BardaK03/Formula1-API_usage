import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TextInput, Button, StyleSheet } from 'react-native';
import { getDisplayName, getTheme, saveUserSettings } from '../services/userSettings';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (FIREBASE_AUTH.currentUser) {
          const savedTheme = await getTheme();
          const savedName = await getDisplayName();
          if (savedTheme === 'dark') setDarkMode(true);
          if (savedName) setName(savedName);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await saveUserSettings(name, darkMode ? 'dark' : 'light');
      alert('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dark Mode</Text>
      <Switch value={darkMode} onValueChange={setDarkMode} />
      
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Enter your name"
        onChangeText={setName}
      />

      <Button title="Save Settings" onPress={saveSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { marginTop: 16, fontSize: 16 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 12,
    borderRadius: 8,
  },
});
