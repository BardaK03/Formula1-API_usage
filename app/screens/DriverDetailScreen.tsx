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

  useEffect(() => {
    isBookmarked(driver.driverId).then(setBookmarked);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{driver.givenName} {driver.familyName}</Text>
        <Icon
          name={bookmarked ? 'star' : 'star-outline'}
          size={28}
          color={COLORS.primary}
          style={{ marginLeft: 8 }}
        />
      </View>
      <Text style={styles.label}>
        Permanent Number:{' '}
        <Text style={styles.value}>
          {driver.permanentNumber || 'N/A'}
        </Text>
      </Text>
      <Text style={styles.label}>
        Code: <Text style={styles.value}>{driver.code || 'N/A'}</Text>
      </Text>
      <Text style={styles.label}>
        Nationality: <Text style={styles.value}>{driver.nationality || 'N/A'}</Text>
      </Text>
      <Text style={styles.label}>
        Date of Birth: <Text style={styles.value}>{driver.dateOfBirth || 'N/A'}</Text>
      </Text>
      <PrimaryButton
        title="Wikipedia"
        onPress={() => driver.url && Linking.openURL(driver.url)}
        style={styles.wikiButton}
      />
      <PrimaryButton
        title={bookmarked ? 'Remove Bookmark' : 'Bookmark Driver'}
        onPress={handleBookmark}
        style={styles.bookmarkButton}
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
