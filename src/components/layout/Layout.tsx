import { Outlet } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/auth';

export default function Layout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks, tickers..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-loss" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name ?? 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email ?? ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
