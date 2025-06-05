import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getCircuits2025 } from '../services/api';
import { Circuit } from '../models/Circuit';
import CircuitCard from '../components/CircuitCard';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { useNavigation } from '@react-navigation/native';
import { getBookmarkedCircuits } from '../services/bookmarkService';
import PrimaryButton from '../components/PrimaryButton';

const CircuitListScreen: React.FC = () => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    getCircuits2025()
      .then(setCircuits)
      .catch((e) => setError(e.message || 'Failed to load circuits'))
      .finally(() => setLoading(false));
    getBookmarkedCircuits().then(setBookmarked);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading circuits...</Text>
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
      <PrimaryButton
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
        style={styles.backButton}
      />
      <Text style={styles.title}>2025 F1 Circuits</Text>
      <FlatList
        data={circuits}
        keyExtractor={item => item.circuitId}
        renderItem={({ item }) => (
          <CircuitCard
            circuit={item}
            bookmarked={bookmarked.includes(item.circuitId)}
            onPress={() => navigation.navigate('CircuitDetail', { circuit: item })}
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
  backButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
});

export default CircuitListScreen;
