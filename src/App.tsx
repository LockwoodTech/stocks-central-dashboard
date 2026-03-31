import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import TradePage from '@/pages/trade';
import WatchlistPage from '@/pages/watchlist';
import AlertsPage from '@/pages/alerts';
import PortfolioPage from '@/pages/portfolio';
import StockDetailPage from '@/pages/stock-detail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/stock/:ticker" element={<StockDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
