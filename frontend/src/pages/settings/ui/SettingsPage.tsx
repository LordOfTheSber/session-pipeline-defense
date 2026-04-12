import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import {
  getConsoleAudioPrefs,
  getStoredDifficulty,
  getStoredNickname,
  setConsoleAudioPrefs,
  setStoredDifficulty,
  setStoredNickname,
} from '@/shared/lib/profilePrefs';
import type { Difficulty } from '@/shared/types/api';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function SettingsPage() {
  const loadHealth = useCallback(() => gameApi.getHealth(), []);
  const health = useAsyncResource(loadHealth);
  const [nickname, setNickname] = useState(getStoredNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>(getStoredDifficulty());
  const [audioPrefs, setAudioPrefs] = useState(getConsoleAudioPrefs());
  const [status, setStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setStatus(null);

    const normalizedNickname = nickname.trim();
    if (normalizedNickname.length < 2) {
      setSaveError('Nickname should have at least 2 characters.');
      return;
    }

    try {
      const profile = await gameApi.upsertPlayerProfile(normalizedNickname, difficulty);
      setStoredNickname(profile.nickname);
      setStoredDifficulty(profile.preferredDifficulty);
      setConsoleAudioPrefs(audioPrefs);
      setStatus(`Saved profile ${profile.nickname} with preferred difficulty ${profile.preferredDifficulty}.`);
    } catch {
      setSaveError('Could not persist profile preferences to backend.');
    }
  };

  return (
    <section>
      <h2>Profile & Settings</h2>
      <p>Persist nickname and preferred difficulty for endless mode defaults and run history.</p>

      {health.isLoading && <LoadingState label="backend health" />}
      {health.error && (
        <ErrorState
          title="Backend unavailable"
          message="Could not load API health status. Ensure backend is running on http://localhost:8080 and Vite dev proxy is active (or set VITE_API_BASE_URL)."
        />
      )}

      {health.data && (
        <div className="panel">
          <h3>Backend status</h3>
          <ul>
            <li>Service: {health.data.service}</li>
            <li>Status: {health.data.status}</li>
            <li>Timestamp: {new Date(health.data.timestamp).toLocaleString()}</li>
          </ul>
        </div>
      )}

      <form className="panel settings-form" onSubmit={onSave}>
        <h3>Player Profile</h3>
        <label htmlFor="nickname">Nickname</label>
        <input id="nickname" value={nickname} maxLength={50} onChange={(event) => setNickname(event.target.value)} />

        <label htmlFor="difficulty">Preferred Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
        >
          <option value="STANDARD">STANDARD</option>
          <option value="HARDENED">HARDENED</option>
          <option value="NIGHTMARE">NIGHTMARE</option>
        </select>

        <button type="submit">Save Profile</button>
        <h3>Console Audio Mix</h3>
        <label htmlFor="uiVolume">UI clicks: {audioPrefs.uiVolume}%</label>
        <input
          id="uiVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.uiVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, uiVolume: Number(event.target.value) }))}
        />

        <label htmlFor="ambienceVolume">Data-center hum: {audioPrefs.ambienceVolume}%</label>
        <input
          id="ambienceVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.ambienceVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, ambienceVolume: Number(event.target.value) }))}
        />

        <label htmlFor="ariaBeepVolume">ARIA voice beep: {audioPrefs.ariaBeepVolume}%</label>
        <input
          id="ariaBeepVolume"
          type="range"
          min={0}
          max={100}
          value={audioPrefs.ariaBeepVolume}
          onChange={(event) => setAudioPrefs((prev) => ({ ...prev, ariaBeepVolume: Number(event.target.value) }))}
        />
        {status && <p>{status}</p>}
        {saveError && <p>{saveError}</p>}
      </form>
    </section>
  );
}
