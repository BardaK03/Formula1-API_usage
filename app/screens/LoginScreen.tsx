import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { COLORS, SIZES, FONTS } from '../cssStyles/theme';
import { login } from '../services/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeContext } from '../../App';

interface Props extends NativeStackScreenProps<any> {}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      // Success handled by auth state - no need to navigate
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(e.message || 'Login failed');
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
      <Text style={[styles.title, { color: titleColor }]}>Login</Text>      <CustomInput
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
        <PrimaryButton title="Login" onPress={handleLogin} />
      )}
      
      <SecondaryButton
        title="Don’t have an account? Register"
        onPress={() => navigation.navigate('Register')}
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

export default LoginScreen;
