import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExchangeRate, SUPPORTED_CURRENCIES } from "../models/Currency";
import { getCachedData, setCachedData } from "./cache";

// Free exchange rate API (we'll use a simple service)
const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
const CACHE_KEY_RATES = "exchangeRates";
const CACHE_KEY_USER_CURRENCY = "userCurrency";

// Default currency
const DEFAULT_CURRENCY = "USD";

// Get user's selected currency
export const getUserCurrency = async (): Promise<string> => {
  try {
    const currency = await AsyncStorage.getItem(CACHE_KEY_USER_CURRENCY);
    return currency || DEFAULT_CURRENCY;
  } catch (error) {
    console.error("Error getting user currency:", error);
    return DEFAULT_CURRENCY;
  }
};

// Set user's selected currency
export const setUserCurrency = async (currency: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY_USER_CURRENCY, currency);
  } catch (error) {
    console.error("Error setting user currency:", error);
  }
};

// Get exchange rates (cached for 24 hours)
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  const cached = await getCachedData(CACHE_KEY_RATES);
  if (cached) return cached;

  try {
    const response = await fetch(EXCHANGE_API_URL);
    const data = await response.json();

    if (data.rates) {
      await setCachedData(CACHE_KEY_RATES, data.rates);
      return data.rates;
    }

    throw new Error("Invalid exchange rate data");
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return fallback rates if API fails
    return {
      USD: 1,
      EUR: 0.85,
      RON: 4.5,
    };
  }
};

// Convert price from USD to target currency
export const convertPrice = async (
  priceUSD: number,
  targetCurrency: string = "USD"
): Promise<number> => {
  if (targetCurrency === "USD") return priceUSD;

  try {
    const rates = await getExchangeRates();
    const rate = rates[targetCurrency];

    if (!rate) {
      console.warn(`Exchange rate not found for ${targetCurrency}, using USD`);
      return priceUSD;
    }

    return priceUSD * rate;
  } catch (error) {
    console.error("Error converting price:", error);
    return priceUSD;
  }
};

// Format price with currency symbol
export const formatPrice = async (
  price: number,
  currency?: string
): Promise<string> => {
  const userCurrency = currency || (await getUserCurrency());
  const convertedPrice = await convertPrice(price, userCurrency);

  const supportedCurrency = SUPPORTED_CURRENCIES.find(
    (c) => c.code === userCurrency
  );
  const symbol = supportedCurrency?.symbol || userCurrency;

  return `${symbol}${convertedPrice.toFixed(2)}`;
};

// Get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  const supportedCurrency = SUPPORTED_CURRENCIES.find(
    (c) => c.code === currency
  );
  return supportedCurrency?.symbol || currency;
};

// Format percentage change
export const formatPercentageChange = (change: number): string => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
};

// Calculate price change
export const calculatePriceChange = (
  currentPrice: number,
  previousPrice: number
): {
  change: number;
  changePercent: number;
  isPositive: boolean;
} => {
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};
