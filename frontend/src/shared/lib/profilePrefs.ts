import type { Difficulty } from '@/shared/types/api';

const NICKNAME_KEY = 'session-defense:nickname';
const DIFFICULTY_KEY = 'session-defense:preferred-difficulty';

export function getStoredNickname(): string {
  return localStorage.getItem(NICKNAME_KEY)?.trim() || 'operator';
}

export function setStoredNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname.trim());
}

export function getStoredDifficulty(): Difficulty {
  const raw = localStorage.getItem(DIFFICULTY_KEY);
  if (raw === 'HARDENED' || raw === 'NIGHTMARE') {
    return raw;
  }

  return 'STANDARD';
}

export function setStoredDifficulty(difficulty: Difficulty): void {
  localStorage.setItem(DIFFICULTY_KEY, difficulty);
}
