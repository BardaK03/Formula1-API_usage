import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { getDrivers2025, Driver } from '../services/api';
import DriverCard from '../components/DriverCard';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { useNavigation } from '@react-navigation/native';
import { getBookmarkedDriverIds } from '../services/bookmarkService';
import { getTheme } from '../services/userSettings';
import PrimaryButton from '../components/PrimaryButton';

const DriverListScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Load drivers
    getDrivers2025()
      .then(setDrivers)
      .catch((e) => setError(e.message || 'Failed to load drivers'))
      .finally(() => setLoading(false));
    
    // Load theme and bookmarks
    const loadUserPreferences = async () => {
      try {
        // Load theme
        const userTheme = await getTheme();
        setTheme(userTheme);
        
        // Load bookmarks
        const bookmarkedIds = await getBookmarkedDriverIds();
        setBookmarked(bookmarkedIds);
      } catch (error) {
        console.error("Error loading user preferences:", error);
        setBookmarked([]);
      }
    };
    
    loadUserPreferences();
  }, []);
  // Apply theming
  const backgroundColor = theme === 'dark' ? '#181818' : COLORS.background;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const titleColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={titleColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>Loading drivers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <Text style={styles.error}>{error}</Text>
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
      <Text style={[styles.title, { color: titleColor }]}>2025 F1 Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={item => item.driverId}
        renderItem={({ item }) => (
          <DriverCard
            givenName={item.givenName}
            familyName={item.familyName}
            permanentNumber={item.permanentNumber}
            bookmarked={bookmarked.includes(item.driverId)}
            onPressDetails={() => navigation.navigate('DriverDetail', { driver: item })}
            theme={theme}
          />
        )}
        contentContainerStyle={{ paddingBottom: SIZES.margin * 2 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DriverListScreen;
