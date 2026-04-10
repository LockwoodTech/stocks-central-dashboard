import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { upsertActivity, type ActivityData } from '@/api/activity';

/**
 * Returns the ISO week string for a given date in the format "YYYY-Wxx".
 */
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

const FLUSH_INTERVAL_MS = 60_000;

/**
 * Hook that tracks page visits and batches activity data.
 * Place this in your root Layout component to enable automatic tracking.
 *
 * Usage:
 *   function Layout() {
 *     useActivityTracker();
 *     return <Outlet />;
 *   }
 */
export function useActivityTracker() {
  const location = useLocation();

  const tabVisitsRef = useRef<Record<string, number>>({});
  const featuresUsedRef = useRef<Record<string, number>>({});
  const dirtyRef = useRef(false);

  const flush = useCallback(async () => {
    if (!dirtyRef.current) return;

    const data: ActivityData = {
      period: getISOWeek(new Date()),
    };

    if (Object.keys(tabVisitsRef.current).length > 0) {
      data.tabVisits = { ...tabVisitsRef.current };
    }

    if (Object.keys(featuresUsedRef.current).length > 0) {
      data.featuresUsed = { ...featuresUsedRef.current };
    }

    // Reset after capturing
    tabVisitsRef.current = {};
    featuresUsedRef.current = {};
    dirtyRef.current = false;

    try {
      await upsertActivity(data);
    } catch {
      // Silently ignore -- activity tracking should not disrupt UX
    }
  }, []);

  // Track page/tab visits
  useEffect(() => {
    const page = location.pathname;
    tabVisitsRef.current[page] = (tabVisitsRef.current[page] ?? 0) + 1;
    dirtyRef.current = true;
  }, [location.pathname]);

  // Periodic flush every 60 seconds
  useEffect(() => {
    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [flush]);

  // Flush on tab hide / page unload
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flush]);

  /**
   * Call this to record a feature usage event from anywhere in the app
   * by lifting this function via context if needed.
   */
  const trackFeature = useCallback((feature: string) => {
    featuresUsedRef.current[feature] = (featuresUsedRef.current[feature] ?? 0) + 1;
    dirtyRef.current = true;
  }, []);

  return { trackFeature };
}
