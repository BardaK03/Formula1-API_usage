import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { getStockPrice } from "../services/api";
import { Stock, StockWithChange } from "../models/Stock";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import {
  getBookmarkedStockSymbols,
  removeStockBookmark,
} from "../services/bookmarkService";
import { getTheme, getCurrency } from "../services/userSettings";
import { convertPrice } from "../services/currencyService";
import PrimaryButton from "../components/PrimaryButton";

const BookmarksScreen: React.FC = () => {
  const [watchlistStocks, setWatchlistStocks] = useState<StockWithChange[]>([]);
  const [bookmarkedSymbols, setBookmarkedSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState<string[]>([]);
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

  useEffect(() => {
    loadWatchlist();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const [userTheme, userCurrency] = await Promise.all([
        getTheme(),
        getCurrency(),
      ]);

      setTheme(userTheme);
      setCurrency(userCurrency);
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const loadWatchlist = async () => {
    try {
      const symbols = await getBookmarkedStockSymbols();
      setBookmarkedSymbols(symbols);

      if (symbols.length > 0) {
        await loadStockPrices(symbols);
      } else {
        setWatchlistStocks([]);
      }
    } catch (error) {
      console.error("Error loading watchlist:", error);
      Alert.alert("Error", "Failed to load your watchlist");
    } finally {
      setLoading(false);
    }
  };

  const loadStockPrices = async (symbols: string[]) => {
    setLoadingPrices(symbols);
    const stocksWithData: StockWithChange[] = [];

    for (const symbol of symbols) {
      try {
        const stockData = await getStockPrice(symbol);
        if (stockData) {
          let stockWithChange = calculateStockChange(stockData);

          // Convert price if needed
          if (currency !== "USD") {
            try {
              const convertedPrice = await convertPrice(
                stockWithChange.close,
                currency
              );
              stockWithChange = {
                ...stockWithChange,
                close: convertedPrice,
                open: await convertPrice(stockWithChange.open, currency),
                high: await convertPrice(stockWithChange.high, currency),
                low: await convertPrice(stockWithChange.low, currency),
              };
            } catch (conversionError) {
              console.error("Currency conversion error:", conversionError);
            }
          }

          stocksWithData.push(stockWithChange);
        }
      } catch (error) {
        console.error(`Error loading price for ${symbol}:`, error);
        // Add placeholder data for failed stocks
        stocksWithData.push({
          symbol,
          name: symbol,
          exchange: "Unknown",
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
          adj_open: 0,
          adj_high: 0,
          adj_low: 0,
          adj_close: 0,
          adj_volume: 0,
          split_factor: 1,
          dividend: 0,
          date: new Date().toISOString().split("T")[0],
          priceChange: 0,
          priceChangePercent: 0,
          isPositive: false,
        });
      } finally {
        setLoadingPrices((prev) => prev.filter((s) => s !== symbol));
      }
    }

    // Sort by symbol
    stocksWithData.sort((a, b) => a.symbol.localeCompare(b.symbol));
    setWatchlistStocks(stocksWithData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    Alert.alert(
      "Remove from Watchlist",
      `Remove ${symbol} from your watchlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeStockBookmark(symbol);
              setBookmarkedSymbols((prev) => prev.filter((s) => s !== symbol));
              setWatchlistStocks((prev) =>
                prev.filter((stock) => stock.symbol !== symbol)
              );
              Alert.alert("Success", `${symbol} removed from watchlist`);
            } catch (error) {
              console.error("Error removing from watchlist:", error);
              Alert.alert("Error", "Failed to remove from watchlist");
            }
          },
        },
      ]
    );
  };

  const navigateToStockDetail = (stock: StockWithChange) => {
    navigation.navigate("StockDetail", { stock });
  };

  const navigateToSearch = () => {
    navigation.navigate("Search");
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "N/A";
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "RON ";
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    if (change === 0) return "0.00%";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Apply theming
  const backgroundColor = theme === "dark" ? "#181818" : COLORS.background;
  const textColor = theme === "dark" ? "#ffffff" : COLORS.text;
  const titleColor = theme === "dark" ? "#4a9eff" : COLORS.primary;
  const cardBackgroundColor = theme === "dark" ? "#2a2a2a" : "#ffffff";

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading your watchlist...
        </Text>
      </View>
    );
  }

  const renderWatchlistItem = ({ item }: { item: StockWithChange }) => {
    const isPriceLoading = loadingPrices.includes(item.symbol);
    const hasValidData = item.close > 0;

    return (
      <TouchableOpacity
        style={[styles.stockCard, { backgroundColor: cardBackgroundColor }]}
        onPress={() => navigateToStockDetail(item)}
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
            {hasValidData && (
              <Text
                style={[
                  styles.stockExchange,
                  { color: textColor, opacity: 0.7 },
                ]}
              >
                {item.exchange}
              </Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            {isPriceLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : hasValidData ? (
              <>
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
              </>
            ) : (
              <Text style={[styles.errorText, { color: COLORS.error }]}>
                Price unavailable
              </Text>
            )}
          </View>
        </View>

        <View style={styles.stockActions}>
          <PrimaryButton
            title="View Details"
            onPress={() => navigateToStockDetail(item)}
            style={styles.detailButton}
          />
          <PrimaryButton
            title="Remove"
            onPress={() => handleRemoveFromWatchlist(item.symbol)}
            style={styles.removeButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>My Watchlist</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        {bookmarkedSymbols.length} stocks • Currency: {currency}
      </Text>

      {bookmarkedSymbols.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: titleColor }]}>
            Your Watchlist is Empty
          </Text>
          <Text style={[styles.emptyDescription, { color: textColor }]}>
            Search for stocks and add them to your watchlist to track their
            performance.
          </Text>
          <PrimaryButton
            title="Search Stocks"
            onPress={navigateToSearch}
            style={styles.searchButton}
          />
        </View>
      ) : (
        <FlatList
          data={watchlistStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderWatchlistItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text
                style={[
                  styles.listHeaderText,
                  { color: textColor, opacity: 0.7 },
                ]}
              >
                Pull to refresh prices
              </Text>
            </View>
          }
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin / 2,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: SIZES.margin * 2,
    lineHeight: 22,
  },
  searchButton: {
    width: 200,
  },
  listContainer: {
    paddingBottom: SIZES.padding,
  },
  listHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin / 2,
  },
  listHeaderText: {
    fontSize: 12,
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
    minWidth: 80,
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
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },
  stockActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  detailButton: {
    flex: 2,
  },
  removeButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});

export default BookmarksScreen;
