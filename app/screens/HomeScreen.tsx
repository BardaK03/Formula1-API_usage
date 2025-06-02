import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { logout } from '../services/firebase';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.text}>You are logged in!</Text>
      <PrimaryButton title="Logout" onPress={logout} />
    </View>
  );
};

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
    marginBottom: SIZES.margin,
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    marginBottom: SIZES.margin * 2,
  },
});

export default HomeScreen;
