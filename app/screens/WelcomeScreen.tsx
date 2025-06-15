import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeContext } from '../../App';

interface Props extends NativeStackScreenProps<any> {}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  
  // Apply theme styling
  const backgroundColor = theme === 'dark' ? '#181818' : COLORS.background;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const titleColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>Welcome to Formula 1 App</Text>
      <PrimaryButton title="Login" onPress={() => navigation.navigate('Login')} />
      <SecondaryButton title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin * 2,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
