import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Circuit } from '../models/Circuit';
import {
  isCircuitBookmarked,
  addCircuitBookmark,
  removeCircuitBookmark,
} from '../services/bookmarkService';
import { getTheme } from '../services/userSettings';

type ParamList = {
  CircuitDetail: { circuit: Circuit };
};

const CircuitDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'CircuitDetail'>>();
  const navigation = useNavigation<any>();
  const { circuit } = route.params;
  const [bookmarked, setBookmarked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if circuit is bookmarked
    isCircuitBookmarked(circuit.circuitId).then(setBookmarked);
    
    // Load theme
    const loadTheme = async () => {
      try {
        const userTheme = await getTheme();
        setTheme(userTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    
    loadTheme();
  }, [circuit.circuitId]);
  const handleBookmark = async () => {
    if (bookmarked) {
      await removeCircuitBookmark(circuit.circuitId);
      setBookmarked(false);
    } else {
      await addCircuitBookmark(circuit.circuitId);
      setBookmarked(true);
    }
  };
  
  // Apply theming
  const backgroundColor = theme === 'dark' ? '#181818' : COLORS.background;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const titleColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <View style={styles.topNavRow}>
        <PrimaryButton
          title="Back to Circuits"
          onPress={() => navigation.navigate('Circuits')}
          style={styles.navButton}
        />
        <PrimaryButton
          title="Home"
          onPress={() => navigation.navigate('Home')}
          style={styles.navButton}
        />
      </View>      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: titleColor }]}>{circuit.circuitName}</Text>
        <Icon
          name={bookmarked ? 'star' : 'star-outline'}
          size={28}
          color={titleColor}
          style={{ marginLeft: 8 }}
        />
      </View>
      <Text style={[styles.label, { color: textColor }]}>
        Location: <Text style={[styles.value, { color: textColor }]}>
          {circuit.Location?.locality || 'Unknown'}, {circuit.Location?.country || 'Unknown'}
        </Text>
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        Latitude: <Text style={[styles.value, { color: textColor }]}>
          {circuit.Location?.lat || 'Unknown'}
        </Text>
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        Longitude: <Text style={[styles.value, { color: textColor }]}>
          {circuit.Location?.long || 'Unknown'}
        </Text>
      </Text>
      <PrimaryButton
        title="Wikipedia"
        onPress={() => circuit.url && Linking.openURL(circuit.url)}
        style={styles.wikiButton}
      />      <PrimaryButton
        title={bookmarked ? 'Remove Bookmark' : 'Bookmark Circuit'}
        onPress={handleBookmark}
        style={[
          styles.bookmarkButton,
          theme === 'dark' && { backgroundColor: '#333', borderColor: titleColor }
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    flexGrow: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  name: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
    fontFamily: FONTS.regular,
  },
  value: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  wikiButton: {
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  bookmarkButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
  },
});

export default CircuitDetailScreen;
