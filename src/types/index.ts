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
  csdAccount?: string;
  nin?: string;
  investorProfile?: InvestorProfile;
  onboardingComplete?: boolean;
  subscriptionTier?: SubscriptionTier;
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
  csdAccount?: string;
  nin?: string;
  investorProfile?: InvestorProfile;
  onboardingComplete?: boolean;
  subscriptionTier?: SubscriptionTier;
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

export interface DseInvestorProfile {
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
  repeatInterval?: number;
  lowPrice?: number;
  highPrice?: number;
}

// ── SMS Credits ──
export interface SmsCreditPackage {
  package: string;
  credits: number;
  priceTzs: number;
  label: string;
}

export interface SmsCreditBalance {
  credits: number;
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
  goalPrice?: number;
  goalShares?: number;
  goalValue?: number;
  wac?: number;
  realisedGain?: number;
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

// ── Transactions (WAC / Trade Verification) ──
export interface Transaction {
  _id: string;
  id: string;
  transaction_id: string;
  owner: string;
  company: string;
  company_id?: string;
  type: 'buy' | 'sell';
  source: 'dse' | 'broker' | 'manual';
  assetType: 'stock' | 'fund';
  fund?: string;
  units?: number;
  navPerUnit?: number;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  brokerage: number;
  netAmount: number;
  contractNote?: string;
  brokerName?: string;
  executionDate: string;
  wacAtTransaction?: number;
  realisedGain?: number;
  orderRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  company: string;
  type: 'buy' | 'sell';
  source?: 'dse' | 'broker' | 'manual';
  assetType?: 'stock' | 'fund';
  fund?: string;
  units?: number;
  navPerUnit?: number;
  shares: number;
  pricePerShare: number;
  brokerage?: number;
  contractNote?: string;
  brokerName?: string;
  executionDate: string;
  notes?: string;
}

export interface WacSummary {
  company: string;
  totalShares: number;
  wac: number;
  totalInvested: number;
  realisedGain: number;
  transactionCount: number;
}

export interface TradeVerification {
  company: string;
  summary: {
    dseNetShares: number;
    brokerNetShares: number;
    manualNetShares: number;
    totalNetShares: number;
    discrepancy: number;
  };
  dseTrades: Transaction[];
  brokerTrades: Transaction[];
  manualTrades: Transaction[];
}

// ── Chart Data ──
export interface PricePoint {
  date: string;
  price: number;
}

// ── Live Prices ──
export interface LivePrice {
  company: string;
  price: number;
  change: number;
  changePercent: number;
  fetchedAt: string;
}

// ── Market Movers ──
export interface MarketMover {
  company: string;
  fullName: string;
  closingPrice: number;
  prevClose: number;
  changePercent: number;
  volume: number;
  tradeDate: string;
}

export interface MarketMovers {
  gainers: MarketMover[];
  losers: MarketMover[];
  mostActive: MarketMover[];
}

// ── Fund Types ──
export interface FundProfile {
  _id: string;
  id: string;
  fund_id: string;
  name: string;
  fullName: string;
  logo: string;
  issued_by: string;
  currency: string;
  country: string;
}

export interface FundNAV {
  id: string;
  date: string;
  netAssetValue: number;
  outStandingUnits: number;
  navPerUnit: number;
  salePricePerUnit: number;
  repurchasePricePerUnit: number;
  fundName: string;
}

export interface FundPortfolioEntry {
  _id: string;
  id: string;
  fund: string;
  type: string;
  units: number;
  avgCost: number;
  currentNAV: number;
  invested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// ── Financial Goals ──
export interface FinancialGoal {
  _id: string;
  id: string;
  type: 'Fund' | 'Shares';
  name: string;
  status: string;
  timeRemaining?: string;
  progressPercent: number;
  currency: string;
  currentAmount: number;
  targetAmount: number;
  monthlyAverage: number;
  monthlyTarget: number;
  monthlySavingsRequired: number;
  projection: {
    expectedFinalAmount: number;
    shortfall: number;
  };
  fundDetails?: {
    currentPriceTZS: number;
    unitsNeeded: number;
    estimatedCostRemainingTZS: number;
    targetReturnPercent: number;
  };
  stockDetails?: {
    currentPriceTZS: number;
    sharesNeeded: number;
    estimatedCostRemainingTZS: number;
    targetReturnPercent: number;
  };
  currentShares: number;
  targetShares: number;
  monthlyAverageTZS?: number;
  monthlyTargetTZS?: number;
  startDate?: string;
  targetDate?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  type: 'Fund' | 'Shares';
  name: string;
  targetAmount?: number;
  targetShares?: number;
  monthlyTarget: number;
  startDate: string;
  targetDate: string;
  expectedReturnPercent?: number;
}

// ── DSE Cost Breakdown ──
export interface DseCostBreakdown {
  grossConsideration: number;
  brokerage: number;
  brokerageRate: number;
  vat: number;
  dseFee: number;
  cmsaFee: number;
  fidelityFee: number;
  cdsFee: number;
  totalCharges: number;
  netAmount: number;
}

// ── Investor Profile ──
export type InvestorExperience = 'beginner' | 'little' | 'experienced' | 'professional';
export type InvestorGoal = 'long-term-growth' | 'save-for-something' | 'income' | 'active-trading';
export type CheckFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely';
export type PrimaryInterest = 'analytics' | 'market-movers' | 'goals' | 'trading';
export type ProfileType = 'casual' | 'growth' | 'active';

export interface InvestorProfile {
  experience: InvestorExperience;
  mainGoal: InvestorGoal;
  checkFrequency: CheckFrequency;
  primaryInterest: PrimaryInterest;
  profileType: ProfileType;
}

// ── Subscription ──
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'annual';

export interface Subscription {
  _id: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  startDate: string;
  endDate: string;
  pricePerMonth: number;
}

export interface PricingTier {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

// ── Registration ──
export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  phoneNumber: string;
  referredBy?: string;
}

// ── Contact ──
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
}

// ── Referral ──
export interface ReferralCode {
  code: string;
  link: string;
}

export interface ReferralReferredUser {
  name: string;
  date: string;
  subscribed: boolean;
}

export interface ReferralStats {
  referralCode: string;
  referralCount: number;
  totalCreditsEarned: number;
  referrals: ReferralReferredUser[];
}
