import { fetchJson } from './http';
import type {
  DailyChallengeResponse,
  Difficulty,
  HealthResponse,
  LeaderboardEntry,
  NarrativeSeenRequest,
  NarrativeStateResponse,
  PlayerProfile,
  RunHistoryEntry,
  RunSubmissionRequest,
  RunSubmissionResponse,
  RunSummary,
} from '../types/api';

export const gameApi = {
  getHealth(): Promise<HealthResponse> {
    return fetchJson<HealthResponse>('/api/health');
  },

  getDailyChallenge(): Promise<DailyChallengeResponse> {
    return fetchJson<DailyChallengeResponse>('/api/challenges/daily');
  },

  upsertPlayerProfile(nickname: string, preferredDifficulty: Difficulty): Promise<PlayerProfile> {
    return fetchJson<PlayerProfile>('/api/players/profile', {
      method: 'POST',
      body: JSON.stringify({ nickname, preferredDifficulty }),
    });
  },

  getPlayerProfile(nickname: string): Promise<PlayerProfile> {
    return fetchJson<PlayerProfile>(`/api/players/${encodeURIComponent(nickname)}`);
  },

  getPlayerRuns(nickname: string, limit = 10): Promise<RunHistoryEntry[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return fetchJson<RunHistoryEntry[]>(`/api/players/${encodeURIComponent(nickname)}/runs?${params.toString()}`);
  },

  submitRun(payload: RunSubmissionRequest): Promise<RunSubmissionResponse> {
    return fetchJson<RunSubmissionResponse>('/api/runs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getGlobalLeaderboard(limit = 10, difficulty: Difficulty = 'STANDARD'): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({ difficulty, limit: String(limit) });
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/global?${params.toString()}`);
  },

  getDailyLeaderboard(date: string, limit = 10, difficulty: Difficulty = 'STANDARD'): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({ date, difficulty, limit: String(limit) });
    return fetchJson<LeaderboardEntry[]>(`/api/leaderboards/daily?${params.toString()}`);
  },

  getRunSummary(runId: string): Promise<RunSummary> {
    return fetchJson<RunSummary>(`/api/runs/${runId}`);
  },

  getNarrativeState(nickname: string): Promise<NarrativeStateResponse> {
    const params = new URLSearchParams({ nickname });
    return fetchJson<NarrativeStateResponse>(`/api/narrative/state?${params.toString()}`);
  },

  markNarrativeSeen(payload: NarrativeSeenRequest): Promise<NarrativeStateResponse> {
    return fetchJson<NarrativeStateResponse>('/api/narrative/seen', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
