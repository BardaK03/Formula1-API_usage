import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { register } from '../services/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeContext } from '../../App';

interface Props extends NativeStackScreenProps<any> {}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      // Success handled by auth state
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else {
        setError(e.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Apply theme styling
  const backgroundColor = theme === 'dark' ? '#181818' : COLORS.background;
  const textColor = theme === 'dark' ? '#ffffff' : COLORS.text;
  const titleColor = theme === 'dark' ? '#ff6b6b' : COLORS.primary;
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>Register</Text>      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        theme={theme}
      />
      <CustomInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        theme={theme}
      />      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading ? (
        <ActivityIndicator size="large" color={titleColor} style={{ marginVertical: 10 }} />
      ) : (
        <PrimaryButton title="Create Account" onPress={handleRegister} />
      )}
      
      <SecondaryButton
        title="Already have an account? Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: 24, 
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default RegisterScreen;
