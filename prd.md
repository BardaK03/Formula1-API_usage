# 📄 Product Requirements Document (PRD)

## 1. Overview

**Product Name (placeholder):** StockTrackr Mobile
**Description:**
A **React Native mobile app** for tracking stock prices, viewing historical charts, and saving favorites for offline access. Data syncs **twice daily** (morning & evening) due to the free Marketstack API plan limit (100 calls/month).
take api info from this page https://marketstack.com/documentation_v2

---

## 2. Goals & Objectives

- Give users a **lightweight stock tracker** that works even offline.
- Make it easy to **search, view, and favorite stocks**.
- Ensure data remains **usable with limited API calls**.
- Deliver a **clean mobile-first UI/UX**.

## 4. Key Features

### 4.1 Core Screens

1. **Homepage**

   - Shows **top 20 stocks by Market Cap**.
   - Pull-to-refresh → syncs only if morning/evening update is available.
   - Navigation bar (Search, Favorites, Settings).

2. **Authentication**

   - Sign up / Login with email + password via firebase

3. **Search**

   - Search stocks by **ticker **.
   - Results limited by API availability.

4. **Stock Detail Screen**

   - Stock name, ticker, and current price.
   - Historical price chart (last X days, depending on API).
   - Button: **Add to Favorites**.

5. **Favorites**

   - List of saved stocks.
   - Data stored **offline** (SQLite or AsyncStorage).
   - Works fully offline → shows last synced data.

6. **Settings**
   - \*\* dark mode on/off
   - **Currency selector (EUR, USD, RON)** → conversion done client-side with cached FX rates.

---

## 5. Technical Requirements

### 5.1 Mobile App Stack

- **Frontend:** React Native + Expo
- **Navigation:** React Navigation
- **Offline storage:** SQLite (expo-sqlite) or AsyncStorage
- **Auth:** Firebase Auth

### 5.2 API Usage (Marketstack)

- **Endpoints:**

  - `/tickers` → stock list
  - `/eod` → historical data

- **Sync policy:** 1 API call/day

### 5.3 Offline Mode

- Favorites cached locally.
- App shows **last synced data** when offline.
- Sync occurs **once a day** automatically.

---

## 6. User Flow

1. **New User:**

   - Opens app → sees homepage with top 20 stocks.
   - Can search stocks.
   - To save favorites → must register/login.

2. **Returning User:**

   - Login → sees homepage.
   - Can view details, add to favorites.
   - Favorites available **even if no internet**.

---
