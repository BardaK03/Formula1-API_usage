import { getCachedData, setCachedData, isFreshData } from "./cache";
import {
  Stock,
  Ticker,
  MarketstackResponse,
  Exchange,
  HistoricalData,
} from "../models/Stock";

// API Configuration
const API_KEY =
  process.env.MARKETSTACK_API_KEY || "0a5e7b5f537de0e6869af7b4794e6181";
const BASE_URL = "https://api.marketstack.com/v1";

// Rate limiting - Marketstack allows 5 requests/second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const makeApiRequest = async (
  endpoint: string,
  params: Record<string, string> = {}
) => {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  // Build URL with parameters
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("access_key", API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  lastRequestTime = Date.now();

  console.log(`API Request: ${url.toString()}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Marketstack API Error: ${data.error.message}`);
  }

  return data;
};

// Get popular stocks (using Apple, Microsoft, Google, Amazon, Tesla as examples)
export async function getPopularStocks(
  forceRefresh: boolean = false
): Promise<Stock[]> {
  const CACHE_KEY = "popularStocks";

  // Check for cached data unless force refresh is requested
  if (!forceRefresh) {
    const cached = await getCachedData(CACHE_KEY);
    if (cached) {
      console.log(" Popular stocks loaded from cache");
      return cached;
    }
  }

  try {
    console.log("📡 Fetching popular stocks from API");
    const symbols = [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "TSLA",
      "NVDA",
      "META",
      "NFLX",
      "BABA",
      "V",
    ];

    const data: MarketstackResponse<Stock> = await makeApiRequest(
      "/eod/latest",
      {
        symbols: symbols.join(","),
        limit: "10",
      }
    );

    const stocks = data.data || [];
    await setCachedData(CACHE_KEY, stocks);
    console.log(`✅ Cached ${stocks.length} popular stocks`);
    return stocks;
  } catch (error) {
    console.error("Error fetching popular stocks:", error);

    // Try to return stale cache if available
    const staleCache = await getCachedData(CACHE_KEY);
    if (staleCache) {
      console.log("⚠️ Returning stale cache due to API error");
      return staleCache;
    }

    throw error;
  }
}

// Get multiple stock prices efficiently (batch operation)
export async function getMultipleStockPrices(
  symbols: string[],
  forceRefresh: boolean = false
): Promise<Stock[]> {
  if (symbols.length === 0) return [];

  const results: Stock[] = [];
  const uncachedSymbols: string[] = [];

  // First, check cache for each symbol
  if (!forceRefresh) {
    for (const symbol of symbols) {
      const CACHE_KEY = `stock_${symbol}`;
      const cached = await getCachedData(CACHE_KEY);
      if (cached) {
        results.push(cached);
        console.log(` Stock ${symbol} loaded from cache`);
      } else {
        uncachedSymbols.push(symbol);
      }
    }
  } else {
    uncachedSymbols.push(...symbols);
  }

  // Fetch uncached symbols in batch
  if (uncachedSymbols.length > 0) {
    try {
      console.log(
        `📡 Batch fetching ${
          uncachedSymbols.length
        } stocks: ${uncachedSymbols.join(", ")}`
      );
      const data: MarketstackResponse<Stock> = await makeApiRequest(
        "/eod/latest",
        {
          symbols: uncachedSymbols.join(","),
          limit: uncachedSymbols.length.toString(),
        }
      );

      const freshStocks = data.data || [];

      // Cache each stock individually
      for (const stock of freshStocks) {
        const CACHE_KEY = `stock_${stock.symbol}`;
        await setCachedData(CACHE_KEY, stock);
        results.push(stock);
      }

      console.log(`✅ Cached ${freshStocks.length} fresh stocks`);
    } catch (error) {
      console.error("Error in batch stock fetch:", error);

      // Try to get stale cache for failed symbols
      for (const symbol of uncachedSymbols) {
        const CACHE_KEY = `stock_${symbol}`;
        const staleCache = await getCachedData(CACHE_KEY);
        if (staleCache) {
          results.push(staleCache);
          console.log(`⚠️ Using stale cache for ${symbol}`);
        }
      }
    }
  }

  // Return results in the same order as requested symbols
  return symbols
    .map((symbol) => results.find((stock) => stock.symbol === symbol))
    .filter(Boolean) as Stock[];
}

