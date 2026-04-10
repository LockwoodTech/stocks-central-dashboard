import apiClient from './client';
import type {
  ApiResponse,
  CompanyProfile,
  StockPortfolioEntry,
  AddTransactionRequest,
  CompanyOrderBook,
  CompanyMarket,
  MarketMovers,
} from '@/types';

export async function getCompanies(): Promise<CompanyProfile[]> {
  const response = await apiClient.get<ApiResponse<CompanyProfile[]>>('/companies');
  return response.data.data ?? [];
}

export async function getStockPortfolio(): Promise<StockPortfolioEntry[]> {
  const response = await apiClient.get<ApiResponse<StockPortfolioEntry[]>>('/stock-portfolio');
  return response.data.data ?? [];
}

export async function addTransaction(data: AddTransactionRequest): Promise<StockPortfolioEntry> {
  const response = await apiClient.post<ApiResponse<StockPortfolioEntry>>(
    '/stock-portfolio/transaction',
    data,
  );
  return response.data.data;
}

export async function getOrderBook(companyId: string): Promise<CompanyOrderBook> {
  const response = await apiClient.get<ApiResponse<CompanyOrderBook>>(`/order-book/company/${companyId}`);
  return response.data.data;
}

export async function getMarketData(companyId: string, days = 90): Promise<CompanyMarket[]> {
  const response = await apiClient.get<ApiResponse<CompanyMarket[]>>(`/market-data/company/${companyId}?days=${days}`);
  return response.data.data ?? [];
}

export async function getMarketMovers(): Promise<MarketMovers> {
  const response = await apiClient.get<ApiResponse<MarketMovers>>('/market-data/movers');
  return response.data.data ?? { gainers: [], losers: [], mostActive: [] };
}
