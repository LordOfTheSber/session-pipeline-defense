export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  runId: string;
  nickname: string;
  score: number;
  difficulty: 'STANDARD' | 'HARDENED' | 'NIGHTMARE';
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
  difficulty: 'STANDARD' | 'HARDENED' | 'NIGHTMARE';
  mode: 'ENDLESS' | 'DAILY';
  suspicious: boolean;
  validationNotes: string | null;
  createdAt: string;
}

export interface RunSubmissionRequest {
  nickname: string;
  mode: 'ENDLESS' | 'DAILY';
  difficulty: 'STANDARD' | 'HARDENED' | 'NIGHTMARE';
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
