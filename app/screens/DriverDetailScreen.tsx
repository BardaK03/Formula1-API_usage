import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import PrimaryButton from '../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  isBookmarked,
  addBookmark,
  removeBookmark,
} from '../services/bookmarkService';
import { getTheme } from '../services/userSettings';

type Driver = {
  driverId: string;
  code?: string;
  permanentNumber?: string;
  url?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality?: string;
};

type ParamList = {
  DriverDetail: { driver: Driver };
};

const DriverDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'DriverDetail'>>();
  const navigation = useNavigation<any>();
  const { driver } = route.params;
  const [bookmarked, setBookmarked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if driver is bookmarked
    isBookmarked(driver.driverId).then(setBookmarked);
    
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
  }, [driver.driverId]);
  const handleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(driver.driverId);
      setBookmarked(false);
    } else {
      await addBookmark(driver.driverId);
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
          title="Home"
          onPress={() => navigation.navigate('Home')}
          style={styles.navButton}
        />
        <PrimaryButton
          title="Driver List"
          onPress={() => navigation.navigate('DriverList')}
          style={styles.navButton}
        />
      </View>      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: titleColor }]}>
          {(driver.givenName || 'No First Name') + ' ' + (driver.familyName || 'No Last Name')}
        </Text>
        <Icon
          name={bookmarked ? 'star' : 'star-outline'}
          size={28}
          color={titleColor}
          style={{ marginLeft: 8 }}
        />
      </View>
      <Text style={[styles.label, { color: textColor }]}>
        Permanent Number:{' '}
        <Text style={[styles.value, { color: textColor }]}>
          {driver.permanentNumber || 'N/A'}
        </Text>
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        Code: <Text style={[styles.value, { color: textColor }]}>{driver.code || 'N/A'}</Text>
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        Nationality: <Text style={[styles.value, { color: textColor }]}>{driver.nationality || 'N/A'}</Text>
      </Text>
      <Text style={[styles.label, { color: textColor }]}>
        Date of Birth: <Text style={[styles.value, { color: textColor }]}>{driver.dateOfBirth || 'N/A'}</Text>
      </Text>      <PrimaryButton
        title="Wikipedia"
        onPress={() => driver.url && Linking.openURL(driver.url)}
        style={styles.wikiButton}
      />
      <PrimaryButton
        title={bookmarked ? 'Remove Bookmark' : 'Bookmark Driver'}
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

export default DriverDetailScreen;
