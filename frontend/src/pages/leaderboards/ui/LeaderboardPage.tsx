import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';
import type { LeaderboardEntry } from '@/shared/types/api';
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

  const globalLeaderboard = useAsyncResource(() => gameApi.getGlobalLeaderboard(LEADERBOARD_LIMIT), []);
  const dailyLeaderboard = useAsyncResource(() => gameApi.getDailyLeaderboard(today, LEADERBOARD_LIMIT), [today]);

  return (
    <section>
      <h2>Leaderboards</h2>
      <p>Shell now uses typed API calls with loading/error states while leaderboard endpoints are implemented in Phase 6.</p>

      {globalLeaderboard.isLoading ? (
        <LoadingState label="global leaderboard" />
      ) : globalLeaderboard.error ? (
        <ErrorState
          title="Global leaderboard unavailable"
          message="The global leaderboard API endpoint is not available yet. This is expected until Phase 6 backend work is complete."
        />
      ) : (
        <LeaderboardTable title="Global Throughput" entries={globalLeaderboard.data ?? []} />
      )}

      {dailyLeaderboard.isLoading ? (
        <LoadingState label={`daily leaderboard (${today})`} />
      ) : dailyLeaderboard.error ? (
        <ErrorState
          title="Daily leaderboard unavailable"
          message={`The daily leaderboard API endpoint for ${today} is not available yet. This is expected until Phase 6 backend work is complete.`}
        />
      ) : (
        <LeaderboardTable title={`Daily Challenge — ${today}`} entries={dailyLeaderboard.data ?? []} />
      )}
    </section>
  );
}
