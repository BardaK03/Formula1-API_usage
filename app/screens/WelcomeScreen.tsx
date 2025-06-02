import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface Props extends NativeStackScreenProps<any> {}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to Formula 1 App</Text>
    <PrimaryButton title="Login" onPress={() => navigation.navigate('Login')} />
    <SecondaryButton title="Register" onPress={() => navigation.navigate('Register')} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin * 2,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
