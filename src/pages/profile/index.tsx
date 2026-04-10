import { useState, type FormEvent } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Shield,
  CreditCard,
  Link2,
  Unlink,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  LogOut,
  Fingerprint,
  Hash,
  ArrowLeft,
  MessageSquare,
  Gift,
  Copy,
  Share2,
  Users,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { updatePersonalInfo, changePassword, linkDse, unlinkDse } from '@/api/auth';
import { useSmsBalance, useSmsPackages, usePurchaseSmsCredits } from '@/hooks/useSmsCredits';
import { useReferralCode, useReferralStats } from '@/hooks/useReferral';
import { useNavigate } from 'react-router-dom';

/* ─── Profile Type Labels ───────────────────────────────────────── */

const profileTypeLabels: Record<string, { label: string; variant: 'info' | 'gain' | 'warning' }> = {
  casual: { label: 'Casual Investor', variant: 'info' },
  growth: { label: 'Growth Investor', variant: 'gain' },
  active: { label: 'Active Trader', variant: 'warning' },
};

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-muted-foreground' },
  basic: { label: 'Basic', color: 'text-primary' },
  pro: { label: 'Pro', color: 'text-gain' },
  premium: { label: 'Premium', color: 'text-amber-500' },
};

/* ─── Section Component ─────────────────────────────────────────── */

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="scroll-mt-6">
      {children}
    </div>
  );
}

