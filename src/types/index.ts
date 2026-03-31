// ── API Response Wrapper ──
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ── Auth / User ──
export interface User {
  _id: string;
  id: string;
  full_name: string;
  email: string;
  phoneNumber: string;
  language: 'en' | 'sw';
  category: string;
  role: string;
  status: string;
  dseLinked: boolean;
  avatar_url?: string;
  token?: string;
}

export interface LoginRequest {
  payload: string; // email or phone
  password: string;
}

export interface LoginResponse {
  token: string;
  _id: string;
  id: string;
  full_name: string;
  email: string;
  phoneNumber: string;
  language: 'en' | 'sw';
  category: string;
  role: string;
  status: string;
  dseLinked: boolean;
}

export interface LinkDseRequest {
  dseUsername: string;
  dsePassword: string;
}

export interface LinkDseResponse {
  dseLinked: boolean;
  csdAccount: string;
  investorName: string;
  brokers: DseBroker[];
}

export interface DseBroker {
  id: number;
  name: string;
  code?: string;
}

// ── Portfolio / Holdings ──
export interface DseHolding {
  company: {
    id: number;
    symbol: string;
    name: string;
    sector?: string;
  };
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  volume?: number;
  bid?: number;
  ask?: number;
}

export interface DseOrder {
  id: number;
  security: {
    id: number;
    symbol: string;
    name: string;
  };
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: string;
  controlNumber?: string;
  commission?: number;
  orderRef?: string;
  broker?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvestorProfile {
  id: number;
  firstName: string;
  lastName: string;
  csdAccount: string;
  email?: string;
  phone?: string;
  brokers: DseBroker[];
}

export interface ChildAccount {
  id: number;
  csdAccount: string;
  firstName: string;
  lastName: string;
  relationship?: string;
}

// ── Companies / Market Data ──
export interface CompanyProfile {
  _id: string;
  id: string;
  company_id: string;
  company: string;
  fullName: string;
  logo?: string;
  email?: string;
  website?: string;
  description?: string;
  marketSegment?: string;
  country: string;
  type: 'STOCK';
  listed_date?: string;
}

export interface CompanyMarket {
  _id: string;
  id: string;
  trade_date: string;
  company_id: string;
  company: string;
  fullName: string;
  turnover: number;
  volume: number;
  high: number;
  low: number;
  opening_price: number;
  closing_price: number;
  shares_in_issue: number;
  market_cap: number;
}

// ── Order Book ──
export interface OrderEntry {
  buyPrice: number;
  buyQuantity: number;
  sellPrice: number;
  sellQuantity: number;
}

export interface CompanyOrderBook {
  _id: string;
  id: string;
  company_id: string;
  company: string;
  fullName: string;
  sync_timestamp: string;
  bestSellPrice: number;
  bestBuyPrice: number;
  orders: OrderEntry[];
}

// ── Stock Alerts ──
export interface StockAlert {
  _id: string;
  id: string;
  owner: string;
  company: string;
  company_id?: string;
  type: 'buy' | 'sell';
  targetPrice: number;
  lowPrice?: number;
  highPrice?: number;
  volumeThreshold?: number;
  phoneNumber: string;
  checkInterval: number;
  enabled: boolean;
  triggered: boolean;
  triggeredAt?: string | null;
  lastChecked?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertRequest {
  company: string;
  type: 'buy' | 'sell';
  targetPrice: number;
  phoneNumber: string;
  checkInterval?: number;
  lowPrice?: number;
  highPrice?: number;
}

// ── Favorites ──
export interface FavoriteStock {
  _id: string;
  id: string;
  owner: string;
  company: string;
  company_id?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Stock Portfolio (manual/off-platform) ──
export interface StockPortfolioEntry {
  _id: string;
  id: string;
  company: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddTransactionRequest {
  company: string;
  name: string;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
}

// ── Chart Data ──
export interface PricePoint {
  date: string;
  price: number;
}
