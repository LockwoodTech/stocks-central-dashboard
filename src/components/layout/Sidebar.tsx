import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Star,
  Bell,
  Briefcase,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth';
import { useDseHoldings } from '@/hooks/usePortfolio';
import { formatCurrencyShort } from '@/utils/format';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trade', label: 'Trade', icon: ArrowLeftRight },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { data: holdings } = useDseHoldings();

  const totalValue = holdings?.reduce((sum, h) => sum + (h.marketValue ?? 0), 0) ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">DSE Tracker</span>
      </div>

      {/* Portfolio Value Card */}
      <div className="mx-4 mb-6 rounded-xl bg-gradient-to-br from-emerald-900/80 to-sidebar-active p-4">
        <p className="mb-1 text-xs font-medium text-gray-400">Portfolio Value</p>
        <p className="text-xl font-bold text-white">
          {totalValue > 0 ? formatCurrencyShort(totalValue) : 'TZS --'}
        </p>
        {user?.full_name && (
          <p className="mt-1 text-xs text-gray-400">{user.full_name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-sidebar-hover hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
