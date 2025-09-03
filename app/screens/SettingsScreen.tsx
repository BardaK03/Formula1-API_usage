import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  getDisplayName,
  getTheme,
  saveUserSettings,
  getCurrency,
  saveCurrency,
} from "../services/userSettings";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../App";
import { getCacheStats, clearCache } from "../services/cache";
import { getBookmarkedStockSymbols } from "../services/bookmarkService";

export default function SettingsScreen() {
  const { theme: appTheme, toggleTheme } = useContext(ThemeContext);
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrencyState] = useState<"USD" | "EUR" | "RON">("USD");
  const [loading, setLoading] = useState(true);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [cacheStats, setCacheStats] = useState<{
    totalItems: number;
    expiredItems: number;
    totalSize: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigation = useNavigation<any>();

  const currencyOptions: {
    code: "USD" | "EUR" | "RON";
    name: string;
    symbol: string;
  }[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "RON", name: "Romanian Leu", symbol: "RON" },
  ];

  useEffect(() => {
    loadSettings();
  }, [refreshKey]);

  // Update darkMode state when app theme changes
  useEffect(() => {
    setDarkMode(appTheme === "dark");
  }, [appTheme]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (FIREBASE_AUTH.currentUser) {
        const [savedTheme, savedName, savedCurrency, bookmarkedSymbols, stats] =
          await Promise.all([
            getTheme(),
            getDisplayName(),
            getCurrency(),
            getBookmarkedStockSymbols(),
            getCacheStats(),
          ]);

        setDarkMode(savedTheme === "dark");
        if (savedName) setName(savedName);
        setCurrencyState(savedCurrency);
        setWatchlistCount(bookmarkedSymbols.length);
        setCacheStats(stats);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await Promise.all([
        saveUserSettings(name, darkMode ? "dark" : "light", currency),
        saveCurrency(currency),
      ]);

      // Update app theme through context if it's different
      if (
        (darkMode && appTheme === "light") ||
        (!darkMode && appTheme === "dark")
      ) {
        toggleTheme();
      }

      Alert.alert("Success", "Settings saved successfully!");

      // Refresh data
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached stock data. You may experience slower loading times until the cache rebuilds.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await clearCache(""); // Clear all cache
              Alert.alert("Success", "Cache cleared successfully!");
              setRefreshKey((prev) => prev + 1);
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert("Error", "Failed to clear cache.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }; // Apply theming
  const backgroundColor = darkMode ? "#181818" : COLORS.background;
  const textColor = darkMode ? "#ffffff" : COLORS.text;
  const titleColor = darkMode ? "#ff6b6b" : COLORS.primary;
  const inputBackgroundColor = darkMode ? "#333333" : COLORS.inputBg;
  const borderColor = darkMode ? "#444444" : COLORS.border;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={titleColor} />
        <Text style={{ color: textColor, marginTop: 16 }}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        StockTrackr Settings
      </Text>

      {/* User Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Personal
        </Text>

        <Text style={[styles.label, { color: textColor }]}>Display Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: borderColor,
              color: textColor,
            },
          ]}
          value={name}
          placeholder="Enter your name"
          placeholderTextColor={darkMode ? "#aaaaaa" : "#999999"}
          onChangeText={setName}
        />
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Appearance
        </Text>

        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Currency Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Currency
        </Text>
        <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
          Select your preferred currency for stock prices
        </Text>

        {currencyOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[
              styles.currencyOption,
              {
                backgroundColor:
                  currency === option.code
                    ? `${COLORS.primary}20`
                    : "transparent",
                borderColor:
                  currency === option.code ? COLORS.primary : borderColor,
              },
            ]}
            onPress={() => setCurrencyState(option.code)}
          >
            <View style={styles.currencyInfo}>
              <Text style={[styles.currencySymbol, { color: titleColor }]}>
                {option.symbol}
              </Text>
              <View>
                <Text style={[styles.currencyCode, { color: textColor }]}>
                  {option.code}
                </Text>
                <Text
                  style={[
                    styles.currencyName,
                    { color: textColor, opacity: 0.7 },
                  ]}
                >
                  {option.name}
                </Text>
              </View>
            </View>
            {currency === option.code && (
              <Text
                style={[styles.selectedIndicator, { color: COLORS.primary }]}
              >
                ✓
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Stock Data */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Stock Data
        </Text>

        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: textColor }]}>
            Watchlist Stocks
          </Text>
          <Text style={[styles.statValue, { color: titleColor }]}>
            {watchlistCount}
          </Text>
        </View>

        {cacheStats && (
          <>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Cached Items
              </Text>
              <Text style={[styles.statValue, { color: titleColor }]}>
                {cacheStats.totalItems}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Cache Size
              </Text>
              <Text style={[styles.statValue, { color: titleColor }]}>
                {formatCacheSize(cacheStats.totalSize)}
              </Text>
            </View>
            {cacheStats.expiredItems > 0 && (
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: textColor }]}>
                  Expired Items
                </Text>
                <Text style={[styles.statValue, { color: COLORS.error }]}>
                  {cacheStats.expiredItems}
                </Text>
              </View>
            )}
          </>
        )}

        <SecondaryButton
          title="Clear Cache"
          onPress={handleClearCache}
          style={styles.clearCacheButton}
        />
      </View>

      {/* Save Settings */}
      <PrimaryButton
        title="Save Settings"
        onPress={saveSettings}
        style={styles.saveButton}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    textAlign: "center",
    marginBottom: SIZES.margin,
  },
  section: {
    marginBottom: SIZES.margin * 1.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: SIZES.margin / 2,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.margin / 2,
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: SIZES.margin / 2,
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    width: 40,
    textAlign: "center",
    marginRight: SIZES.margin / 2,
  },
  currencyCode: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  currencyName: {
    fontSize: 12,
  },
  selectedIndicator: {
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  clearCacheButton: {
    marginTop: SIZES.margin / 2,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  saveButton: {
    marginTop: SIZES.margin,
    marginBottom: SIZES.padding,
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  input: {
    borderWidth: 1,
    padding: SIZES.padding / 2,
    marginVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});
