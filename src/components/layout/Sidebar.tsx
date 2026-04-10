import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Star,
  Bell,
  Briefcase,
  LogOut,
  TrendingUp,
  Sun,
  Moon,
  UserCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useDseHoldings } from '@/hooks/usePortfolio';
import { formatCurrencyShort } from '@/utils/format';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/trade', label: 'Trade', icon: ArrowLeftRight },
  { to: '/app/watchlist', label: 'Watchlist', icon: Star },
  { to: '/app/alerts', label: 'Alerts', icon: Bell },
  { to: '/app/portfolio', label: 'Portfolio', icon: Briefcase },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const { data: holdings } = useDseHoldings();

  const totalValue = holdings?.reduce((sum, h) => sum + (h.marketValue ?? 0), 0) ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-sidebar-bg text-sidebar-fg">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Stocks Central</span>
        </div>

        {/* Portfolio Value Card */}
        <div className="mx-4 mb-6 rounded-xl bg-sidebar-active p-4">
          <p className="mb-1 text-xs font-medium text-sidebar-fg/60">Portfolio Value</p>
          <p className="text-xl font-bold text-sidebar-fg">
            {totalValue > 0 ? formatCurrencyShort(totalValue) : 'TZS --'}
          </p>
          {user?.full_name && (
            <p className="mt-1 text-xs text-sidebar-fg/60">{user.full_name}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/dashboard'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-fg'
                    : 'text-sidebar-fg/60 hover:bg-sidebar-hover hover:text-sidebar-fg',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-fg/10 px-3 py-4 space-y-1">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-sidebar-fg'
                  : 'text-sidebar-fg/60 hover:bg-sidebar-hover hover:text-sidebar-fg',
              )
            }
          >
            <UserCircle className="h-5 w-5" />
            Profile
          </NavLink>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-fg/60 transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-fg/60 transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app/dashboard'}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
