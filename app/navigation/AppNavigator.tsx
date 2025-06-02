import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DriverListScreen from '../screens/DriverListScreen';
import DriverDetailScreen from '../screens/DriverDetailScreen';
import { subscribeToAuth } from '../services/firebase';
import { User } from 'firebase/auth';
import { View } from 'react-native';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppStackScreen() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="DriverList" component={DriverListScreen} />
      <AppStack.Screen name="DriverDetail" component={DriverDetailScreen} />
      <AppStack.Screen name="Circuits" component={require('../screens/CircuitListScreen').default} />
      <AppStack.Screen name="CircuitDetail" component={require('../screens/CircuitDetailScreen').default} />
      <AppStack.Screen name="Bookmarks">{() => <View />}</AppStack.Screen>
      <AppStack.Screen name="Settings">{() => <View />}</AppStack.Screen>
    </AppStack.Navigator>
  );
}

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
