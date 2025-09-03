// Stock data model based on Marketstack API response structure
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_open: number;
  adj_high: number;
  adj_low: number;
  adj_close: number;
  adj_volume: number;
  split_factor: number;
  dividend: number;
  date: string;
}

// Ticker model for search functionality
export interface Ticker {
  name: string;
  symbol: string;
  stock_exchange: {
    name: string;
    acronym: string;
    mic: string;
    country: string;
    country_code: string;
    city: string;
    website: string;
  };
}

// Historical price data model
export interface HistoricalData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
  symbol: string;
  exchange: string;
  date: string;
}

// Exchange information model
export interface Exchange {
  name: string;
  acronym: string;
  mic: string;
  country: string;
  country_code: string;
  city: string;
  website: string;
  timezone: {
    timezone: string;
    abbr: string;
    abbr_dst: string;
  };
}

// API Response wrapper models
export interface MarketstackResponse<T> {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: T[];
}

// Stock price change calculation
export interface StockWithChange extends Stock {
  priceChange: number;
  priceChangePercent: number;
  isPositive: boolean;
}
