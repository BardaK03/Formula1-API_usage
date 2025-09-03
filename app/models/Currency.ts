// Currency models for currency conversion feature
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbol_native: string;
}

// Exchange rate model for currency conversion
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

// Supported currencies for the app
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    symbol_native: "$",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    symbol_native: "€",
  },
  {
    code: "RON",
    name: "Romanian Leu",
    symbol: "RON",
    symbol_native: "lei",
  },
];
