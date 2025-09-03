import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { searchStocks, getStockPrice } from "../services/api";
import { Stock, StockWithChange, Ticker } from "../models/Stock";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import { useNavigation } from "@react-navigation/native";
import {
  isStockBookmarked,
  addStockBookmark,
  removeStockBookmark,
  getBookmarkedStockSymbols,
} from "../services/bookmarkService";
import { getTheme, getCurrency } from "../services/userSettings";
import PrimaryButton from "../components/PrimaryButton";
import { convertPrice } from "../services/currencyService";

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ticker[]>([]);
  const [stockPrices, setStockPrices] = useState<{
    [symbol: string]: StockWithChange;
  }>({});
  const [loading, setLoading] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState<string[]>([]);
  const [bookmarkedStocks, setBookmarkedStocks] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RON">("USD");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
    loadUserPreferences();
  }, []);

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
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a search term");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const results = await searchStocks(searchQuery.trim());
      setSearchResults(results);
      setStockPrices({}); // Clear previous price data

      // Add to recent searches
      setRecentSearches((prev) => {
        const updated = [
          searchQuery.trim(),
          ...prev.filter((s) => s !== searchQuery.trim()),
        ];
        return updated.slice(0, 5); // Keep only 5 recent searches
      });

      // Load prices for first few results
      if (results.length > 0) {
        loadStockPrices(results.slice(0, 5)); // Load prices for first 5 results
      }
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Search Error", error.message || "Failed to search stocks");
    } finally {
      setLoading(false);
    }
  };

  const loadStockPrices = async (tickers: Ticker[]) => {
    const symbols = tickers.map((t) => t.symbol);
    setLoadingPrices(symbols);

    for (const ticker of tickers) {
      try {
        const stockData = await getStockPrice(ticker.symbol);
        if (stockData) {
          const stockWithChange = calculateStockChange(stockData);

          // Convert price if needed
          let convertedStock = stockWithChange;
          if (currency !== "USD") {
            try {
              const convertedPrice = await convertPrice(
                stockWithChange.close,
                currency
              );
              convertedStock = {
                ...stockWithChange,
                close: convertedPrice,
                open: await convertPrice(stockWithChange.open, currency),
                high: await convertPrice(stockWithChange.high, currency),
                low: await convertPrice(stockWithChange.low, currency),
              };
            } catch (conversionError) {
              console.error("Currency conversion error:", conversionError);
              // Use original USD prices if conversion fails
            }
          }

          setStockPrices((prev) => ({
            ...prev,
            [ticker.symbol]: convertedStock,
          }));
        }
      } catch (error) {
        console.error(`Error loading price for ${ticker.symbol}:`, error);
      } finally {
        setLoadingPrices((prev) => prev.filter((s) => s !== ticker.symbol));
      }
    }
  };

  const handleBookmarkToggle = async (symbol: string) => {
    try {
      const isBookmarked = await isStockBookmarked(symbol);

      if (isBookmarked) {
        await removeStockBookmark(symbol);
        setBookmarkedStocks((prev) => prev.filter((s) => s !== symbol));
        Alert.alert("Success", `${symbol} removed from watchlist`);
      } else {
        await addStockBookmark(symbol);
        setBookmarkedStocks((prev) => [...prev, symbol]);
        Alert.alert("Success", `${symbol} added to watchlist`);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update watchlist");
    }
  };

  const navigateToStockDetail = (
    ticker: Ticker,
    stockData?: StockWithChange
  ) => {
    navigation.navigate("StockDetail", {
      stock: stockData || { symbol: ticker.symbol, name: ticker.name },
      ticker,
    });
  };

  const formatPrice = (price: number) => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "RON ";
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Apply theming
  const backgroundColor = theme === "dark" ? "#181818" : COLORS.background;
  const textColor = theme === "dark" ? "#ffffff" : COLORS.text;
  const titleColor = theme === "dark" ? "#4a9eff" : COLORS.primary;
  const cardBackgroundColor = theme === "dark" ? "#2a2a2a" : "#ffffff";
  const inputBackgroundColor = theme === "dark" ? "#2a2a2a" : "#f8f9fa";

  const renderStockResult = ({ item }: { item: Ticker }) => {
    const stockData = stockPrices[item.symbol];
    const isBookmarked = bookmarkedStocks.includes(item.symbol);
    const isPriceLoading = loadingPrices.includes(item.symbol);

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: cardBackgroundColor }]}
        onPress={() => navigateToStockDetail(item, stockData)}
      >
        <View style={styles.resultHeader}>
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
              {item.stock_exchange.name} ({item.stock_exchange.acronym})
            </Text>
          </View>

          <View style={styles.priceContainer}>
            {isPriceLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : stockData ? (
              <>
                <Text style={[styles.stockPrice, { color: textColor }]}>
                  {formatPrice(stockData.close)}
                </Text>
                <Text
                  style={[
                    styles.stockChange,
                    {
                      color: stockData.isPositive
                        ? COLORS.success
                        : COLORS.error,
                    },
                  ]}
                >
                  {formatChange(stockData.priceChangePercent)}
                </Text>
              </>
            ) : (
              <Text style={[styles.loadPriceText, { color: titleColor }]}>
                Tap to load price
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <PrimaryButton
            title={isBookmarked ? "★ Watching" : "☆ Watch"}
            onPress={() => handleBookmarkToggle(item.symbol)}
            style={[
              styles.watchButton,
              {
                backgroundColor: isBookmarked ? COLORS.success : "transparent",
              },
            ]}
          />
          {!stockData && !isPriceLoading && (
            <PrimaryButton
              title="Get Price"
              onPress={() => loadStockPrices([item])}
              style={styles.priceButton}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.recentSearchItem,
        { backgroundColor: cardBackgroundColor },
      ]}
      onPress={() => {
        setSearchQuery(item);
        performSearch();
      }}
    >
      <Text style={[styles.recentSearchText, { color: textColor }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>Search Stocks</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: inputBackgroundColor,
              color: textColor,
              borderColor: theme === "dark" ? "#404040" : "#e0e0e0",
            },
          ]}
          placeholder="Enter stock symbol or company name..."
          placeholderTextColor={theme === "dark" ? "#888" : "#666"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={performSearch}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <PrimaryButton
          title="Search"
          onPress={performSearch}
          style={styles.searchButton}
          disabled={loading || !searchQuery.trim()}
        />
      </View>

      {/* Currency indicator */}
      <Text style={[styles.currencyText, { color: textColor, opacity: 0.7 }]}>
        Prices shown in {currency}
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Searching...
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) =>
            `${item.symbol}-${item.stock_exchange.acronym}`
          }
          renderItem={renderStockResult}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      ) : recentSearches.length > 0 && !searchQuery ? (
        <View style={styles.recentSearches}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Recent Searches
          </Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderRecentSearch}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentSearchesList}
          />
        </View>
      ) : null}

      {!loading && searchResults.length === 0 && searchQuery ? (
        <View style={styles.centered}>
          <Text style={[styles.noResultsText, { color: textColor }]}>
            No stocks found for "{searchQuery}"
          </Text>
          <Text style={[styles.searchTips, { color: textColor, opacity: 0.7 }]}>
            Try searching with stock symbols (e.g., AAPL, GOOGL) or company
            names
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: SIZES.margin / 2,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SIZES.padding / 2,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  searchButton: {
    width: 80,
    height: 50,
  },
  currencyText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: SIZES.margin,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.margin / 2,
    fontSize: 16,
  },
  resultsList: {
    paddingBottom: SIZES.padding,
  },
  resultCard: {
    borderRadius: 12,
    padding: SIZES.padding,
    marginBottom: SIZES.margin / 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
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
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  loadPriceText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  watchButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  priceButton: {
    flex: 1,
  },
  recentSearches: {
    marginTop: SIZES.margin,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin / 2,
  },
  recentSearchesList: {
    paddingRight: SIZES.padding,
  },
  recentSearchItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: 20,
    marginRight: SIZES.margin / 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  recentSearchText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: "center",
    marginBottom: SIZES.margin / 2,
  },
  searchTips: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: SIZES.padding,
  },
});

export default SearchScreen;
