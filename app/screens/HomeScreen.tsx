import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { logout } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getDisplayName, getTheme } from '../services/userSettings';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    setEmail(user?.email || null);
    
    // Load user-specific display name and theme
    const loadSettings = async () => {
      try {
        if (user) {
          const savedName = await getDisplayName();
          const savedTheme = await getTheme();
          if (savedName) setDisplayName(savedName);
          setTheme(savedTheme); // getTheme already returns 'light' by default
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const themedStyles = [
    styles.container,
    theme === 'dark' && { backgroundColor: '#181818' }
  ];
  const themedText = {
    color: theme === 'dark' ? '#fff' : COLORS.text,
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <View style={themedStyles}>
      {displayName ? <Text style={[styles.displayName, themedText]}>{displayName}</Text> : null}
      {email && <Text style={[styles.email, themedText]}>Logged in as: {email}</Text>}
      <Text style={[styles.title, themedText]}>Main Menu</Text>
      <PrimaryButton
        title="Driver List"
        onPress={() => navigation.navigate('DriverList')}
        style={styles.menuButton}
      />
      <PrimaryButton
        title="Circuits"
        onPress={() => navigation.navigate('Circuits')}
        style={styles.menuButton}
      />
      <PrimaryButton
        title="Bookmarks / Favorites"
        onPress={() => navigation.navigate('Bookmarks')}
        style={styles.menuButton}
      />
      <PrimaryButton
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
        style={styles.menuButton}
      />
      <PrimaryButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  displayName: {
    color: COLORS.primary,
    fontSize: 18,
    marginBottom: 4,
    fontFamily: FONTS.bold,
    alignSelf: 'flex-start',
  },
  email: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SIZES.margin / 2,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  menuButton: {
    width: '100%',
    marginBottom: SIZES.margin / 2,
  },
  logoutButton: {
    width: '100%',
    marginTop: SIZES.margin,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});

export default HomeScreen;
