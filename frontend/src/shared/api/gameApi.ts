import { fetchJson } from './http';
import type {
  HealthResponse,
  LeaderboardEntry,
  RunSubmissionRequest,
  RunSubmissionResponse,
  RunSummary,
} from '../types/api';

export const gameApi = {
  getHealth(): Promise<HealthResponse> {
    return fetchJson<HealthResponse>('/api/health');
  },

  submitRun(payload: RunSubmissionRequest): Promise<RunSubmissionResponse> {
    return fetchJson<RunSubmissionResponse>('/api/runs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getGlobalLeaderboard(limit = 10, difficulty: 'STANDARD' | 'HARDENED' | 'NIGHTMARE' = 'STANDARD'): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({ difficulty, limit: String(limit) });
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/global?${params.toString()}`);
  },

  getDailyLeaderboard(
    date: string,
    limit = 10,
    difficulty: 'STANDARD' | 'HARDENED' | 'NIGHTMARE' = 'STANDARD',
  ): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({ date, difficulty, limit: String(limit) });
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/daily?${params.toString()}`);
  },

  getRunSummary(runId: string): Promise<RunSummary> {
    return fetchJson<RunSummary>(`/api/runs/${runId}`);
  },
};