// Get latest stock price
export async function getStockPrice(
  symbol: string,
  forceRefresh: boolean = false
): Promise<Stock> {
  const CACHE_KEY = `stock_${symbol}`;

  // Check for fresh data unless force refresh is requested
  if (!forceRefresh) {
    const cached = await getCachedData(CACHE_KEY);
    if (cached) {
      console.log(` Stock ${symbol} loaded from cache`);
      return cached;
    }
  }

  try {
    console.log(`📡 Fetching ${symbol} from API`);
    const data: MarketstackResponse<Stock> = await makeApiRequest(
      "/eod/latest",
      {
        symbols: symbol,
      }
    );

    if (data.data && data.data.length > 0) {
      const stock = data.data[0];
      await setCachedData(CACHE_KEY, stock);
      console.log(`✅ Cached stock ${symbol}`);
      return stock;
    }

    throw new Error("Stock not found");
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);

    // Try to return stale cache if available
    const staleCache = await getCachedData(CACHE_KEY);
    if (staleCache) {
      console.log(`⚠️ Returning stale cache for ${symbol} due to API error`);
      return staleCache;
    }

    throw error;
  }
}

// Search stocks by symbol
export async function searchStocks(
  query: string,
  forceRefresh: boolean = false
): Promise<Ticker[]> {
  const CACHE_KEY = `search_${query.toLowerCase()}`;

  // Search results are cached for longer since they don't change often
  if (!forceRefresh) {
    const cached = await getCachedData(CACHE_KEY);
    if (cached) {
      console.log(` Search results for "${query}" loaded from cache`);
      return cached;
    }
  }

  try {
    console.log(`📡 Searching for "${query}" via API`);
    const data: MarketstackResponse<Ticker> = await makeApiRequest("/tickers", {
      search: query,
      limit: "20",
    });

    const tickers = data.data || [];
    await setCachedData(CACHE_KEY, tickers);
    console.log(`✅ Cached ${tickers.length} search results for "${query}"`);
    return tickers;
  } catch (error) {
    console.error(`Error searching stocks for ${query}:`, error);

    // Try to return stale cache if available
    const staleCache = await getCachedData(CACHE_KEY);
    if (staleCache) {
      console.log(
        `⚠️ Returning stale search results for "${query}" due to API error`
      );
      return staleCache;
    }

    throw error;
  }
}

// Get historical data for a stock
export async function getHistoricalData(
  symbol: string,
  days: number = 30
): Promise<HistoricalData[]> {
  const CACHE_KEY = `historical_${symbol}_${days}`;
  const cached = await getCachedData(CACHE_KEY);
  if (cached) return cached;

  try {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - days);

    const data: MarketstackResponse<HistoricalData> = await makeApiRequest(
      "/eod",
      {
        symbols: symbol,
        date_from: fromDate.toISOString().split("T")[0],
        date_to: toDate.toISOString().split("T")[0],
        limit: days.toString(),
      }
    );

    const historicalData = data.data || [];
    await setCachedData(CACHE_KEY, historicalData);
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
}

// Get exchanges
export async function getExchanges(): Promise<Exchange[]> {
  const CACHE_KEY = "exchanges";
  const cached = await getCachedData(CACHE_KEY);
  if (cached) return cached;

  try {
    const data: MarketstackResponse<Exchange> = await makeApiRequest(
      "/exchanges",
      {
        limit: "50",
      }
    );

    const exchanges = data.data || [];
    await setCachedData(CACHE_KEY, exchanges);
    return exchanges;
  } catch (error) {
    console.error("Error fetching exchanges:", error);
    throw error;
  }
}

// Check if market is in sync window (morning 8-10 AM, evening 6-8 PM)
export function isInSyncWindow(): boolean {
  const now = new Date();
  const hour = now.getHours();

  const morningStart = parseInt(process.env.SYNC_MORNING_HOUR || "8");
  const eveningStart = parseInt(process.env.SYNC_EVENING_HOUR || "18");

  return (
    (hour >= morningStart && hour < morningStart + 2) ||
    (hour >= eveningStart && hour < eveningStart + 2)
  );
}

// Get last sync timestamp
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const timestamp = await getCachedData("lastSyncTime");
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
}

// Set last sync timestamp
export async function setLastSyncTime(): Promise<void> {
  try {
    await setCachedData("lastSyncTime", new Date().toISOString());
  } catch (error) {
    console.error("Error setting last sync time:", error);
  }
}

// Check if sync is needed
export async function shouldSync(): Promise<boolean> {
  if (!isInSyncWindow()) return false;

  const lastSync = await getLastSyncTime();
  if (!lastSync) return true;

  const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  return hoursSinceSync >= 12; // Sync twice daily
}
