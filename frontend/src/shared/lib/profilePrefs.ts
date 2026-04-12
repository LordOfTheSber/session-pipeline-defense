import type { Difficulty } from '@/shared/types/api';

const NICKNAME_KEY = 'session-defense:nickname';
const DIFFICULTY_KEY = 'session-defense:preferred-difficulty';
const AUDIO_KEY = 'session-defense:console-audio';

export type ConsoleAudioPrefs = {
  uiVolume: number;
  ambienceVolume: number;
  ariaBeepVolume: number;
};

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

export function getConsoleAudioPrefs(): ConsoleAudioPrefs {
  const fallback: ConsoleAudioPrefs = { uiVolume: 35, ambienceVolume: 20, ariaBeepVolume: 45 };
  const raw = localStorage.getItem(AUDIO_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsoleAudioPrefs>;
    return {
      uiVolume: Number.isFinite(parsed.uiVolume) ? Math.max(0, Math.min(100, Number(parsed.uiVolume))) : fallback.uiVolume,
      ambienceVolume: Number.isFinite(parsed.ambienceVolume)
        ? Math.max(0, Math.min(100, Number(parsed.ambienceVolume)))
        : fallback.ambienceVolume,
      ariaBeepVolume: Number.isFinite(parsed.ariaBeepVolume)
        ? Math.max(0, Math.min(100, Number(parsed.ariaBeepVolume)))
        : fallback.ariaBeepVolume,
    };
  } catch {
    return fallback;
  }
}

export function setConsoleAudioPrefs(prefs: ConsoleAudioPrefs): void {
  localStorage.setItem(AUDIO_KEY, JSON.stringify(prefs));
}
