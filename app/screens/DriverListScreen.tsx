import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { getDrivers2025, Driver } from '../services/api';
import DriverCard from '../components/DriverCard';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { useNavigation } from '@react-navigation/native';

const DriverListScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    getDrivers2025()
      .then(setDrivers)
      .catch((e) => setError(e.message || 'Failed to load drivers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading drivers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2025 F1 Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={item => item.driverId}
        renderItem={({ item }) => (
          <DriverCard
            givenName={item.givenName}
            familyName={item.familyName}
            permanentNumber={item.permanentNumber}
            onPressDetails={() => navigation.navigate('DriverDetail', { driver: item })}
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
