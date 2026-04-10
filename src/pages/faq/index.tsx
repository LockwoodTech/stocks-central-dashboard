import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ChevronDown } from 'lucide-react';

/* ─── FAQ Data ──────────────────────────────────────────────────── */

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    title: 'General',
    items: [
      {
        question: 'What is Stocks Central?',
        answer:
          "Tanzania's investment tracker for Stocks, ETFs, and Funds listed on the Dar es Salaam Stock Exchange (DSE).",
      },
      {
        question: 'Is Stocks Central free to use?',
        answer:
          'Yes, we offer a free tier with basic features. Premium tiers unlock advanced analytics, unlimited transactions, and more.',
      },
      {
        question: 'Do I need a brokerage account to use Stocks Central?',
        answer:
          'No. You can manually log your trades. However, linking your DSE CDS account provides automatic trade syncing.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          "Sign up at stocks.co.tz with your email or phone number. Verify via OTP and you're ready to go.",
      },
      {
        question: 'Can I use Stocks Central on my phone?',
        answer:
          'Yes, the web app is fully responsive and works on any mobile browser.',
      },
      {
        question: 'How do I link my DSE account?',
        answer:
          "Go to Profile \u2192 DSE Account and enter your CDS number. We'll verify and sync your holdings.",
      },
    ],
  },
  {
    title: 'Trading & Portfolio',
    items: [
      {
        question: 'How are stock prices updated?',
        answer:
          'Prices are synced from the DSE throughout the trading session. Live ticker shows real-time data.',
      },
      {
        question: 'What is WAC (Weighted Average Cost)?',
        answer:
          'WAC is the average price you paid per share, including brokerage fees. We calculate it automatically for every stock you hold.',
      },
      {
        question: 'Can I track fund investments?',
        answer:
          'Yes, we support iTrust and other fund tracking alongside DSE stocks.',
      },
      {
        question: 'How does trade verification work?',
        answer:
          'We compare your manual logs against DSE settlement records and broker statements to flag discrepancies.',
      },
    ],
  },
  {
    title: 'Pricing & Billing',
    items: [
      {
        question: 'How do SMS alerts work?',
        answer:
          'Purchase SMS credit packs, then set price alerts. When a stock hits your target, you receive an SMS instantly.',
      },
      {
        question: 'Can I change my subscription plan?',
        answer:
          'Yes, upgrade or downgrade anytime from your Profile page. Changes take effect at your next billing cycle.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept mobile money (M-Pesa, Tigo Pesa, Airtel Money) and bank cards.',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        question: 'Is my data secure?',
        answer:
          'Yes. We use encryption in transit and at rest. We never share your personal data with third parties.',
      },
      {
        question: 'How can I delete my account?',
        answer:
          "Contact us at support@stocks.co.tz and we'll process your deletion request within 48 hours.",
      },
    ],
  },
];

/* ─── FAQ Page Component ────────────────────────────────────────── */

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenIndex((prev) => (prev === key ? null : key));
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Stocks Central
              </span>
            </Link>

            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-muted border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Stocks Central. Can't find the
            answer you're looking for? Reach out to our support team.
          </p>
        </div>
      </section>

      {/* ── FAQ Accordion ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => {
                  const key = `${category.title}-${item.question}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={key}
                      className="bg-card border border-card-border rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-200 ease-in-out ${
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Still have questions?
          </h2>
          <p className="mt-2 text-muted-foreground">
            We're here to help. Reach out and we'll get back to you as soon as
            possible.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Stocks Central. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
