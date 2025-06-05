import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  team?: string; // will be undefined, but keep for future
  bookmarked?: boolean; // Add bookmarked prop
  theme?: 'light' | 'dark'; // Add theme prop
  onPressDetails: () => void;
}

const DriverCard: React.FC<Props> = ({
  givenName,
  familyName,
  permanentNumber,
  bookmarked = false,
  theme = 'light',
  onPressDetails,
}) => {
  // Apply theming
  const cardBackgroundColor = theme === 'dark' ? '#2a2a2a' : COLORS.card;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const accentColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;

  return (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      <Icon 
        name={bookmarked ? "star" : "star-outline"} 
        size={24} 
        color={accentColor} 
        style={styles.bookmark} 
      />
      <Text style={[styles.name, { color: textColor }]}>{givenName} {familyName}</Text>
      <Text style={[styles.number, { color: textColor }]}>
        {permanentNumber ? `#${permanentNumber}` : 'No Number'}
      </Text>
      {/* Team not available from this endpoint */}
      <PrimaryButton title="View Details" onPress={onPressDetails} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginVertical: SIZES.margin / 2,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
  },
  bookmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  number: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 4,
  },
  team: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  button: {
    marginTop: 4,
  },
});

export default DriverCard;
