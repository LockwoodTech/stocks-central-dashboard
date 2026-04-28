import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Link2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { updateInvestorProfile, linkDse } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import type {
  InvestorExperience,
  InvestorGoal,
  CheckFrequency,
  PrimaryInterest,
  ProfileType,
} from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// ── Step definitions ──

interface StepOption<T extends string> {
  label: string;
  value: T;
}

const experienceOptions: StepOption<InvestorExperience>[] = [
  { label: "I'm just getting started", value: 'beginner' },
  { label: "I've invested a little", value: 'little' },
  { label: "I'm experienced", value: 'experienced' },
  { label: "I'm a professional trader", value: 'professional' },
];

const goalOptions: StepOption<InvestorGoal>[] = [
  { label: 'Grow my wealth long-term', value: 'long-term-growth' },
  { label: 'Save for something specific', value: 'save-for-something' },
  { label: 'Generate regular income', value: 'income' },
  { label: 'Actively trade for gains', value: 'active-trading' },
];

const frequencyOptions: StepOption<CheckFrequency>[] = [
  { label: 'Every day', value: 'daily' },
  { label: 'A few times a week', value: 'weekly' },
  { label: 'About once a month', value: 'monthly' },
  { label: 'Rarely — set and forget', value: 'rarely' },
];

const interestOptions: StepOption<PrimaryInterest>[] = [
  { label: 'Portfolio analytics & charts', value: 'analytics' },
  { label: 'Stock prices & market movers', value: 'market-movers' },
  { label: 'Financial goals & tracking', value: 'goals' },
  { label: 'Order book & trading', value: 'trading' },
];

const profileSteps = [
  { title: "What's your investment experience?", options: experienceOptions },
  { title: "What's your main goal?", options: goalOptions },
  { title: 'How often do you check investments?', options: frequencyOptions },
  { title: 'What interests you most?', options: interestOptions },
] as const;

function deriveProfileType(goal: InvestorGoal, frequency: CheckFrequency): ProfileType {
  if (frequency === 'daily' || goal === 'active-trading') return 'active';
  if (goal === 'long-term-growth' || goal === 'save-for-something') return 'growth';
  return 'casual';
}

// ── DSE Link Step ──

function DseLinkStep({ onDone }: { onDone: () => void }) {
  const setDseLinked = useAuthStore((s) => s.setDseLinked);
  const [dseUsername, setDseUsername] = useState('');
  const [dsePassword, setDsePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState(false);

  const handleLink = async () => {
    if (!dseUsername.trim() || !dsePassword.trim()) {
      setError('Please enter your DSE username and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await linkDse({ dseUsername, dsePassword });
      setDseLinked(true);
      setLinked(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const resp = axiosErr?.response?.data;
      setError(resp?.error || resp?.message || axiosErr?.message || 'Failed to link DSE account.');
    } finally {
      setLoading(false);
    }
  };

  if (linked) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gain/10">
          <CheckCircle className="h-8 w-8 text-gain" />
        </div>
        <h3 className="text-lg font-bold text-foreground">DSE Account Linked!</h3>
        <p className="text-sm text-muted-foreground">
          Your holdings, orders and live portfolio data will now sync automatically from DSE.
        </p>
        <Button onClick={onDone} className="mt-2 w-full">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Link2 className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Link your DSE account to automatically sync your holdings, orders, and portfolio data.
        </p>
      </div>

      <Input
        label="DSE Username"
        type="text"
        placeholder="Enter your DSE username"
        value={dseUsername}
        onChange={(e) => setDseUsername(e.target.value)}
        autoComplete="username"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">DSE Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your DSE password"
            value={dsePassword}
            onChange={(e) => setDsePassword(e.target.value)}
            autoComplete="current-password"
            className="block w-full rounded-lg border border-card-border bg-card px-3 py-2 pr-10 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">{error}</div>
      )}

      <p className="text-xs text-muted-foreground">
        Your credentials are used only to authenticate with DSE and are stored securely encrypted. We never share them.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onDone} className="flex-1">
          Skip for now
        </Button>
        <Button onClick={handleLink} loading={loading} className="flex-1">
          Link Account
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setInvestorProfile = useAuthStore((s) => s.setInvestorProfile);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDseLink, setShowDseLink] = useState(false);

  const selectAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentStep] = value;
        return next;
      });
    },
    [currentStep],
  );

  const goNext = useCallback(() => {
    if (currentStep < profileSteps.length - 1) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleFinish = async () => {
    setError('');
    setLoading(true);

    const experience = answers[0] as InvestorExperience;
    const mainGoal = answers[1] as InvestorGoal;
    const checkFrequency = answers[2] as CheckFrequency;
    const primaryInterest = answers[3] as PrimaryInterest;
    const profileType = deriveProfileType(mainGoal, checkFrequency);
    const profile = { experience, mainGoal, checkFrequency, primaryInterest, profileType };

    try {
      await updateInvestorProfile(profile);
    } catch {
      // Profile update failed (e.g. stale token) — not a blocker.
      // Investor profile can be set later from the profile page.
    }
    // Always advance to the DSE linking step regardless of profile save outcome.
    setInvestorProfile(profile);
    setShowDseLink(true);
    setLoading(false);
  };

  const goToDashboard = () => navigate('/app/dashboard', { replace: true });

  const step = profileSteps[currentStep];
  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === profileSteps.length - 1;
  const canProceed = currentAnswer !== '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Stocks Central</span>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          {showDseLink ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-foreground">Link your DSE account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Optional — you can also do this later in Settings
                </p>
              </div>
              <DseLinkStep onDone={goToDashboard} />
            </>
          ) : (
            <>
              {/* Progress dots */}
              <div className="mb-8 flex items-center justify-center gap-2">
                {profileSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step content */}
              <div
                key={currentStep}
                className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
              >
                <h2 className="mb-6 text-center text-xl font-bold text-foreground">{step.title}</h2>
                <div className="space-y-3">
                  {step.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectAnswer(option.value)}
                      className={`w-full rounded-xl border px-4 py-4 text-left text-sm font-medium transition-colors ${
                        currentAnswer === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-card-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">{error}</div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                {currentStep > 0 ? (
                  <Button variant="outline" onClick={goBack} className="flex-1">Back</Button>
                ) : (
                  <div className="flex-1" />
                )}
                {isLastStep ? (
                  <Button onClick={handleFinish} loading={loading} disabled={!canProceed} className="flex-1">
                    Get Started
                  </Button>
                ) : (
                  <Button onClick={goNext} disabled={!canProceed} className="flex-1">Next</Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
        .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
      `}</style>
    </div>
  );
}
