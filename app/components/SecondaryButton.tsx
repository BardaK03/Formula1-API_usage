import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';

interface Props extends TouchableOpacityProps {
  title: string;
}

const SecondaryButton: React.FC<Props> = ({ title, style, ...rest }) => (
  <TouchableOpacity style={[styles.button, style]} {...rest}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: SIZES.margin / 2,
  },
  text: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
});

export default SecondaryButton;
