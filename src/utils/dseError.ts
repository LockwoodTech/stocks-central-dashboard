import type { DseStatus } from '@/types';

export interface DseErrorInfo {
  /** Set when the API says what state the DSE link is in. */
  status?: DseStatus | 'UNAVAILABLE';
  message: string;
}

/** Reads the API's error body: { message, details: { dseStatus, reason } } or { error }. */
export function readDseError(err: unknown, fallback = 'Something went wrong talking to DSE.'): DseErrorInfo {
  const e = err as { response?: { data?: { message?: string; error?: string; details?: { dseStatus?: string; reason?: string } | string } }; message?: string };
  const data = e?.response?.data;
  const details = typeof data?.details === 'object' && data?.details ? data.details : undefined;
  return {
    status: details?.dseStatus as DseErrorInfo['status'],
    message: details?.reason || data?.error || data?.message || e?.message || fallback,
  };
}

/** What to show in an empty DSE table, depending on why it is empty. */
export function dseEmptyMessage(status: DseStatus, error: unknown, what: string): string {
  const info = error ? readDseError(error) : undefined;
  if (info?.status === 'RECONNECT_REQUIRED' || status === 'RECONNECT_REQUIRED') {
    return `Your DSE session has expired. Reconnect DSE in Profile to load your ${what}.`;
  }
  if (info?.status === 'UNAVAILABLE') return `DSE is not responding right now. Your ${what} will load when it is back.`;
  if (status === 'OTP_PENDING') return `Finish linking DSE in Profile by entering the code DSE sent you.`;
  if (info && info.status !== 'NOT_LINKED') return info.message;
  if (status !== 'LINKED') return `Link your DSE account in Profile to see your ${what}.`;
  return `No ${what} found on DSE.`;
}
