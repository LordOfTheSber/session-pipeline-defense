import { fetchJson } from './http';
import type { HealthResponse, LeaderboardEntry, RunSummary } from '../types/api';

export const gameApi = {
  getHealth(): Promise<HealthResponse> {
    return fetchJson<HealthResponse>('/api/health');
  },

  getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/global?limit=${limit}`);
  },

  getDailyLeaderboard(date: string, limit = 10): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({ date, limit: String(limit) });
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/daily?${params.toString()}`);
  },

  getRunSummary(runId: string): Promise<RunSummary> {
    return fetchJson<RunSummary>(`/api/runs/${runId}`);
  },
};
