import LegalPageLayout from '@/components/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="5 April 2026">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using Stocks Central ("the Service"), you agree to these Terms of
        Service. If you do not agree, do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Stocks Central is an investment tracking platform for securities listed on the Dar es Salaam
        Stock Exchange (DSE). The Service provides portfolio tracking, market data display, analytics
        tools, SMS price alerts, and financial goal management. Stocks Central does NOT provide
        investment advice, brokerage services, or execute trades on your behalf.
      </p>

      <h2>3. User Accounts</h2>
      <ul>
        <li>You must provide accurate information during registration</li>
        <li>You are responsible for maintaining the security of your account credentials</li>
        <li>You must be at least 18 years old to use the Service</li>
        <li>One account per person; sharing accounts is prohibited</li>
        <li>We reserve the right to suspend accounts that violate these terms</li>
      </ul>

      <h2>4. Subscriptions and Payments</h2>
      <ul>
        <li>Free tier is available with limited features</li>
        <li>Paid subscriptions (Basic, Pro, Premium) are billed monthly or annually</li>
        <li>Payments are processed via mobile money or card through our payment partners</li>
        <li>Subscription auto-renews unless cancelled before the billing date</li>
        <li>No refunds for partial billing periods</li>
        <li>We may change pricing with 30 days' notice</li>
      </ul>

      <h2>5. SMS Credits</h2>
      <ul>
        <li>SMS credits are purchased separately from subscriptions</li>
        <li>Credits are non-refundable and non-transferable</li>
        <li>Unused credits do not expire</li>
        <li>SMS delivery depends on your mobile network provider</li>
      </ul>

      <h2>6. Market Data Disclaimer</h2>
      <ul>
        <li>
          Market data displayed on Stocks Central is sourced from the DSE and third-party providers
        </li>
        <li>Data may be delayed and is provided "as-is" without guarantees of accuracy</li>
        <li>
          Stocks Central is not responsible for trading decisions made based on displayed data
        </li>
        <li>Historical data and analytics are for informational purposes only</li>
      </ul>

      <h2>7. Referral Programme</h2>
      <ul>
        <li>Each user receives a unique referral code upon registration</li>
        <li>
          Referral rewards (SMS credits, free subscription time) are credited when the referred user
          completes their first paid subscription
        </li>
        <li>
          Abuse of the referral system (fake accounts, self-referrals) will result in forfeiture of
          rewards and possible account suspension
        </li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        All content, design, code, and branding of Stocks Central are owned by Stocks Central Ltd.
        You may not copy, modify, or distribute any part of the Service without written permission.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        Stocks Central is provided "as-is". We do not guarantee uninterrupted service, data
        accuracy, or investment outcomes. To the maximum extent permitted by Tanzanian law, Stocks
        Central shall not be liable for any indirect, incidental, or consequential damages.
      </p>

      <h2>10. Account Termination</h2>
      <ul>
        <li>You may delete your account at any time by contacting support</li>
        <li>We may suspend or terminate accounts that violate these terms</li>
        <li>
          Upon termination, your data will be retained for 90 days before permanent deletion
        </li>
      </ul>

      <h2>11. Governing Law</h2>
      <p>
        These terms are governed by the laws of the United Republic of Tanzania. Any disputes shall
        be resolved in the courts of Dar es Salaam.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may update these terms at any time. Continued use of the Service after changes
        constitutes acceptance. We will notify registered users of material changes via email or
        in-app notification.
      </p>

      <h2>13. Contact</h2>
      <p>
        For questions about these terms, contact us at{' '}
        <a
          href="mailto:legal@stocks.co.tz"
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          legal@stocks.co.tz
        </a>{' '}
        or visit our{' '}
        <a
          href="/contact"
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          Contact page
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
