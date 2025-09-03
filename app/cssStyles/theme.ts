// Theme and style constants for StockTrackr

export const COLORS = {
  primary: "#2563eb", // Blue for primary actions
  secondary: "#1e40af", // Darker blue
  background: "#fff",
  card: "#f9f9f9", // Card background color
  text: "#1e1e1e",
  inputBg: "#f5f5f5",
  border: "#e0e0e0",

  // Stock-specific colors
  profit: "#16a34a", // Green for gains/positive values
  loss: "#dc2626", // Red for losses/negative values
  neutral: "#6b7280", // Gray for neutral/no change

  // Chart colors
  chartLine: "#2563eb",
  chartGrid: "#e5e7eb",
  chartBackground: "#f8fafc",

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

export const SIZES = {
  padding: 16,
  margin: 16,
  borderRadius: 10,
  inputHeight: 48,

  // Stock-specific sizes
  cardPadding: 12,
  chartHeight: 200,
  priceTextSize: 18,
  tickerTextSize: 14,
};

export const FONTS = {
  regular: "Roboto",
  bold: "Roboto-Bold",

  // Stock-specific font weights
  medium: "Roboto-Medium",
  light: "Roboto-Light",
};
