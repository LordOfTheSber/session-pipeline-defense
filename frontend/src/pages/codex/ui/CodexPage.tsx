import { useCallback, useMemo } from 'react';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { loreCodex, initialRecoveredLogs } from '@/narrative/codex';

const LOCKED_SLOTS = 6;

export function CodexPage() {
  const nickname = getStoredNickname();
  const loadNarrativeState = useCallback(() => gameApi.getNarrativeState(nickname), [nickname]);
  const narrativeState = useAsyncResource(loadNarrativeState);

  const unlockedLogs = useMemo(() => {
    const introSeen = narrativeState.data?.seenBeatKeys.includes('act1.init_shift');
    return introSeen ? initialRecoveredLogs : [];
  }, [narrativeState.data?.seenBeatKeys]);

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
          <p>[ENCRYPTED] Complete First Shift to unlock initial recovered logs.</p>
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
