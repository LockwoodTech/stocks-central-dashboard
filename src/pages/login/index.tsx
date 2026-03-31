import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [payload, setPayload] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ payload, password });
      setAuth(
        {
          _id: data._id,
          id: data.id ?? data._id,
          full_name: data.full_name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          language: data.language,
          category: data.category,
          role: data.role,
          status: data.status,
          dseLinked: data.dseLinked,
        },
        data.token,
      );
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">DSE Tracker</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Track your DSE
            <br />
            portfolio in
            <br />
            real-time
          </h1>
          <p className="max-w-sm text-gray-400">
            Monitor your Dar es Salaam Stock Exchange investments, set price alerts, and make
            informed trading decisions with live market data.
          </p>

          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold text-gain">28+</p>
              <p className="text-sm text-gray-400">Listed Companies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Live</p>
              <p className="text-sm text-gray-400">Market Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">SMS</p>
              <p className="text-sm text-gray-400">Price Alerts</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DSE Tracker. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center bg-white px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DSE Tracker</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">
              Use your DSE account credentials to sign in
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email or Phone Number"
              type="text"
              placeholder="Enter email or phone"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              required
              autoComplete="username"
            />

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Your credentials are securely transmitted and never stored in plain text.
          </p>
        </div>
      </div>
    </div>
  );
}
