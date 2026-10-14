import { useState, type FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { verifyDseOtp } from '@/api/auth';
import { readDseError } from '@/utils/dseError';
import type { LinkDseResponse } from '@/types';

interface Props {
  destination?: string;
  onVerified: (result: LinkDseResponse) => void;
  onCancel: () => void;
}

/** Second step of linking DSE, shown when DSE sends a one-time code. */
export default function DseOtpForm({ destination, onVerified, onCancel }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter the code DSE sent you.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await verifyDseOtp(code.trim());
      if (result?.dseLinked) onVerified(result);
      else setError('DSE did not confirm the link. Try the code again.');
    } catch (err) {
      setError(readDseError(err, 'DSE rejected the code.').message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          DSE sent a one-time code{destination ? ` to ${destination}` : ' to your phone or email'}. Enter it to finish linking.
        </p>
      </div>
      <div className="space-y-1">
        <label htmlFor="dse-otp" className="block text-sm font-medium text-foreground">
          DSE code
        </label>
        <input
          id="dse-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
          placeholder="Enter code"
          className="block w-full rounded-lg border border-card-border bg-card px-3 py-2.5 text-center text-lg tracking-[0.4em] placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {error && <div className="rounded-lg bg-loss-bg px-4 py-3 text-sm text-loss">{error}</div>}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Back
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Verify code
        </Button>
      </div>
    </form>
  );
}
