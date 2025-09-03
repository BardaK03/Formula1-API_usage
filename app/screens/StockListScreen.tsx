import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { getPopularStocks } from "../services/api";
import { Stock, StockWithChange } from "../models/Stock";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import { useNavigation } from "@react-navigation/native";
import {
  getBookmarkedStockSymbols,
  isStockBookmarked,
  addStockBookmark,
  removeStockBookmark,
} from "../services/bookmarkService";
import { getTheme, getCurrency } from "../services/userSettings";
import PrimaryButton from "../components/PrimaryButton";

const StockListScreen: React.FC = () => {
  const [stocks, setStocks] = useState<StockWithChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [bookmarkedStocks, setBookmarkedStocks] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RON">("USD");
  const navigation = useNavigation<any>();

  // Calculate price change for stocks
  const calculateStockChange = (stock: Stock): StockWithChange => {
    const priceChange = stock.close - stock.open;
    const priceChangePercent = (priceChange / stock.open) * 100;

    return {
      ...stock,
      priceChange,
      priceChangePercent,
      isPositive: priceChange >= 0,
    };
  };

  const loadStocks = async () => {
    try {
      setError("");
      const stockData = await getPopularStocks();
      const stocksWithChange = stockData.map(calculateStockChange);
      setStocks(stocksWithChange);
    } catch (e: any) {
      setError(e.message || "Failed to load stocks");
      console.error("Error loading stocks:", e);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const [userTheme, userCurrency, bookmarked] = await Promise.all([
        getTheme(),
        getCurrency(),
        getBookmarkedStockSymbols(),
      ]);

      setTheme(userTheme);
      setCurrency(userCurrency);
      setBookmarkedStocks(bookmarked);
    } catch (error) {
      console.error("Error loading user preferences:", error);
      setBookmarkedStocks([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([loadStocks(), loadUserPreferences()]);
      setLoading(false);
    };

    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStocks();
    await loadUserPreferences();
    setRefreshing(false);
  };

  const handleBookmarkToggle = async (symbol: string) => {
    try {
      const isBookmarked = await isStockBookmarked(symbol);

      if (isBookmarked) {
        await removeStockBookmark(symbol);
        setBookmarkedStocks((prev) => prev.filter((s) => s !== symbol));
      } else {
        await addStockBookmark(symbol);
        setBookmarkedStocks((prev) => [...prev, symbol]);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update bookmark");
    }
  };

  const navigateToStockDetail = (stock: StockWithChange) => {
    navigation.navigate("StockDetail", { stock });
  };

  // Apply theming
  const backgroundColor = theme === "dark" ? "#181818" : COLORS.background;
  const textColor = theme === "dark" ? "#ffffff" : COLORS.text;
  const titleColor = theme === "dark" ? "#4a9eff" : COLORS.primary;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading stocks...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <Text style={[styles.error, { color: COLORS.error }]}>{error}</Text>
        <PrimaryButton
          title="Retry"
          onPress={() => {
            setLoading(true);
            loadStocks().finally(() => setLoading(false));
          }}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const formatPrice = (price: number) => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "RON ";
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const renderStockItem = ({ item }: { item: StockWithChange }) => {
    const isBookmarked = bookmarkedStocks.includes(item.symbol);

    return (
      <View
        style={[
          styles.stockCard,
          { backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff" },
        ]}
      >
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockSymbol, { color: titleColor }]}>
              {item.symbol}
            </Text>
            <Text
              style={[styles.stockName, { color: textColor }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.stockExchange, { color: textColor, opacity: 0.7 }]}
            >
              {item.exchange}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.stockPrice, { color: textColor }]}>
              {formatPrice(item.close)}
            </Text>
            <Text
              style={[
                styles.stockChange,
                { color: item.isPositive ? COLORS.success : COLORS.error },
              ]}
            >
              {formatChange(item.priceChangePercent)}
            </Text>
          </View>
        </View>

        <View style={styles.stockActions}>
          <PrimaryButton
            title="View Details"
            onPress={() => navigateToStockDetail(item)}
            style={styles.detailButton}
          />
          <PrimaryButton
            title={isBookmarked ? "★ Remove" : "☆ Watch"}
            onPress={() => handleBookmarkToggle(item.symbol)}
            style={[
              styles.bookmarkButton,
              {
                backgroundColor: isBookmarked ? COLORS.success : "transparent",
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>Stock Market</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Showing {stocks.length} stocks • Currency: {currency}
      </Text>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: SIZES.margin,
    opacity: 0.8,
  },
  loadingText: {
    marginTop: SIZES.margin / 2,
    fontSize: 16,
  },
  error: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: SIZES.margin,
  },
  retryButton: {
    width: 120,
  },
  listContainer: {
    paddingBottom: SIZES.padding,
  },
  stockCard: {
    borderRadius: 12,
    padding: SIZES.padding,
    marginBottom: SIZES.margin / 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.margin / 2,
  },
  stockInfo: {
    flex: 1,
    marginRight: SIZES.margin / 2,
  },
  stockSymbol: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  stockExchange: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  stockPrice: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  stockActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  detailButton: {
    flex: 1,
  },
  bookmarkButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});

export default StockListScreen;
