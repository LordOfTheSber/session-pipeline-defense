export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  runId: string;
  nickname: string;
  score: number;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
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
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  mode: 'ENDLESS' | 'DAILY';
  suspicious: boolean;
  validationNotes: string | null;
  createdAt: string;
}
