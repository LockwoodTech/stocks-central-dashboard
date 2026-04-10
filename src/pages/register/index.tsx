import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Gift } from 'lucide-react';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const data = await register({ full_name: fullName, email, password, phoneNumber, ...(refCode ? { referredBy: refCode } : {}) });
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
          investorProfile: data.investorProfile,
          onboardingComplete: data.onboardingComplete,
          subscriptionTier: data.subscriptionTier,
        },
        data.token,
      );
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string; description?: string }; status?: number };
        message?: string;
      };
      const resp = axiosErr?.response?.data;
      const message =
        resp?.error || resp?.description || resp?.message || axiosErr?.message || 'Registration failed. Please try again.';
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
            <span className="text-xl font-bold">Stocks Central</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Track your
            <br />
            investments in
            <br />
            real-time
          </h1>
          <p className="max-w-sm text-gray-400">
            Monitor your stocks, funds, and ETFs. Set price alerts and make
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
          &copy; {new Date().getFullYear()} Stocks Central. All rights reserved.
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
            <span className="text-xl font-bold text-gray-900">Stocks Central</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Get started with Stocks Central to monitor your investments
            </p>
          </div>

          {refCode && (
            <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <Gift className="h-5 w-5 text-gray-700 shrink-0" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Referred by a friend</span> — you'll get 1 month free on your first subscription!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="255XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              autoComplete="tel"
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
                  autoComplete="new-password"
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

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-gray-600 underline hover:text-gray-900">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-gray-600 underline hover:text-gray-900">Privacy Policy</Link>.
            </p>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
