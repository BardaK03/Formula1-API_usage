import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS, SIZES, FONTS } from "../cssStyles/theme";
import { HistoricalData } from "../models/Stock";

const { width } = Dimensions.get("window");

interface StockChartProps {
  data: HistoricalData[];
  title?: string;
  theme?: "light" | "dark";
  height?: number;
}

const StockChart: React.FC<StockChartProps> = ({
  data,
  title = "Price History",
  theme = "light",
  height = 200,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text
          style={[
            styles.title,
            { color: theme === "dark" ? "#fff" : COLORS.text },
          ]}
        >
          {title}
        </Text>
        <View
          style={[
            styles.emptyChart,
            { backgroundColor: theme === "dark" ? "#2c2c2c" : "#f5f5f5" },
          ]}
        >
          <Text
            style={[
              styles.emptyText,
              { color: theme === "dark" ? "#ccc" : COLORS.secondary },
            ]}
          >
            No chart data available
          </Text>
        </View>
      </View>
    );
  }

  // Simple text-based chart implementation
  // In a real app, you'd use react-native-svg or react-native-chart-kit
  const prices = data.map((item) => item.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getChangeColor = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) return COLORS.success;
    if (currentPrice < previousPrice) return COLORS.error;
    return COLORS.neutral;
  };

  return (
    <View style={[styles.container, { height }]}>
      {title && (
        <Text
          style={[
            styles.title,
            { color: theme === "dark" ? "#fff" : COLORS.text },
          ]}
        >
          {title}
        </Text>
      )}

      <View
        style={[
          styles.chart,
          { backgroundColor: theme === "dark" ? "#2c2c2c" : "#f8fafc" },
        ]}
      >
        {/* Price Range Indicators */}
        <View style={styles.priceLabels}>
          <Text
            style={[
              styles.priceLabel,
              { color: theme === "dark" ? "#ccc" : COLORS.secondary },
            ]}
          >
            {formatPrice(maxPrice)}
          </Text>
          <Text
            style={[
              styles.priceLabel,
              { color: theme === "dark" ? "#ccc" : COLORS.secondary },
            ]}
          >
            {formatPrice(minPrice)}
          </Text>
        </View>

        {/* Simple Bar Chart Representation */}
        <View style={styles.bars}>
          {data.slice(-10).map((item, index) => {
            const normalizedHeight =
              priceRange > 0
                ? ((item.close - minPrice) / priceRange) * 100
                : 50; // Default to middle if no range

            const previousPrice =
              index > 0 ? data[data.length - 10 + index - 1].close : item.close;
            const barColor = getChangeColor(item.close, previousPrice);

            return (
              <View key={`${item.date}-${index}`} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(normalizedHeight, 5)}%`, // Minimum 5% height for visibility
                      backgroundColor: barColor,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.barLabel,
                    { color: theme === "dark" ? "#999" : COLORS.secondary },
                  ]}
                >
                  {new Date(item.date).getDate()}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme === "dark" ? "#ccc" : COLORS.secondary },
              ]}
            >
              High
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme === "dark" ? "#fff" : COLORS.text },
              ]}
            >
              {formatPrice(maxPrice)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme === "dark" ? "#ccc" : COLORS.secondary },
              ]}
            >
              Low
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme === "dark" ? "#fff" : COLORS.text },
              ]}
            >
              {formatPrice(minPrice)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme === "dark" ? "#ccc" : COLORS.secondary },
              ]}
            >
              Latest
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme === "dark" ? "#fff" : COLORS.text },
              ]}
            >
              {formatPrice(prices[prices.length - 1])}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: SIZES.padding / 2,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin / 2,
    textAlign: "center",
  },
  chart: {
    flex: 1,
    borderRadius: 12,
    padding: SIZES.padding,
    position: "relative",
  },
  emptyChart: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  priceLabels: {
    position: "absolute",
    left: SIZES.padding / 2,
    top: SIZES.padding,
    bottom: 60, // Leave space for summary
    justifyContent: "space-between",
    zIndex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 40, // Space for summary
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    height: "80%", // Leave space for labels
  },
  bar: {
    width: "60%",
    borderRadius: 2,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 8,
    fontFamily: FONTS.regular,
    marginTop: 4,
    textAlign: "center",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: SIZES.padding / 2,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    marginTop: SIZES.padding / 2,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});

export default StockChart;
