export type Difficulty = 'STANDARD' | 'HARDENED' | 'NIGHTMARE';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  runId: string;
  nickname: string;
  score: number;
  difficulty: Difficulty;
  mode: 'ENDLESS' | 'DAILY';
  createdAt: string;
}

export interface RunSummary {
  id: string;
  nicknameSnapshot: string;
  score: number;
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  difficulty: Difficulty;
  mode: 'ENDLESS' | 'DAILY';
  suspicious: boolean;
  validationNotes: string | null;
  createdAt: string;
}

export interface RunHistoryEntry {
  id: string;
  score: number;
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  difficulty: Difficulty;
  mode: 'ENDLESS' | 'DAILY';
  suspicious: boolean;
  createdAt: string;
}

export interface PlayerProfile {
  id: string;
  nickname: string;
  preferredDifficulty: Difficulty;
  createdAt: string;
  updatedAt: string;
}

export interface RunSubmissionRequest {
  nickname: string;
  mode: 'ENDLESS' | 'DAILY';
  difficulty: Difficulty;
  challengeDate?: string;
  challengeSeed?: number;
  survivalSeconds: number;
  processedCount: number;
  waveReached: number;
  activeSessionPeak: number;
  creditsSpent: number;
  systemHealthEnd: number;
  score: number;
}

export interface RunSubmissionResponse {
  id: string;
  suspicious: boolean;
  validationNotes: string | null;
}

export interface DailyChallengeResponse {
  challengeDate: string;
  seed: number;
  challengeModifiers: Record<string, number>;
  leaderboardWindowKey: string;
}

export interface NarrativeStateResponse {
  nickname: string;
  seenBeatKeys: string[];
}

export interface NarrativeSeenRequest {
  nickname: string;
  beatKey: string;
}
