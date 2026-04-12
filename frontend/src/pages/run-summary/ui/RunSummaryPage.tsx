import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function RunSummaryPage() {
  const [searchParams] = useSearchParams();
  const nickname = getStoredNickname();
  const runIdFromQuery = useMemo(() => searchParams.get('runId'), [searchParams]);

  const loadRunHistory = useCallback(() => gameApi.getPlayerRuns(nickname, 25), [nickname]);
  const runHistory = useAsyncResource(loadRunHistory);

  const sortedRunHistory = useMemo(
    () =>
      [...(runHistory.data ?? [])].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [runHistory.data],
  );

  const [selectedRunIdFromList, setSelectedRunIdFromList] = useState<string>('');
  const selectedRunId = runIdFromQuery ?? (selectedRunIdFromList || sortedRunHistory[0]?.id || '');

  const loadRunSummary = useCallback(
    () => (selectedRunId ? gameApi.getRunSummary(selectedRunId) : Promise.resolve(null)),
    [selectedRunId],
  );
  const runSummary = useAsyncResource(loadRunSummary);

  return (
    <section>
      <h2>Run Summary</h2>
      <p>
        Select a game for <strong>{nickname}</strong>. Runs are sorted by date (newest first).
      </p>

      {runHistory.isLoading && <LoadingState label="run list" />}
      {runHistory.error && (
        <ErrorState
          title="Run list unavailable"
          message="Could not load run history list. Ensure your profile nickname is saved and backend is running."
        />
      )}

      {sortedRunHistory.length > 0 && (
        <div className="panel">
          <label htmlFor="run-select">Choose game</label>{' '}
          <select id="run-select" value={selectedRunId} onChange={(event) => setSelectedRunIdFromList(event.target.value)}>
            {sortedRunHistory.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {new Date(entry.createdAt).toLocaleString()} · Score {entry.score} · {entry.mode} · {entry.difficulty}
              </option>
            ))}
          </select>
        </div>
      )}

      {!runHistory.isLoading && !runHistory.error && sortedRunHistory.length === 0 && (
        <div className="panel">
          <p>No games found for this nickname yet. Complete at least one run first.</p>
        </div>
      )}

      {selectedRunId && runSummary.isLoading && <LoadingState label="run summary" />}
      {selectedRunId && runSummary.error && (
        <ErrorState
          title="Run summary unavailable"
          message={`Run ${selectedRunId} could not be loaded. Ensure the run exists and backend services are running.`}
        />
      )}

      {runSummary.data && (
        <div className="panel">
          <p>Run ID: {runSummary.data.id}</p>
          <ul>
            <li>Nickname: {runSummary.data.nicknameSnapshot}</li>
            <li>Processed Data: {runSummary.data.processedCount}</li>
            <li>Wave Reached: {runSummary.data.waveReached}</li>
            <li>Survival Time: {runSummary.data.survivalSeconds}s</li>
            <li>Difficulty: {runSummary.data.difficulty}</li>
            <li>Mode: {runSummary.data.mode}</li>
            <li>Score: {runSummary.data.score}</li>
            <li>Validation: {runSummary.data.suspicious ? `Flagged (${runSummary.data.validationNotes ?? 'No notes'})` : 'Clean'}</li>
          </ul>
        </div>
      )}

      {!selectedRunId && !runHistory.isLoading && !runHistory.error && (
        <div className="panel">
          <p>Pick a run from the list above to view details.</p>
        </div>
      )}

      <div className="panel">
        Tip: you can still open a specific run directly via <code>?runId=&lt;uuid&gt;</code>.
      </div>
    </section>
  );
}
