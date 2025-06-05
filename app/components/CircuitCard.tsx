import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Circuit } from '../models/Circuit';

interface Props {
  circuit: Circuit;
  bookmarked: boolean;
  onPress: () => void;
  theme?: 'light' | 'dark';
}

const CircuitCard: React.FC<Props> = ({ circuit, bookmarked, onPress, theme = 'light' }) => {
  // Apply theming
  const cardBackgroundColor = theme === 'dark' ? '#2a2a2a' : COLORS.card;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const accentColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: cardBackgroundColor }]} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: textColor }]}>{circuit.circuitName}</Text>
        <Icon
          name={bookmarked ? 'star' : 'star-outline'}
          size={22}
          color={accentColor}
          style={styles.star}
        />
      </View>
      <Text style={[styles.location, { color: textColor }]}>
        {circuit.Location && `${circuit.Location.locality}, ${circuit.Location.country}`}
      </Text>
    </TouchableOpacity>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  star: {
    marginLeft: 8,
  },
  location: {
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});

export default CircuitCard;
