import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDrivers2025, Driver } from '../services/api';
import { getCircuits2025 } from '../services/api';
import { Circuit } from '../models/Circuit';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { getCachedData, setCachedData } from '../services/cache';
import { getBookmarkedDriverIds, getBookmarkedCircuitIds } from '../services/bookmarkService';
import { getTheme } from '../services/userSettings';

const BookmarksScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadBookmarks();
    loadTheme();
  }, []);
  
  const loadTheme = async () => {
    try {
      const userTheme = await getTheme();
      setTheme(userTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };
  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarkedDriverIds = await getBookmarkedDriverIds();
      const bookmarkedCircuitIds = await getBookmarkedCircuitIds();
      let fullDrivers: Driver[] = [];
      let fullCircuits: Circuit[] = [];
      // Use cache for drivers
      const cachedDrivers = await getCachedData('drivers2025');
      if (cachedDrivers) {
        fullDrivers = cachedDrivers;
      } else {
        try {
          fullDrivers = await getDrivers2025();
          await setCachedData('drivers2025', fullDrivers);
        } catch {}
      }
      // Use cache for circuits
      const cachedCircuits = await getCachedData('circuits2025');
      if (cachedCircuits) {
        fullCircuits = cachedCircuits;
      } else {
        try {
          fullCircuits = await getCircuits2025();
          await setCachedData('circuits2025', fullCircuits);
        } catch {}
      }
      setDrivers(fullDrivers.filter(fd => bookmarkedDriverIds.includes(fd.driverId)));
      setCircuits(fullCircuits.filter(fc => bookmarkedCircuitIds.includes(fc.circuitId)));
    } finally {
      setLoading(false);
    }
  };

  const handleDriverPress = (driver: Driver) => {
    navigation.navigate('DriverDetail', { driver });
  };
  const handleCircuitPress = (circuit: Circuit) => {
    navigation.navigate('CircuitDetail', { circuit });
  };
  // Apply theming
  const backgroundColor = theme === 'dark' ? '#181818' : COLORS.background;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const titleColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;
  
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={titleColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>Bookmarked Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={item => item.driverId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleDriverPress(item)} 
            style={[styles.item, theme === 'dark' && { borderBottomColor: '#444' }]}
          >
            <Text style={[styles.itemText, { color: textColor }]}>
              {item.givenName} {item.familyName}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: textColor }]}>No drivers bookmarked.</Text>}
      />
      <Text style={[styles.title, { color: titleColor }]}>Bookmarked Circuits</Text>
      <FlatList
        data={circuits}
        keyExtractor={item => item.circuitId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleCircuitPress(item)} 
            style={[styles.item, theme === 'dark' && { borderBottomColor: '#444' }]}
          >
            <Text style={[styles.itemText, { color: textColor }]}>
              {item.circuitName}
              {item.Location && ` (${item.Location.locality}, ${item.Location.country})`}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: textColor }]}>No circuits bookmarked.</Text>}
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
  title: {
    fontSize: 22,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginTop: SIZES.margin,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  empty: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
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
});

export default BookmarksScreen;
