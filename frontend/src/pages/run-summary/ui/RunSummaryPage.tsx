import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

function ariaAssessment(score: number): string {
  if (score >= 3000) {
    return '// above expectations';
  }
  if (score >= 1300) {
    return '// adequate';
  }
  return '// we need to talk';
}

export function RunSummaryPage() {
  const [searchParams] = useSearchParams();
  const nickname = getStoredNickname();
  const runIdFromQuery = useMemo(() => searchParams.get('runId'), [searchParams]);

  const loadRunHistory = useCallback(() => gameApi.getPlayerRuns(nickname, 25), [nickname]);
  const runHistory = useAsyncResource(loadRunHistory);

  const sortedRunHistory = useMemo(
    () => [...(runHistory.data ?? [])].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
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
      <h2>SHIFT REPORT</h2>
      <p>
        Select a shift for <strong>{nickname}</strong>. Records are sorted by date (newest first).
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
          <label htmlFor="run-select">Choose shift</label>{' '}
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
          <p>No shifts found for this nickname yet. Complete at least one run first.</p>
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
        <div className="panel panel-accent">
          <p>Operator: {runSummary.data.nicknameSnapshot}</p>
          <p>Run ID: {runSummary.data.id}</p>
          <ul>
            <li>Shift duration: {runSummary.data.survivalSeconds}s</li>
            <li>Processed packets: {runSummary.data.processedCount}</li>
            <li>Peak surge cycle: {runSummary.data.waveReached}</li>
            <li>Mode: {runSummary.data.mode}</li>
            <li>Difficulty: {runSummary.data.difficulty}</li>
            <li>Score: {runSummary.data.score}</li>
            <li>ARIA assessment: {ariaAssessment(runSummary.data.score)}</li>
            <li>Validation: {runSummary.data.suspicious ? `Flagged (${runSummary.data.validationNotes ?? 'No notes'})` : 'Clean'}</li>
          </ul>
          <p>
            <Link to="/play">NEXT SHIFT</Link> · <Link to="/codex">ARCHIVE</Link> · <Link to="/leaderboards">LEADERBOARD</Link>
          </p>
        </div>
      )}

      {!selectedRunId && !runHistory.isLoading && !runHistory.error && (
        <div className="panel">
          <p>Pick a run from the list above to view details.</p>
        </div>
      )}
    </section>
  );
}
