import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import PricingCards from '@/components/PricingCards';

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);

  // Derive current tier from user category or default to 'free'
  const currentTier = user?.category?.toLowerCase() ?? 'free';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Choose Your Plan</h1>
          <p className="mt-4 text-muted-foreground">
            Upgrade your plan to unlock more features and get the most out of
            Stocks Central.
          </p>
        </div>

        {/* Pricing Cards */}
        <PricingCards
          isAnnual={false}
          showToggle
          currentTier={currentTier}
          themed
        />
      </div>
    </div>
  );
}
