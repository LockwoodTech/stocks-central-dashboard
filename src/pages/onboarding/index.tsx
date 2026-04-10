import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { updateInvestorProfile } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import type {
  InvestorExperience,
  InvestorGoal,
  CheckFrequency,
  PrimaryInterest,
  ProfileType,
} from '@/types';
import Button from '@/components/ui/Button';

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
  { label: 'Rarely \u2014 set and forget', value: 'rarely' },
];

const interestOptions: StepOption<PrimaryInterest>[] = [
  { label: 'Portfolio analytics & charts', value: 'analytics' },
  { label: 'Stock prices & market movers', value: 'market-movers' },
  { label: 'Financial goals & tracking', value: 'goals' },
  { label: 'Order book & trading', value: 'trading' },
];

const steps = [
  { title: "What's your investment experience?", options: experienceOptions },
  { title: "What's your main goal?", options: goalOptions },
  { title: 'How often do you check investments?', options: frequencyOptions },
  { title: 'What interests you most?', options: interestOptions },
] as const;

function deriveProfileType(
  goal: InvestorGoal,
  frequency: CheckFrequency,
): ProfileType {
  if (frequency === 'daily' || goal === 'active-trading') return 'active';
  if (goal === 'long-term-growth' || goal === 'save-for-something') return 'growth';
  return 'casual';
}

// ── Component ──

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setInvestorProfile = useAuthStore((s) => s.setInvestorProfile);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (currentStep < steps.length - 1) {
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
      setInvestorProfile(profile);
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string; description?: string } };
        message?: string;
      };
      const resp = axiosErr?.response?.data;
      const message =
        resp?.error || resp?.description || resp?.message || axiosErr?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const step = steps[currentStep];
  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === steps.length - 1;
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

        {/* Card */}
        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          {/* Progress dots */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step content with animation */}
          <div
            key={currentStep}
            className={`animate-fade-in ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <h2 className="mb-6 text-center text-xl font-bold text-foreground">
              {step.title}
            </h2>

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

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={goBack} className="flex-1">
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {isLastStep ? (
              <Button
                onClick={handleFinish}
                loading={loading}
                disabled={!canProceed}
                className="flex-1"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canProceed}
                className="flex-1"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
