import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import StockCard from "../components/StockCard";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import { logout } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { getDisplayName, getTheme } from "../services/userSettings";
import { getPopularStocks } from "../services/api";
import { Stock, StockWithChange } from "../models/Stock";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [popularStocks, setPopularStocks] = useState<StockWithChange[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [marketStatus, setMarketStatus] = useState<string>("Loading...");

  // Calculate price change for stocks
  const calculateStockChange = (stock: Stock): StockWithChange => {
    // Simple calculation - in real app, you'd compare with previous day close
    const priceChange = stock.close - stock.open;
    const priceChangePercent = (priceChange / stock.open) * 100;

    return {
      ...stock,
      priceChange,
      priceChangePercent,
      isPositive: priceChange >= 0,
    };
  };

  const loadDashboardData = async (forceRefresh: boolean = false) => {
    try {
      const stocks = await getPopularStocks(forceRefresh);
      const stocksWithChange = stocks.slice(0, 5).map(calculateStockChange);
      setPopularStocks(stocksWithChange);

      // Simple market status based on current time (EST business hours)
      const now = new Date();
      const est = new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      const hour = est.getHours();
      const day = est.getDay(); // 0 = Sunday, 6 = Saturday

      if (day === 0 || day === 6) {
        setMarketStatus("🔴 Markets Closed (Weekend)");
      } else if (hour >= 9 && hour < 16) {
        setMarketStatus("🟢 Markets Open");
      } else {
        setMarketStatus("🔴 Markets Closed");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setMarketStatus("❓ Status Unknown");
    }
  };

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    setEmail(user?.email || null);

    // Load user-specific display name and theme
    const loadSettings = async () => {
      try {
        if (user) {
          const savedName = await getDisplayName();
          const savedTheme = await getTheme();
          if (savedName) setDisplayName(savedName);
          setTheme(savedTheme); // getTheme already returns 'light' by default
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    loadDashboardData(); // Load dashboard data on mount
  }, []);

  const themedStyles = [
    styles.container,
    theme === "dark" && { backgroundColor: "#181818" },
  ];
  const themedText = {
    color: theme === "dark" ? "#fff" : COLORS.text,
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true); // Force refresh on pull-to-refresh
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <ScrollView
      style={themedStyles}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {displayName ? (
          <Text style={[styles.displayName, themedText]}>
            Welcome, {displayName}
          </Text>
        ) : null}
        {email && (
          <Text style={[styles.email, themedText]}>Logged in as: {email}</Text>
        )}

        <Text style={[styles.title, themedText]}>StockTrackr Dashboard</Text>

        {/* Market Status */}
        <View style={styles.statusCard}>
          <Text style={[styles.statusText, themedText]}>{marketStatus}</Text>
        </View>

        {/* Top Stocks Preview with StockCard */}
        <View style={styles.stocksPreview}>
          <Text style={[styles.sectionTitle, themedText]}>
            Top Performing Stocks
          </Text>
          {popularStocks.map((stock, index) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onPress={(selectedStock) =>
                navigation.navigate("StockDetail", {
                  stock: selectedStock,
                })
              }
              showBookmarkButton={true}
              showFullDetails={false}
              theme={theme}
            />
          ))}

          {popularStocks.length === 0 && !loading && (
            <Text style={[styles.emptyText, themedText]}>
              No stocks data available. Pull to refresh.
            </Text>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="All Stocks"
            onPress={() => navigation.navigate("StockList")}
            style={styles.menuButton}
          />
          <PrimaryButton
            title="Search Stocks"
            onPress={() => navigation.navigate("Search")}
            style={styles.menuButton}
          />
          <PrimaryButton
            title="My Watchlist"
            onPress={() => navigation.navigate("Bookmarks")}
            style={styles.menuButton}
          />
          <PrimaryButton
            title="Settings"
            onPress={() => navigation.navigate("Settings")}
            style={styles.menuButton}
          />
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
  },
  displayName: {
    color: COLORS.primary,
    fontSize: 18,
    marginBottom: 4,
    fontFamily: FONTS.bold,
    alignSelf: "flex-start",
  },
  email: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SIZES.margin / 2,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "rgba(0,122,255,0.1)",
    borderRadius: 12,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },
  stocksPreview: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin / 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: "center",
    paddingVertical: SIZES.padding,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: SIZES.margin,
  },
  menuButton: {
    width: "100%",
    marginBottom: SIZES.margin / 2,
  },
  logoutButton: {
    width: "100%",
    marginTop: SIZES.margin,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});

export default HomeScreen;
