import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import OnboardingPage from '@/pages/onboarding';
import PricingPage from '@/pages/pricing';
import FAQPage from '@/pages/faq';
import ContactPage from '@/pages/contact';
import TermsPage from '@/pages/terms';
import PrivacyPage from '@/pages/privacy';
import DashboardPage from '@/pages/dashboard';
import TradePage from '@/pages/trade';
import WatchlistPage from '@/pages/watchlist';
import AlertsPage from '@/pages/alerts';
import PortfolioPage from '@/pages/portfolio';
import StockDetailPage from '@/pages/stock-detail';
import ProfilePage from '@/pages/profile';
import { useAuthStore } from '@/store/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RedirectHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RedirectHome />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected: onboarding (no layout) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute skipOnboardingCheck>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected: app routes (with layout) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/app/dashboard" element={<DashboardPage />} />
            <Route path="/app/trade" element={<TradePage />} />
            <Route path="/app/watchlist" element={<WatchlistPage />} />
            <Route path="/app/alerts" element={<AlertsPage />} />
            <Route path="/app/portfolio" element={<PortfolioPage />} />
            <Route path="/app/stock/:ticker" element={<StockDetailPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/trade" element={<Navigate to="/app/trade" replace />} />
          <Route path="/watchlist" element={<Navigate to="/app/watchlist" replace />} />
          <Route path="/alerts" element={<Navigate to="/app/alerts" replace />} />
          <Route path="/portfolio" element={<Navigate to="/app/portfolio" replace />} />
          <Route path="/stock/:ticker" element={<Navigate to="/app/stock/:ticker" replace />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
