import { useEffect, useState } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import type { Difficulty, LeaderboardEntry } from '@/shared/types/api';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';
import { getIsoDateToday, LEADERBOARD_LIMIT } from '../model/constants';

function LeaderboardTable({ title, entries }: { title: string; entries: LeaderboardEntry[] }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p>No runs submitted yet.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nickname</th>
              <th>Score</th>
              <th>Difficulty</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.runId}>
                <td>{index + 1}</td>
                <td>{entry.nickname}</td>
                <td>{entry.score}</td>
                <td>{entry.difficulty}</td>
                <td>{entry.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function LeaderboardPage() {
  const today = getIsoDateToday();
  const [difficulty, setDifficulty] = useState<Difficulty>('STANDARD');
  const [refreshTick, setRefreshTick] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const timer = window.setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, 20000);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoRefresh]);

  const globalLeaderboard = useAsyncResource(
    () => gameApi.getGlobalLeaderboard(LEADERBOARD_LIMIT, difficulty),
    [difficulty, refreshTick],
  );
  const dailyLeaderboard = useAsyncResource(
    () => gameApi.getDailyLeaderboard(today, LEADERBOARD_LIMIT, difficulty),
    [today, difficulty, refreshTick],
  );

  return (
    <section>
      <h2>Leaderboards</h2>
      <p>Global and daily leaderboard data is loaded from persistence-backed backend APIs.</p>

      <div className="panel leaderboard-controls">
        <label htmlFor="lb-difficulty">Difficulty</label>
        <select id="lb-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          <option value="STANDARD">STANDARD</option>
          <option value="HARDENED">HARDENED</option>
          <option value="NIGHTMARE">NIGHTMARE</option>
        </select>
        <label>
          <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /> Auto-refresh (20s)
        </label>
        <button type="button" onClick={() => setRefreshTick((value) => value + 1)}>
          Refresh now
        </button>
      </div>

      {globalLeaderboard.isLoading ? (
        <LoadingState label="global leaderboard" />
      ) : globalLeaderboard.error ? (
        <ErrorState
          title="Global leaderboard unavailable"
          message="The global leaderboard API endpoint is not available yet. Check backend connectivity and run ingestion status."
        />
      ) : (
        <LeaderboardTable title="Global Throughput" entries={globalLeaderboard.data ?? []} />
      )}

      {dailyLeaderboard.isLoading ? (
        <LoadingState label={`daily leaderboard (${today})`} />
      ) : dailyLeaderboard.error ? (
        <ErrorState
          title="Daily leaderboard unavailable"
          message={`The daily leaderboard API endpoint for ${today} is not available yet. Check backend connectivity and run ingestion status.`}
        />
      ) : (
        <LeaderboardTable title={`Daily Challenge — ${today}`} entries={dailyLeaderboard.data ?? []} />
      )}
    </section>
  );
}
