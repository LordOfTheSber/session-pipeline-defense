import type { LogFragment } from './types';

export const loreCodex = {
  division: 'The Pipeline Division is OmniData Corp\'s sealed response unit that manually stabilizes overloaded data lanes when automation fails.',
  surge: 'The Surge is a self-organizing anomaly in live traffic that mutates packet behavior and bypasses expected routing safeguards.',
  aria: 'ARIA (Adaptive Routing & Integrity Assistant) is the Division\'s operational AI assigned to guide and monitor Operator-7 shifts.',
  operator7: 'Operator-7 is a newly recruited pipeline engineer tasked with surviving live Surge incidents using the Session Pool.',
  pipeline: 'The Pipeline is the active multi-lane processing backbone that powers critical global services and must remain stable.',
  sessionPool: 'The Session Pool is the deployable compute roster used to instantiate short-lived Sessions with TTL and capacity limits.',
} as const;

export const initialRecoveredLogs: LogFragment[] = [
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
