import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Circuit } from '../models/Circuit';

interface Props {
  circuit: Circuit;
  bookmarked: boolean;
  onPress: () => void;
}

const CircuitCard: React.FC<Props> = ({ circuit, bookmarked, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.headerRow}>
      <Text style={styles.name}>{circuit.circuitName}</Text>
      <Icon
        name={bookmarked ? 'star' : 'star-outline'}
        size={22}
        color={COLORS.primary}
        style={styles.star}
      />
    </View>
    <Text style={styles.location}>
      {circuit.Location.locality}, {circuit.Location.country}
    </Text>
  </TouchableOpacity>
);

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
