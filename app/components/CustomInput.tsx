import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { COLORS, SIZES } from '../cssStyles/theme';

const CustomInput = (props: TextInputProps) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholderTextColor={COLORS.text + '99'}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.margin / 2,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.padding,
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
});

export default CustomInput;
