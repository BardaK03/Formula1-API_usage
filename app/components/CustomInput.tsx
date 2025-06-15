import React, { useContext } from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { COLORS, SIZES } from '../cssStyles/theme';
import { ThemeContext } from '../../App';

interface CustomInputProps extends TextInputProps {
  theme?: 'light' | 'dark';
}

const CustomInput: React.FC<CustomInputProps> = ({ theme: propTheme, ...props }) => {
  // Use provided theme prop or get from context
  const { theme: contextTheme } = useContext(ThemeContext);
  const theme = propTheme || contextTheme;
  
  // Apply theme-specific styles
  const backgroundColor = theme === 'dark' ? '#333333' : COLORS.inputBg;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const borderColor = theme === 'dark' ? '#444444' : COLORS.border;
  const placeholderTextColor = theme === 'dark' ? '#aaaaaa' : COLORS.text + '99';
  
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor, 
            color: textColor, 
            borderColor 
          }
        ]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.margin / 2,
  },
  input: {
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.padding,
    height: SIZES.inputHeight,
    borderWidth: 1,
    fontSize: 16,
  },
});

export default CustomInput;
