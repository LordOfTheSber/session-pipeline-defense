import { useCallback, useMemo } from 'react';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { loreCodex } from '@/narrative/codex';
import { buildDailyLogFromChallenge, fallbackRecoveredLogs } from '@/narrative/dailyLogs';

const LOCKED_SLOTS = 8;

export function CodexPage() {
  const nickname = getStoredNickname();
  const loadNarrativeState = useCallback(() => gameApi.getNarrativeState(nickname), [nickname]);
  const narrativeState = useAsyncResource(loadNarrativeState);
  const dailyChallenge = useAsyncResource(() => gameApi.getDailyChallenge());

  const unlockedLogs = useMemo(() => {
    const seenBeatKeys = new Set(narrativeState.data?.seenBeatKeys ?? []);
    const introSeen = seenBeatKeys.has('act1.init_shift');
    const logs = introSeen ? [...fallbackRecoveredLogs] : [];

    if (dailyChallenge.data && seenBeatKeys.has(dailyChallenge.data.narrativeBeatKey)) {
      logs.push(
        buildDailyLogFromChallenge(
          dailyChallenge.data.challengeDate,
          dailyChallenge.data.logTitle,
          dailyChallenge.data.logExcerpt,
          dailyChallenge.data.actReference,
        ),
      );
    }

    return logs;
  }, [dailyChallenge.data, narrativeState.data?.seenBeatKeys]);

  return (
    <section>
      <h2>Codex Archive</h2>
      <p>Recovered terms and fragments from The Pipeline Wars incident timeline.</p>

      <div className="card-grid">
        <article className="menu-card">
          <h3>Division</h3>
          <p>{loreCodex.division}</p>
        </article>
        <article className="menu-card">
          <h3>The Surge</h3>
          <p>{loreCodex.surge}</p>
        </article>
        <article className="menu-card">
          <h3>ARIA</h3>
          <p>{loreCodex.aria}</p>
        </article>
        <article className="menu-card">
          <h3>Operator-7</h3>
          <p>{loreCodex.operator7}</p>
        </article>
        <article className="menu-card">
          <h3>Pipeline</h3>
          <p>{loreCodex.pipeline}</p>
        </article>
        <article className="menu-card">
          <h3>Session Pool</h3>
          <p>{loreCodex.sessionPool}</p>
        </article>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <h3>Recovered Logs</h3>
        {unlockedLogs.length > 0 ? (
          <ul>
            {unlockedLogs.map((log) => (
              <li key={log.id}>
                <strong>{log.title}</strong>
                <p>{log.excerpt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>[ENCRYPTED] Complete First Shift and finish Daily Reconstruction runs to unlock archive logs.</p>
        )}

        {Array.from({ length: Math.max(0, LOCKED_SLOTS - unlockedLogs.length) }).map((_, index) => (
          <p key={index} className="muted">
            [ENCRYPTED SLOT {String(index + 1).padStart(2, '0')}]
          </p>
        ))}
      </div>
    </section>
  );
}
