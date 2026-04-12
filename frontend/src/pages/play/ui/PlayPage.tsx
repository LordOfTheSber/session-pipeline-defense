import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';
import type { RunSubmissionResponse } from '@/shared/types/api';
import type { PipelineRunOptions } from '@/entities/pipeline/ui/PipelineScene';
import { PhaserGameCanvas } from '../../../widgets/phaser-game/ui/PhaserGameCanvas';

type LocalRunSummary = {
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  creditsSpent: number;
  systemHealthEnd: number;
  activeSessionPeak: number;
  score: number;
  mode: 'ENDLESS' | 'DAILY';
  difficulty: 'STANDARD';
  challengeDate?: string;
  challengeSeed?: number;
};

const RUN_COMPLETE_EVENT = 'session-defense:run-complete';

export function PlayPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'DAILY' ? 'DAILY' : 'ENDLESS';
  const [summary, setSummary] = useState<LocalRunSummary | null>(null);
  const [submittedRun, setSubmittedRun] = useState<RunSubmissionResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dailyChallenge = useAsyncResource(
    () => (mode === 'DAILY' ? gameApi.getDailyChallenge() : Promise.resolve(null)),
    [mode],
  );

  const runOptions = useMemo<PipelineRunOptions>(() => {
    if (mode === 'DAILY' && dailyChallenge.data) {
      return {
        mode: 'DAILY',
        difficulty: 'STANDARD',
        challengeDate: dailyChallenge.data.challengeDate,
        challengeSeed: dailyChallenge.data.seed,
      };
    }

    return { mode: 'ENDLESS', difficulty: 'STANDARD' };
  }, [dailyChallenge.data, mode]);

  useEffect(() => {
    const onRunComplete = async (event: Event) => {
      const customEvent = event as CustomEvent<LocalRunSummary>;
      const runSummary = customEvent.detail;
      setSummary(runSummary);
      setSubmitError(null);
      setSubmittedRun(null);

      try {
        const response = await gameApi.submitRun({
          nickname: 'operator',
          ...runSummary,
        });
        setSubmittedRun(response);
      } catch {
        setSubmitError('Run submission failed. Backend may be unavailable.');
      }
    };

    window.addEventListener(RUN_COMPLETE_EVENT, onRunComplete);
    return () => {
      window.removeEventListener(RUN_COMPLETE_EVENT, onRunComplete);
    };
  }, []);

  return (
    <section>
      <h2>Play</h2>
      <p>
        Phase 5 gameplay is live: deploy archetyped Sessions with TTL/capacity limits, survive escalating Data
        waves, and review your run summary on system overload.
      </p>
      {mode === 'DAILY' && dailyChallenge.isLoading && <LoadingState label="daily challenge seed" />}
      {mode === 'DAILY' && dailyChallenge.error && (
        <ErrorState
          title="Daily challenge unavailable"
          message="Could not load today's deterministic challenge from /api/challenges/daily. Please retry or play Endless mode."
        />
      )}
      {mode === 'DAILY' && dailyChallenge.data && (
        <div className="panel">
          <h3>Daily Challenge ({dailyChallenge.data.challengeDate})</h3>
          <p>
            Seed <code>{dailyChallenge.data.seed}</code> with modifiers:
          </p>
          <ul>
            {Object.entries(dailyChallenge.data.challengeModifiers).map(([key, value]) => (
              <li key={key}>
                {key}: <strong>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(mode === 'ENDLESS' || dailyChallenge.data) && <PhaserGameCanvas runOptions={runOptions} />}

      {summary && (
        <div className="panel">
          <h3>Latest Run Summary</h3>
          <ul>
            <li>Mode: {summary.mode}</li>
            <li>Difficulty: {summary.difficulty}</li>
            <li>Score: {summary.score}</li>
            <li>Processed Data: {summary.processedCount}</li>
            <li>Wave Reached: {summary.waveReached}</li>
            <li>Survival Time: {summary.survivalSeconds}s</li>
            <li>Credits Spent: {summary.creditsSpent}</li>
            <li>Peak Active Sessions: {summary.activeSessionPeak}</li>
            <li>Health at End: {summary.systemHealthEnd}</li>
          </ul>

          {submittedRun && (
            <p>
              Persisted run <code>{submittedRun.id}</code>
              {submittedRun.suspicious ? ` (flagged: ${submittedRun.validationNotes ?? 'no notes'})` : ' (validation clean)'}. 
              Visit Run Summary with <code>?runId={submittedRun.id}</code>.
            </p>
          )}

          {submitError && <p>{submitError}</p>}
        </div>
      )}
    </section>
  );
}
