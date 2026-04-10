import { useEffect, useState } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import type { RunSubmissionResponse } from '@/shared/types/api';
import { PhaserGameCanvas } from '../../../widgets/phaser-game/ui/PhaserGameCanvas';

type LocalRunSummary = {
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  creditsSpent: number;
  systemHealthEnd: number;
  activeSessionPeak: number;
  score: number;
  mode: 'ENDLESS';
  difficulty: 'STANDARD';
};

const RUN_COMPLETE_EVENT = 'session-defense:run-complete';

export function PlayPage() {
  const [summary, setSummary] = useState<LocalRunSummary | null>(null);
  const [submittedRun, setSubmittedRun] = useState<RunSubmissionResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      <PhaserGameCanvas />

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
