import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import {
  getConsoleAudioPrefs,
  getConsolePreferences,
  getStoredDifficulty,
  getStoredNickname,
  setConsoleAudioPrefs,
  setConsolePreferences,
  setStoredDifficulty,
  setStoredNickname,
} from '@/shared/lib/profilePrefs';
import { getStoredLanguage, setStoredLanguage, t, type Locale } from '@/shared/lib/i18n';
import type { Difficulty } from '@/shared/types/api';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function SettingsPage() {
  const loadHealth = useCallback(() => gameApi.getHealth(), []);
  const health = useAsyncResource(loadHealth);
  const [nickname, setNickname] = useState(getStoredNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>(getStoredDifficulty());
  const [audioPrefs, setAudioPrefs] = useState(getConsoleAudioPrefs());
  const [consolePrefs, setConsolePrefs] = useState(getConsolePreferences());
  const [language, setLanguage] = useState<Locale>(getStoredLanguage());
  const locale = language;
  const [status, setStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setStatus(null);

    const normalizedNickname = nickname.trim();
    if (normalizedNickname.length < 2) {
      setSaveError(locale === 'ru' ? 'Никнейм должен содержать минимум 2 символа.' : 'Nickname should have at least 2 characters.');
      return;
    }

    try {
      const profile = await gameApi.upsertPlayerProfile(normalizedNickname, difficulty);
      setStoredNickname(profile.nickname);
      setStoredDifficulty(profile.preferredDifficulty);
      setConsoleAudioPrefs(audioPrefs);
      setConsolePreferences(consolePrefs);
      setStoredLanguage(language);
      setStatus(locale === 'ru' ? `Настройки сохранены для ${profile.nickname}.` : `Saved console preferences for ${profile.nickname}.`);
    } catch {
      setSaveError(locale === 'ru' ? 'Не удалось сохранить настройки профиля в backend.' : 'Could not persist profile preferences to backend.');
    }
  };

  return (
    <section>
      <h2>{locale === 'ru' ? 'НАСТРОЙКИ КОНСОЛИ' : 'CONSOLE PREFERENCES'}</h2>
      <p>
        {locale === 'ru'
          ? 'Сохраните никнейм, сложность по умолчанию, поведение ARIA и параметры доступности.'
          : 'Persist nickname, default difficulty, ARIA behavior, and accessibility toggles.'}
      </p>

      {health.isLoading && <LoadingState label="backend health" />}
      {health.error && (
        <ErrorState
          title="Backend unavailable"
          message="Could not load API health status. Ensure backend is running on http://localhost:8080 and Vite dev proxy is active (or set VITE_API_BASE_URL)."
        />
      )}

      {health.data && (
        <div className="panel">
          <h3>{locale === 'ru' ? 'Статус backend' : 'Backend status'}</h3>
          <ul>
            <li>Service: {health.data.service}</li>
            <li>Status: {health.data.status}</li>
            <li>Timestamp: {new Date(health.data.timestamp).toLocaleString()}</li>
          </ul>
        </div>
      )}

      <form className="panel settings-form" onSubmit={onSave}>
        <h3>{locale === 'ru' ? 'Профиль оператора' : 'Operator Profile'}</h3>
        <label htmlFor="nickname">{locale === 'ru' ? 'Никнейм' : 'Nickname'}</label>
        <input id="nickname" value={nickname} maxLength={50} onChange={(event) => setNickname(event.target.value)} />

        <label htmlFor="difficulty">{locale === 'ru' ? 'Предпочитаемая сложность' : 'Preferred Difficulty'}</label>
        <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          <option value="STANDARD">STANDARD</option>
          <option value="HARDENED">HARDENED</option>
          <option value="NIGHTMARE">NIGHTMARE</option>
        </select>

        <label htmlFor="language">{t(locale, 'language')}</label>
        <select id="language" value={language} onChange={(event) => setLanguage(event.target.value as Locale)}>
          <option value="en">{t(locale, 'english')}</option>
          <option value="ru">{t(locale, 'russian')}</option>
        </select>

        <h3>{locale === 'ru' ? 'Канал ARIA' : 'ARIA Channel'}</h3>
        <label htmlFor="verbosity">{locale === 'ru' ? 'Подробность ARIA' : 'ARIA verbosity'}</label>
        <select
          id="verbosity"
          value={consolePrefs.ariaVerbosity}
          onChange={(event) => setConsolePrefs((prev) => ({ ...prev, ariaVerbosity: event.target.value as 'LOW' | 'NORMAL' | 'HIGH' }))}
        >
          <option value="LOW">LOW</option>
          <option value="NORMAL">NORMAL</option>
          <option value="HIGH">HIGH</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={consolePrefs.crtEffectEnabled}
            onChange={(event) => setConsolePrefs((prev) => ({ ...prev, crtEffectEnabled: event.target.checked }))}
          />{' '}
          {locale === 'ru' ? 'CRT-эффект' : 'CRT effect'}
        </label>

        <label>
          <input
            type="checkbox"
            checked={consolePrefs.reducedMotion}
            onChange={(event) => setConsolePrefs((prev) => ({ ...prev, reducedMotion: event.target.checked }))}
          />{' '}
          {locale === 'ru' ? 'Уменьшенное движение' : 'Reduced motion'}
        </label>

        <h3>{locale === 'ru' ? 'Микширование аудио консоли' : 'Console Audio Mix'}</h3>
        <label htmlFor="uiVolume">{locale === 'ru' ? 'Клики UI' : 'UI clicks'}: {audioPrefs.uiVolume}%</label>
        <input
          id="uiVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.uiVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, uiVolume: Number(event.target.value) }))}
        />

        <label htmlFor="ambienceVolume">{locale === 'ru' ? 'Фон дата-центра' : 'Data-center hum'}: {audioPrefs.ambienceVolume}%</label>
        <input
          id="ambienceVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.ambienceVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, ambienceVolume: Number(event.target.value) }))}
        />

        <label htmlFor="ariaBeepVolume">{locale === 'ru' ? 'Сигнал голоса ARIA' : 'ARIA voice beep'}: {audioPrefs.ariaBeepVolume}%</label>
        <input
          id="ariaBeepVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.ariaBeepVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, ariaBeepVolume: Number(event.target.value) }))}
        />

        <button type="submit">{t(locale, 'savePreferences')}</button>
        {status && <p>{status}</p>}
        {saveError && <p>{saveError}</p>}
      </form>
    </section>
  );
}