/* ─── Profile Page ──────────────────────────────────────────────── */

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setDseLinked = useAuthStore((s) => s.setDseLinked);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Personal info form
  const [editingInfo, setEditingInfo] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // DSE link form
  const [dseUsername, setDseUsername] = useState('');
  const [dsePassword, setDsePassword] = useState('');
  const [showDsePassword, setShowDsePassword] = useState(false);
  const [dseLoading, setDseLoading] = useState(false);
  const [dseError, setDseError] = useState('');
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoSuccess(false);
    try {
      await updatePersonalInfo({ full_name: fullName, email, phoneNumber });
      updateUser({ full_name: fullName, email, phoneNumber });
      setInfoSuccess(true);
      setEditingInfo(false);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch {
      // handled by api client
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    setPwSuccess(false);
    try {
      await changePassword({ oldPassword, newPassword });
      setPwSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch {
      setPwError('Failed to change password. Check your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLinkDse = async (e: FormEvent) => {
    e.preventDefault();
    setDseError('');
    setDseLoading(true);
    try {
      await linkDse({ dseUsername, dsePassword });
      setDseLinked(true);
      setDseUsername('');
      setDsePassword('');
    } catch {
      setDseError('Failed to link DSE account. Check your credentials.');
    } finally {
      setDseLoading(false);
    }
  };

  const handleUnlinkDse = async () => {
    setUnlinkLoading(true);
    try {
      await unlinkDse();
      setDseLinked(false);
    } catch {
      // handled by api client
    } finally {
      setUnlinkLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // SMS Credits
  const { data: smsBalance } = useSmsBalance();
  const { data: smsPackages } = useSmsPackages();
  const purchaseCredits = usePurchaseSmsCredits();

  // Referral
  const { data: referralCode } = useReferralCode();
  const { data: referralStats } = useReferralStats();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (referralCode?.link) {
      navigator.clipboard.writeText(referralCode.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (referralCode?.link) {
      const text = encodeURIComponent(
        `Join me on Stocks Central — track your DSE investments, get live prices & SMS alerts! Sign up here: ${referralCode.link}`,
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const profileInfo = profileTypeLabels[user?.investorProfile?.profileType ?? 'casual'];
  const tierInfo = tierLabels[user?.subscriptionTier ?? 'free'];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, security, and preferences</p>
      </div>

      {/* ── Profile Summary Card ────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {user?.full_name ?? 'User'}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{user?.email ?? ''}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={profileInfo.variant}>{profileInfo.label}</Badge>
              <span className={`text-xs font-semibold ${tierInfo.color}`}>
                {tierInfo.label} Plan
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Personal Information ────────────────────────────────── */}
      <Section id="personal-info">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            {!editingInfo && (
              <Button variant="ghost" size="sm" onClick={() => setEditingInfo(true)}>
                Edit
              </Button>
            )}
          </CardHeader>

          {editingInfo ? (
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" loading={infoLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingInfo(false);
                    setFullName(user?.full_name ?? '');
                    setEmail(user?.email ?? '');
                    setPhoneNumber(user?.phoneNumber ?? '');
                  }}
                >
                  Cancel
                </Button>
                {infoSuccess && (
                  <span className="flex items-center gap-1 text-xs text-gain">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={UserIcon} label="Full Name" value={user?.full_name} />
              <InfoRow icon={Mail} label="Email" value={user?.email} />
              <InfoRow icon={Phone} label="Phone" value={user?.phoneNumber} />
              {infoSuccess && (
                <span className="flex items-center gap-1 text-xs text-gain">
                  <Check className="h-3.5 w-3.5" /> Changes saved successfully
                </span>
              )}
            </div>
          )}
        </Card>
      </Section>

      {/* ── DSE Account ────────────────────────────────────────── */}
      <Section id="dse-account">
        <Card>
          <CardHeader>
            <CardTitle>DSE Account</CardTitle>
            {user?.dseLinked ? (
              <Badge variant="gain">Linked</Badge>
            ) : (
              <Badge variant="neutral">Not Linked</Badge>
            )}
          </CardHeader>

          {user?.dseLinked ? (
            <div className="space-y-4">
              {user.csdAccount && (
                <InfoRow icon={Hash} label="CDS Account" value={user.csdAccount} />
              )}
              {user.nin && (
                <InfoRow icon={Fingerprint} label="NIDA Number" value={user.nin} />
              )}
              {!user.csdAccount && !user.nin && (
                <p className="text-sm text-muted-foreground">
                  Your DSE account is linked. Re-login to sync your CDS and NIDA details.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                loading={unlinkLoading}
                onClick={handleUnlinkDse}
              >
                <Unlink className="h-4 w-4" />
                Unlink DSE Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLinkDse} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link your DSE account to view your real portfolio, orders, and investor profile.
              </p>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">DSE Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={dseUsername}
                    onChange={(e) => setDseUsername(e.target.value)}
                    required
                    placeholder="Your DSE login"
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">DSE Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showDsePassword ? 'text' : 'password'}
                    value={dsePassword}
                    onChange={(e) => setDsePassword(e.target.value)}
                    required
                    placeholder="Your DSE password"
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDsePassword(!showDsePassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                  >
                    {showDsePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {dseError && <p className="text-xs text-loss">{dseError}</p>}

              <Button type="submit" size="sm" loading={dseLoading}>
                <Link2 className="h-4 w-4" />
                Link Account
              </Button>
            </form>
          )}
        </Card>
      </Section>

      {/* ── Change Password ────────────────────────────────────── */}
      <Section id="password">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {pwError && <p className="text-xs text-loss">{pwError}</p>}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" size="sm" loading={pwLoading}>
                Update Password
              </Button>
              {pwSuccess && (
                <span className="flex items-center gap-1 text-xs text-gain">
                  <Check className="h-3.5 w-3.5" /> Password updated
                </span>
              )}
            </div>
          </form>
        </Card>
      </Section>

      {/* ── Subscription ───────────────────────────────────────── */}
      <Section id="subscription">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Current Plan</p>
                <p className={`text-lg font-bold ${tierInfo.color}`}>{tierInfo.label}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                {user?.subscriptionTier === 'premium' ? 'Manage' : 'Upgrade'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── SMS Credits ──────────────────────────────────────── */}
      <Section id="sms-credits">
        <Card>
          <CardHeader>
            <CardTitle>SMS Credits</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Available Credits</p>
                <p className="text-2xl font-bold text-foreground">{smsBalance?.credits ?? 0}</p>
              </div>
              <p className="text-xs text-muted-foreground max-w-[140px] text-right">
                1 credit = 1 SMS alert. Top up anytime via M-Pesa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {smsPackages?.map((pkg) => (
                <button
                  key={pkg.package}
                  onClick={() => purchaseCredits.mutate(pkg.package)}
                  disabled={purchaseCredits.isPending}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  <span className="text-lg font-bold text-foreground">{pkg.credits}</span>
                  <span className="text-xs text-muted-foreground">SMS credits</span>
                  <span className="mt-1 text-sm font-semibold text-primary">
                    TZS {pkg.priceTzs.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            {purchaseCredits.isSuccess && (
              <p className="flex items-center gap-1 text-xs text-gain">
                <Check className="h-3.5 w-3.5" /> Credits added successfully
              </p>
            )}
          </div>
        </Card>
      </Section>

      {/* ── Invite Friends ───────────────────────────────────── */}
      <Section id="referral">
        <Card>
          <CardHeader>
            <CardTitle>Invite Friends</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your referral link. When your friend subscribes, you get <span className="font-semibold text-foreground">500 SMS credits</span> and they get <span className="font-semibold text-foreground">1 month free</span>.
            </p>

            {referralCode?.code && (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-muted px-4 py-2.5 font-mono text-sm font-semibold text-foreground">
                    {referralCode.code}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="flex-1">
                    <Share2 className="h-4 w-4" />
                    Share via WhatsApp
                  </Button>
                </div>
              </>
            )}

            {referralStats && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{referralStats.referralCount}</p>
                  <p className="text-xs text-muted-foreground">Invites</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {referralStats.referrals?.filter((r) => r.subscribed).length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{referralStats.totalCreditsEarned}</p>
                  <p className="text-xs text-muted-foreground">Credits Earned</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Section>

      {/* ── Investor Profile ───────────────────────────────────── */}
      <Section id="investor-profile">
        <Card>
          <CardHeader>
            <CardTitle>Investor Profile</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          {user?.investorProfile ? (
            <div className="space-y-3">
              <ProfileRow
                label="Experience"
                value={capitalize(user.investorProfile.experience)}
              />
              <ProfileRow
                label="Main Goal"
                value={goalLabel(user.investorProfile.mainGoal)}
              />
              <ProfileRow
                label="Check Frequency"
                value={capitalize(user.investorProfile.checkFrequency)}
              />
              <ProfileRow
                label="Primary Interest"
                value={capitalize(user.investorProfile.primaryInterest)}
              />
              <ProfileRow
                label="Profile Type"
                value={profileInfo.label}
              />
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                >
                  Retake Profile Quiz
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Complete the investor profile quiz to get a personalized experience.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/onboarding')}
              >
                Complete Profile
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </Section>

      {/* ── Preferences ────────────────────────────────────────── */}
      <Section id="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground">
                  {theme === 'light' ? 'Light mode' : 'Dark mode'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-muted)' }}
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Sign Out ───────────────────────────────────────────── */}
      <Card>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-loss hover:opacity-80 transition-opacity"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </Card>

      {/* Bottom spacing for mobile tab bar */}
      <div className="h-4" />
    </div>
  );
}

/* ─── Helper Components ─────────────────────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || '--'}</p>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────── */

function capitalize(s?: string) {
  if (!s) return '--';
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

function goalLabel(goal?: string) {
  const labels: Record<string, string> = {
    'long-term-growth': 'Long-term Growth',
    'save-for-something': 'Save for Something',
    income: 'Generate Income',
    'active-trading': 'Active Trading',
  };
  return labels[goal ?? ''] ?? '--';
}
