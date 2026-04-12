import type { LogFragment } from './types';

export const fallbackRecoveredLogs: LogFragment[] = [
  {
    id: 'log-001',
    act: 'ACT_I_ONBOARDING',
    title: 'Recovered Log #001 — “Shift Zero Echo”',
    excerpt: 'Division recorder notes a brief routing loop before first Surge manifestation. ARIA transcript partially redacted.',
  },
  {
    id: 'log-002',
    act: 'ACT_I_ONBOARDING',
    title: 'Recovered Log #002 — “Cold Rack, Warm Lines”',
    excerpt: 'Operator notes mention silent validator failures preceding lane clustering anomalies.',
  },
];

export function buildDailyLogFromChallenge(challengeDate: string, title: string, excerpt: string, actReference: string): LogFragment {
  return {
    id: `daily-${challengeDate}`,
    act: (actReference as LogFragment['act']) ?? 'ACT_III_REVELATION',
    title,
    excerpt,
  };
}
