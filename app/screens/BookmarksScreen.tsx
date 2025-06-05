import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDrivers2025, Driver } from '../services/api';
import { getCircuits2025 } from '../services/api';
import { Circuit } from '../models/Circuit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { getCachedData, setCachedData } from '../services/cache';

const BOOKMARKED_DRIVERS_KEY = 'bookmarkedDrivers';
const BOOKMARKED_CIRCUITS_KEY = 'bookmarkedCircuits';

const BookmarksScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const d = await AsyncStorage.getItem(BOOKMARKED_DRIVERS_KEY);
      const c = await AsyncStorage.getItem(BOOKMARKED_CIRCUITS_KEY);
      const bookmarkedDriverIds: string[] = d ? JSON.parse(d) : [];
      const bookmarkedCircuitIds: string[] = c ? JSON.parse(c) : [];
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookmarked Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={item => item.driverId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDriverPress(item)} style={styles.item}>
            <Text style={styles.itemText}>{item.givenName} {item.familyName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No drivers bookmarked.</Text>}
      />
      <Text style={styles.title}>Bookmarked Circuits</Text>
      <FlatList
        data={circuits}
        keyExtractor={item => item.circuitId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCircuitPress(item)} style={styles.item}>
            <Text style={styles.itemText}>{item.circuitName} ({item.Location.locality}, {item.Location.country})</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No circuits bookmarked.</Text>}
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
