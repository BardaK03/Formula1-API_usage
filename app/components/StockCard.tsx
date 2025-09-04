import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import { Stock, StockWithChange } from "../models/Stock";
import { getStockPrice } from "../services/api";
import { convertPrice, getCurrencySymbol } from "../services/currencyService";
import { getCurrency } from "../services/userSettings";
import {
  addStockBookmark,
  removeStockBookmark,
  isStockBookmarked,
} from "../services/bookmarkService";

interface StockCardProps {
  stock: Stock | StockWithChange;
  onPress?: (stock: Stock) => void;
  showBookmarkButton?: boolean;
  showFullDetails?: boolean;
  refreshTrigger?: number; // Used to trigger refresh from parent
  theme?: "light" | "dark";
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onPress,
  showBookmarkButton = false,
  showFullDetails = false,
  refreshTrigger = 0,
  theme = "light",
}) => {
  const [currentStock, setCurrentStock] = useState<Stock>(stock);
  const [loading, setLoading] = useState(false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RON">("USD");
  const [convertedPrice, setConvertedPrice] = useState<number>(stock.close);
  const [convertedOpen, setConvertedOpen] = useState<number>(stock.open);
  const [convertedHigh, setConvertedHigh] = useState<number>(stock.high);
  const [convertedLow, setConvertedLow] = useState<number>(stock.low);
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percent: number;
    isPositive: boolean;
  } | null>(null);

  // Load user settings and bookmark status
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userCurrency = await getCurrency();
        setCurrency(userCurrency);

        if (showBookmarkButton) {
          const bookmarked = await isStockBookmarked(stock.symbol);
          setIsBookmarkedState(bookmarked);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [stock.symbol, showBookmarkButton]);

  // Convert prices when currency changes
  useEffect(() => {
    const convertPrices = async () => {
      try {
        const [close, open, high, low] = await Promise.all([
          convertPrice(currentStock.close, currency),
          convertPrice(currentStock.open, currency),
          convertPrice(currentStock.high, currency),
          convertPrice(currentStock.low, currency),
        ]);

        setConvertedPrice(close);
        setConvertedOpen(open);
        setConvertedHigh(high);
        setConvertedLow(low);
      } catch (error) {
        console.error("Error converting currency:", error);
        setConvertedPrice(currentStock.close);
        setConvertedOpen(currentStock.open);
        setConvertedHigh(currentStock.high);
        setConvertedLow(currentStock.low);
      }
    };

    convertPrices();
  }, [
    currentStock.close,
    currentStock.open,
    currentStock.high,
    currentStock.low,
    currency,
  ]);

  // Calculate price changes for stocks with change data
  useEffect(() => {
    if ("priceChange" in stock && "priceChangePercent" in stock) {
      setPriceChange({
        value: stock.priceChange,
        percent: stock.priceChangePercent,
        isPositive: stock.isPositive,
      });
    } else {
      // Calculate basic change from open to close
      const change = currentStock.close - currentStock.open;
      const changePercent = (change / currentStock.open) * 100;
      setPriceChange({
        value: change,
        percent: changePercent,
        isPositive: change >= 0,
      });
    }
  }, [stock, currentStock]);

  // Refresh stock data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshStockData();
    }
  }, [refreshTrigger]);

  const refreshStockData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const updatedStock = await getStockPrice(stock.symbol);
      setCurrentStock(updatedStock);
    } catch (error) {
      console.error("Error refreshing stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      let newBookmarkState: boolean;

      if (isBookmarkedState) {
        await removeStockBookmark(stock.symbol);
        newBookmarkState = false;
      } else {
        await addStockBookmark(stock.symbol);
        newBookmarkState = true;
      }

      setIsBookmarkedState(newBookmarkState);

      const message = newBookmarkState
        ? `${stock.symbol} added to watchlist`
        : `${stock.symbol} removed from watchlist`;

      Alert.alert("Watchlist Updated", message);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update watchlist");
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return "N/A";
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number | null) => {
    if (!volume || volume === 0) return "N/A";
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const cardStyle = [styles.card, theme === "dark" && styles.cardDark];

  const textStyle = {
    color: theme === "dark" ? "#fff" : COLORS.text,
  };

  const subtextStyle = {
    color: theme === "dark" ? "#ccc" : COLORS.secondary,
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onPress && onPress(currentStock)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, textStyle]}>{stock.symbol}</Text>
          {stock.name && (
            <Text style={[styles.name, subtextStyle]} numberOfLines={1}>
              {stock.name}
            </Text>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, textStyle]}>
            {formatPrice(convertedPrice)}
          </Text>

          {priceChange && (
            <Text
              style={[
                styles.change,
                {
                  color: priceChange.isPositive ? COLORS.success : COLORS.error,
                },
              ]}
            >
              {formatChange(priceChange.percent)}
            </Text>
          )}
        </View>
      </View>

      {showFullDetails && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, subtextStyle]}>Open:</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {formatPrice(convertedOpen)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, subtextStyle]}>High:</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {formatPrice(convertedHigh)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, subtextStyle]}>Low:</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {formatPrice(convertedLow)}
            </Text>
          </View>

          {currentStock.volume && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, subtextStyle]}>Volume:</Text>
              <Text style={[styles.detailValue, textStyle]}>
                {formatVolume(currentStock.volume)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={theme === "dark" ? "#fff" : COLORS.primary}
          />
        )}

        {showBookmarkButton && (
          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              isBookmarkedState && styles.bookmarkButtonActive,
            ]}
            onPress={handleBookmarkToggle}
          >
            <Text
              style={[
                styles.bookmarkText,
                { color: isBookmarkedState ? "#fff" : COLORS.primary },
              ]}
            >
              {isBookmarkedState ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: SIZES.padding,
    marginVertical: SIZES.margin / 4,
    marginHorizontal: SIZES.margin / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: "#2c2c2c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin / 2,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  change: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  details: {
    marginVertical: SIZES.margin / 2,
    paddingTop: SIZES.margin / 2,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.margin / 4,
  },
  bookmarkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkButtonActive: {
    backgroundColor: COLORS.primary,
  },
  bookmarkText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default StockCard;
