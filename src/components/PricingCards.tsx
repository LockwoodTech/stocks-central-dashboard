import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Live market ticker',
      'Dashboard overview',
      'Investment holdings view',
      '5 stock transactions/month',
      '2 analytics tabs',
      '1 financial goal',
      '1 price alert',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Basic',
    monthlyPrice: 2500,
    annualPrice: 2000,
    features: [
      'Everything in Free',
      'Unlimited stock transactions',
      'Fund transactions',
      '5 analytics tabs',
      '3 financial goals',
      '5 price alerts',
      'Cost breakdown analysis',
    ],
    cta: 'Start Basic',
    popular: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 8500,
    annualPrice: 6800,
    features: [
      'Everything in Basic',
      'All 8 analytics tabs',
      'Unlimited financial goals',
      '15 price alerts',
      'Minor accounts',
      'Export reports',
      'Custom brokerage rate',
    ],
    cta: 'Start Pro',
  },
  {
    name: 'Premium',
    monthlyPrice: 12000,
    annualPrice: 9600,
    features: [
      'Everything in Pro',
      'Unlimited price alerts',
      'Priority support',
      'API access',
    ],
    cta: 'Start Premium',
  },
];

function formatPrice(price: number): string {
  if (price === 0) return '0';
  return new Intl.NumberFormat('en-TZ').format(price);
}

interface PricingCardsProps {
  isAnnual: boolean;
  showToggle?: boolean;
  currentTier?: string;
  /** When true, uses app theme tokens instead of marketing colors */
  themed?: boolean;
}

export default function PricingCards({
  isAnnual: isAnnualProp,
  showToggle = false,
  currentTier,
  themed = false,
}: PricingCardsProps) {
  const [internalAnnual, setInternalAnnual] = useState(isAnnualProp);
  const isAnnual = showToggle ? internalAnnual : isAnnualProp;

  const cardBg = themed ? 'bg-card border-card-border' : 'bg-white border-gray-200';
  const cardText = themed ? 'text-foreground' : 'text-gray-900';
  const mutedText = themed ? 'text-muted-foreground' : 'text-gray-500';
  const checkColor = themed ? 'text-gain' : 'text-gray-900';

  return (
    <div>
      {showToggle && (
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className={`text-sm font-medium ${!isAnnual ? cardText : mutedText}`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setInternalAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              isAnnual ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAnnual ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${isAnnual ? cardText : mutedText}`}
          >
            Annual{' '}
            <span className="text-gray-900 font-semibold">(Save 20%)</span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const isCurrent =
            currentTier?.toLowerCase() === tier.name.toLowerCase();

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${cardBg} ${
                tier.popular
                  ? 'ring-2 ring-gray-900 shadow-lg scale-[1.02]'
                  : 'shadow-sm'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-0.5 text-xs font-semibold text-white">
                  Popular
                </span>
              )}

              {isCurrent && (
                <span
                  className={`absolute -top-3 right-4 rounded-full px-3 py-0.5 text-xs font-semibold ${
                    themed
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  Current Plan
                </span>
              )}

              <h3 className={`text-lg font-semibold ${cardText}`}>
                {tier.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-bold tracking-tight ${cardText}`}>
                  TZS {formatPrice(price)}
                </span>
                {price > 0 && (
                  <span className={`text-sm ${mutedText}`}>/mo</span>
                )}
              </div>

              {isAnnual && tier.monthlyPrice > 0 && (
                <p className={`mt-1 text-xs ${mutedText}`}>
                  Billed annually at TZS{' '}
                  {formatPrice(tier.annualPrice * 12)}/year
                </p>
              )}

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${checkColor}`}
                    />
                    <span className={`text-sm ${mutedText}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrent ? (
                  <span
                    className={`block w-full text-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
                      themed
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-gray-100 text-gray-400'
                    } cursor-default`}
                  >
                    Current Plan
                  </span>
                ) : (
                  <Link
                    to="/register"
                    className={`block w-full text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.popular
                        ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                        : themed
                          ? 'bg-card border border-card-border text-foreground hover:bg-muted'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
