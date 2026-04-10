import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="5 April 2026">
      <h2>1. Introduction</h2>
      <p>
        Stocks Central ("we", "our", "us") is committed to protecting your privacy. This policy
        explains how we collect, use, store, and protect your personal information when you use our
        Service.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>Account information: name, email address, phone number</li>
        <li>
          Financial data: portfolio holdings, transaction history, investment goals (as entered by
          you)
        </li>
        <li>DSE account data: CDS number and holdings (when you link your DSE account)</li>
        <li>Usage data: pages visited, features used, session duration</li>
        <li>Device information: browser type, operating system, screen resolution</li>
        <li>Communication data: contact form submissions, support requests</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>Provide and improve the Service</li>
        <li>Display your portfolio and market data</li>
        <li>Send SMS price alerts (when configured by you)</li>
        <li>Process payments and manage subscriptions</li>
        <li>Communicate service updates and important notices</li>
        <li>Analyse usage patterns to improve features</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <ul>
        <li>Data is stored on secure cloud servers</li>
        <li>We use encryption in transit (TLS/SSL) and at rest</li>
        <li>Access to user data is restricted to authorised personnel</li>
        <li>We conduct regular security reviews</li>
        <li>Despite our efforts, no system is 100% secure</li>
      </ul>

      <h2>5. SMS and Phone Number Usage</h2>
      <ul>
        <li>
          Your phone number is used solely for SMS price alerts and account verification
        </li>
        <li>We do not share your phone number with third parties for marketing</li>
        <li>SMS delivery is handled through licensed Tanzanian telecom providers</li>
        <li>You can disable SMS alerts at any time from your profile settings</li>
      </ul>

      <h2>6. Third-Party Services</h2>
      <ul>
        <li>
          Payment processing: mobile money and card payments are handled by licensed payment service
          providers
        </li>
        <li>Market data: sourced from the DSE and authorised data vendors</li>
        <li>We do not sell your personal data to any third party</li>
      </ul>

      <h2>7. Cookies and Local Storage</h2>
      <ul>
        <li>We use localStorage (not cookies) to maintain your session and preferences</li>
        <li>
          Stored data includes: authentication token (<code className="text-foreground">dse-auth</code>
          ), theme preference (<code className="text-foreground">dse-theme</code>)
        </li>
        <li>No third-party tracking cookies are used</li>
        <li>You can clear stored data at any time through your browser settings</li>
      </ul>

      <h2>8. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your account and data</li>
        <li>Export your transaction history</li>
        <li>Withdraw consent for optional data processing</li>
        <li>Lodge a complaint with the relevant authority</li>
      </ul>

      <h2>9. Data Retention</h2>
      <ul>
        <li>Active accounts: data retained for the duration of your account</li>
        <li>Deleted accounts: data retained for 90 days, then permanently deleted</li>
        <li>
          Transaction records: retained for 7 years as required by Tanzanian financial regulations
        </li>
        <li>SMS alert logs: retained for 12 months</li>
      </ul>

      <h2>10. Children's Privacy</h2>
      <p>
        Stocks Central is not intended for individuals under 18 years of age. We do not knowingly
        collect data from minors. Minor accounts (Pro tier feature) must be set up by a parent or
        legal guardian.
      </p>

      <h2>11. Regulatory Compliance</h2>
      <p>We operate in compliance with:</p>
      <ul>
        <li>The Electronic and Postal Communications Act (EPOCA) of Tanzania</li>
        <li>The Cybercrimes Act, 2015</li>
        <li>The Personal Data Protection Act (when enacted)</li>
        <li>Capital Markets and Securities Authority (CMSA) guidelines where applicable</li>
      </ul>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes
        via email or in-app notification. Your continued use of the Service after changes
        constitutes acceptance.
      </p>

      <h2>13. Data Protection Contact</h2>
      <p>For privacy-related inquiries:</p>
      <p>
        Email:{' '}
        <a
          href="mailto:privacy@stocks.co.tz"
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          privacy@stocks.co.tz
        </a>
      </p>
      <p>Address: Stocks Central Ltd, Dar es Salaam, Tanzania</p>
    </LegalPageLayout>
  );
}
