import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedName = await AsyncStorage.getItem('displayName');
      if (savedTheme === 'dark') setDarkMode(true);
      if (savedName) setName(savedName);
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem('theme', darkMode ? 'dark' : 'light');
    await AsyncStorage.setItem('displayName', name);
    alert('Settings saved!');
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
