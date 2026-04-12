import type { Difficulty } from '@/shared/types/api';

const NICKNAME_KEY = 'session-defense:nickname';
const DIFFICULTY_KEY = 'session-defense:preferred-difficulty';
const AUDIO_KEY = 'session-defense:console-audio';
const PREFERENCES_KEY = 'session-defense:console-preferences';

export type ConsoleAudioPrefs = {
  uiVolume: number;
  ambienceVolume: number;
  ariaBeepVolume: number;
};

export type AriaVerbosity = 'LOW' | 'NORMAL' | 'HIGH';

export type ConsolePreferences = {
  ariaVerbosity: AriaVerbosity;
  crtEffectEnabled: boolean;
  reducedMotion: boolean;
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

export function getConsolePreferences(): ConsolePreferences {
  const fallback: ConsolePreferences = {
    ariaVerbosity: 'NORMAL',
    crtEffectEnabled: true,
    reducedMotion: false,
  };

  const raw = localStorage.getItem(PREFERENCES_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsolePreferences>;
    return {
      ariaVerbosity: parsed.ariaVerbosity === 'LOW' || parsed.ariaVerbosity === 'HIGH' ? parsed.ariaVerbosity : 'NORMAL',
      crtEffectEnabled: typeof parsed.crtEffectEnabled === 'boolean' ? parsed.crtEffectEnabled : fallback.crtEffectEnabled,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : fallback.reducedMotion,
    };
  } catch {
    return fallback;
  }
}

export function setConsolePreferences(prefs: ConsolePreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}
