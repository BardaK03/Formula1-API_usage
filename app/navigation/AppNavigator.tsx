import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text } from "react-native";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import StockListScreen from "../screens/StockListScreen";
import StockDetailScreen from "../screens/StockDetailScreen";
import SearchScreen from "../screens/SearchScreen";
import BookmarksScreen from "../screens/BookmarksScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { subscribeToAuth } from "../services/firebase";
import {
  getStoredAuthState,
  restoreAuthState,
} from "../services/authPersistence";
import { User } from "firebase/auth";
import { COLORS } from "../cssStyles/theme";
import { ThemeContext } from "../../App";

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
      {/* Stock-focused screens */}
      <AppStack.Screen name="StockList" component={StockListScreen} />
      <AppStack.Screen name="StockDetail" component={StockDetailScreen} />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="Bookmarks" component={BookmarksScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
  );
}

const AppNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if we have a stored auth state
        const isRestoredAuth = await restoreAuthState();

        // Then subscribe to auth state changes
        const unsubscribe = subscribeToAuth((user) => {
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
        return () => {}; // Empty cleanup function in case of error
      }
    };

    initializeAuth();
  }, []);

  // Apply themed colors for loading screen
  const backgroundColor = theme === "dark" ? "#181818" : "#f5f5f5";
  const textColor = theme === "dark" ? "#ffffff" : COLORS.text;
  const spinnerColor = theme === "dark" ? "#ff6b6b" : COLORS.primary;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor,
        }}
      >
        <ActivityIndicator size="large" color={spinnerColor} />
        <Text style={{ color: textColor, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
