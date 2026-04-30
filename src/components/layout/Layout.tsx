import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, X, ArrowRight } from 'lucide-react';
import Sidebar from './Sidebar';
import TickerBar from './TickerBar';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const showProfileBanner = !bannerDismissed && !user?.investorProfile?.profileType;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Live Ticker */}
        <TickerBar />

        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-loss" />
            </button>

            <button
              onClick={() => navigate('/app/profile')}
              className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-foreground">{user?.full_name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Profile Setup Banner */}
        {showProfileBanner && (
          <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/5 px-4 py-2.5 md:px-6">
            <p className="flex-1 text-sm text-foreground">
              <span className="font-medium">Complete your investor profile</span>
              <span className="hidden sm:inline text-muted-foreground"> — get a personalized experience tailored to your investment style</span>
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Set up
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
