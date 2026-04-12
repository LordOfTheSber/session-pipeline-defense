import { useCallback } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function RunHistoryPage() {
  const nickname = getStoredNickname();
  const loadRunHistory = useCallback(() => gameApi.getPlayerRuns(nickname, 15), [nickname]);
  const runHistory = useAsyncResource(loadRunHistory);

  return (
    <section>
      <h2>Run History</h2>
      <p>
        Recent runs for <strong>{nickname}</strong> loaded from <code>/api/players/{`{nickname}`}/runs</code>.
      </p>

      {runHistory.isLoading && <LoadingState label="player run history" />}
      {runHistory.error && (
        <ErrorState
          title="Run history unavailable"
          message="Could not load player run history. Save your profile first and ensure backend is running."
        />
      )}

      {runHistory.data && (
        <div className="panel">
          {runHistory.data.length === 0 ? (
            <div className="empty-state">
              <p>No runs found yet for this nickname.</p>
              <p>Start an Endless run, finish once, and this table will populate automatically.</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Mode</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Wave</th>
                  <th>Processed</th>
                  <th>Survival</th>
                </tr>
              </thead>
              <tbody>
                {runHistory.data.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>{entry.mode}</td>
                    <td>{entry.difficulty}</td>
                    <td>{entry.score}</td>
                    <td>{entry.waveReached}</td>
                    <td>{entry.processedCount}</td>
                    <td>{entry.survivalSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
