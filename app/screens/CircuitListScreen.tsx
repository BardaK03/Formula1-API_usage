import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getCircuits2025 } from '../services/api';
import { Circuit } from '../models/Circuit';
import CircuitCard from '../components/CircuitCard';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { useNavigation } from '@react-navigation/native';
import { getBookmarkedCircuitIds } from '../services/bookmarkService';
import { getTheme } from '../services/userSettings';
import PrimaryButton from '../components/PrimaryButton';

const CircuitListScreen: React.FC = () => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigation = useNavigation<any>();
  
  useEffect(() => {
    // Load circuits
    getCircuits2025()
      .then(setCircuits)
      .catch((e) => setError(e.message || 'Failed to load circuits'))
      .finally(() => setLoading(false));
    
    // Load user preferences
    const loadUserPreferences = async () => {
      try {
        // Load theme
        const userTheme = await getTheme();
        setTheme(userTheme);
        
        // Load bookmarks
        const bookmarkedIds = await getBookmarkedCircuitIds();
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
        <Text style={[styles.loadingText, { color: textColor }]}>Loading circuits...</Text>
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
      <Text style={[styles.title, { color: titleColor }]}>2025 F1 Circuits</Text>
      <FlatList
        data={circuits}
        keyExtractor={item => item.circuitId}
        renderItem={({ item }) => (
          <CircuitCard
            circuit={item}
            bookmarked={bookmarked.includes(item.circuitId)}
            onPress={() => navigation.navigate('CircuitDetail', { circuit: item })}
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
