import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { StockWithChange, Ticker } from "../models/Stock";
import {
  isStockBookmarked,
  addStockBookmark,
  removeStockBookmark,
} from "../services/bookmarkService";
import { getTheme, getCurrency } from "../services/userSettings";
import { getStockPrice, getHistoricalData } from "../services/api";
import { convertPrice } from "../services/currencyService";

type ParamList = {
  StockDetail: {
    stock: StockWithChange;
    ticker?: Ticker;
  };
};

const StockDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, "StockDetail">>();
  const navigation = useNavigation<any>();
  const { stock: initialStock, ticker } = route.params;

  const [stock, setStock] = useState<StockWithChange>(initialStock);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RON">("USD");
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [marketCap, setMarketCap] = useState<string>("N/A");

  // Calculate price change for stocks
  const calculateStockChange = (stockData: any): StockWithChange => {
    const close = stockData.close || 0;
    const open = stockData.open || 0;
    const priceChange = close - open;
    const priceChangePercent = open > 0 ? (priceChange / open) * 100 : 0;

    return {
      ...stockData,
      priceChange,
      priceChangePercent,
      isPositive: priceChange >= 0,
    };
  };

  useEffect(() => {
    loadStockDetails();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const [userTheme, userCurrency, isBookmarked] = await Promise.all([
        getTheme(),
        getCurrency(),
        isStockBookmarked(stock.symbol),
      ]);

      setTheme(userTheme);
      setCurrency(userCurrency);
      setBookmarked(isBookmarked);
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const loadStockDetails = async () => {
    try {
      setLoading(true);

      // Get fresh stock price
      const freshStockData = await getStockPrice(stock.symbol);
      if (freshStockData) {
        let stockWithChange = calculateStockChange(freshStockData);

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

        setStock(stockWithChange);
      }

      // Try to get historical data (optional)
      try {
        const historicalData = await getHistoricalData(stock.symbol, 7); // Last 7 days
        setPriceHistory(historicalData.slice(0, 5)); // Show last 5 days
      } catch (error) {
        console.log("Historical data not available");
      }

      // Calculate estimated market cap (simplified)
      if (stock.volume > 0 && stock.close > 0) {
        const estimatedShares = stock.volume * 100; // Rough estimation
        const cap = estimatedShares * stock.close;
        if (cap > 1_000_000_000) {
          setMarketCap(`$${(cap / 1_000_000_000).toFixed(1)}B`);
        } else if (cap > 1_000_000) {
          setMarketCap(`$${(cap / 1_000_000).toFixed(1)}M`);
        } else {
          setMarketCap(`$${(cap / 1_000).toFixed(1)}K`);
        }
      }
    } catch (error) {
      console.error("Error loading stock details:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStockDetails();
    setRefreshing(false);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (bookmarked) {
        await removeStockBookmark(stock.symbol);
        setBookmarked(false);
        Alert.alert("Success", `${stock.symbol} removed from watchlist`);
      } else {
        await addStockBookmark(stock.symbol);
        setBookmarked(true);
        Alert.alert("Success", `${stock.symbol} added to watchlist`);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update watchlist");
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return "N/A";
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "RON ";
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatChange = (change: number | null) => {
    if (!change || change === 0) return "0.00%";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number | null) => {
    if (!volume || volume === 0) return "N/A";
    if (volume > 1_000_000) {
      return `${(volume / 1_000_000).toFixed(1)}M`;
    } else if (volume > 1_000) {
      return `${(volume / 1_000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  // Apply theming
  const backgroundColor = theme === "dark" ? "#181818" : COLORS.background;
  const textColor = theme === "dark" ? "#ffffff" : COLORS.text;
  const titleColor = theme === "dark" ? "#4a9eff" : COLORS.primary;
  const cardBackgroundColor = theme === "dark" ? "#2a2a2a" : "#ffffff";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockSymbol, { color: titleColor }]}>
              {stock.symbol}
            </Text>
            <Text
              style={[styles.stockName, { color: textColor }]}
              numberOfLines={2}
            >
              {stock.name}
            </Text>
            <Text
              style={[styles.stockExchange, { color: textColor, opacity: 0.7 }]}
            >
              {ticker?.stock_exchange?.name || stock.exchange}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.currentPrice, { color: textColor }]}>
              {formatPrice(stock.close)}
            </Text>
            <Text
              style={[
                styles.priceChange,
                { color: stock.isPositive ? COLORS.success : COLORS.error },
              ]}
            >
              {formatChange(stock.priceChangePercent)}
            </Text>
            <Text
              style={[
                styles.priceChangeAmount,
                { color: stock.isPositive ? COLORS.success : COLORS.error },
              ]}
            >
              {stock.priceChange >= 0 ? "+" : ""}
              {formatPrice(Math.abs(stock.priceChange))}
            </Text>
          </View>
        </View>
      </View>

      {/* Stock Statistics */}
      <View
        style={[styles.statsSection, { backgroundColor: cardBackgroundColor }]}
      >
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          Market Data
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              Open
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {formatPrice(stock.open)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              High
            </Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {formatPrice(stock.high)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              Low
            </Text>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {formatPrice(stock.low)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              Volume
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {formatVolume(stock.volume)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              Market Cap
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {marketCap}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}
            >
              Currency
            </Text>
            <Text style={[styles.statValue, { color: titleColor }]}>
              {currency}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Price History */}
      {priceHistory.length > 0 && (
        <View
          style={[
            styles.historySection,
            { backgroundColor: cardBackgroundColor },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Recent History
          </Text>

          {priceHistory.map((dayData, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={[styles.historyDate, { color: textColor }]}>
                {new Date(dayData.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.historyPrice, { color: textColor }]}>
                {formatPrice(dayData.close)}
              </Text>
              <Text
                style={[
                  styles.historyChange,
                  {
                    color:
                      dayData.close >= dayData.open
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}
              >
                {(() => {
                  const close = dayData.close || 0;
                  const open = dayData.open || 0;
                  if (open === 0) return "0.00";
                  return (((close - open) / open) * 100).toFixed(2);
                })()}
                %
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Exchange Information */}
      {ticker?.stock_exchange && (
        <View
          style={[
            styles.exchangeSection,
            { backgroundColor: cardBackgroundColor },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Exchange Information
          </Text>

          <View style={styles.exchangeInfo}>
            <Text style={[styles.exchangeName, { color: textColor }]}>
              {ticker.stock_exchange.name}
            </Text>
            <Text
              style={[
                styles.exchangeDetails,
                { color: textColor, opacity: 0.7 },
              ]}
            >
              {ticker.stock_exchange.acronym} • {ticker.stock_exchange.country}
            </Text>
            <Text
              style={[
                styles.exchangeDetails,
                { color: textColor, opacity: 0.7 },
              ]}
            >
              {ticker.stock_exchange.city}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <PrimaryButton
          title={bookmarked ? "★ Remove from Watchlist" : "☆ Add to Watchlist"}
          onPress={handleBookmarkToggle}
          style={[
            styles.watchlistButton,
            { backgroundColor: bookmarked ? COLORS.success : COLORS.primary },
          ]}
        />

        <SecondaryButton
          title="← Back to Stocks"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Updating prices...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    margin: SIZES.padding,
    borderRadius: 12,
    padding: SIZES.padding,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stockInfo: {
    flex: 1,
    marginRight: SIZES.margin,
  },
  stockSymbol: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  stockName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  stockExchange: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  currentPrice: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  priceChangeAmount: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  statsSection: {
    margin: SIZES.padding,
    marginTop: 0,
    borderRadius: 12,
    padding: SIZES.padding,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: SIZES.margin,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  historySection: {
    margin: SIZES.padding,
    marginTop: 0,
    borderRadius: 12,
    padding: SIZES.padding,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  historyPrice: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  historyChange: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: "right",
  },
  exchangeSection: {
    margin: SIZES.padding,
    marginTop: 0,
    borderRadius: 12,
    padding: SIZES.padding,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exchangeInfo: {
    alignItems: "flex-start",
  },
  exchangeName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  exchangeDetails: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  actionSection: {
    padding: SIZES.padding,
  },
  watchlistButton: {
    marginBottom: SIZES.margin / 2,
  },
  backButton: {
    marginBottom: SIZES.padding,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.margin / 2,
    fontSize: 16,
  },
});

export default StockDetailScreen;
