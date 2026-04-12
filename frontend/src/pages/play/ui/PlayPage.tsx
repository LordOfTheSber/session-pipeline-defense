import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gameApi } from '@/shared/api/gameApi';
import { ApiError } from '@/shared/api/http';
import { getStoredDifficulty, getStoredNickname } from '@/shared/lib/profilePrefs';
import { getStoredLanguage, t } from '@/shared/lib/i18n';
import type { DailyChallengeResponse, Difficulty, RunSubmissionResponse } from '@/shared/types/api';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';
import { act1AriaLines } from '@/narrative/acts/act1';
import {
  HUD_UPDATE_EVENT,
  PIPELINE_EVENT,
  PIPELINE_PAUSE_EVENT,
  RUN_COMPLETE_EVENT,
  type PipelineEventPayload,
  type PipelineHudPayload,
  type PipelineRunOptions,
} from '@/entities/pipeline/ui/PipelineScene';
import { PhaserGameCanvas } from '../../../widgets/phaser-game/ui/PhaserGameCanvas';

type LocalRunSummary = {
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  creditsSpent: number;
  systemHealthEnd: number;
  activeSessionPeak: number;
  score: number;
  mode: 'ENDLESS' | 'DAILY' | 'FIRST_SHIFT' | 'TIMED';
  difficulty: Difficulty;
  challengeDate?: string;
  challengeSeed?: number;
};

const ARIA_LINE_EVENT = 'session-defense:aria-scripted-line';
const ARIA_COOLDOWN_MS = 3500;

function pickAriaLine(type: PipelineEventPayload['type']): string | null {
  const triggerMap: Partial<Record<PipelineEventPayload['type'], string[]>> = {
    'run.start': ['run.start'],
    'session.placed': ['session.first_placed'],
    'session.expired': ['session.first_expired'],
    'data.corrupted': ['data.corrupted_first_seen'],
    'data.leaked': ['data.first_leaked'],
    'wave.start': ['wave.first_start', 'wave.reached_5'],
    'health.critical': ['health.critical'],
    'run.loss': ['run.loss'],
  };

  const triggers = triggerMap[type] ?? [];
  const pool = act1AriaLines.filter((line) => triggers.includes(line.trigger));
  if (!pool.length) {
    return null;
  }

  return pool.sort((a, b) => b.priority - a.priority)[0].text;
}

function renderIntegrityBar(percent: number): string {
  const clamped = Math.max(0, Math.min(percent, 100));
  const filled = Math.round(clamped / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

export function PlayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawMode = searchParams.get('mode');
  const mode: PipelineRunOptions['mode'] =
    rawMode === 'DAILY' ? 'DAILY' : rawMode === 'FIRST_SHIFT' ? 'FIRST_SHIFT' : rawMode === 'TIMED' ? 'TIMED' : 'ENDLESS';
  const timedDuration = Number(searchParams.get('duration') ?? 180);
  const queryDifficulty = searchParams.get('difficulty');
  const storedDifficulty = getStoredDifficulty();
  const selectedDifficulty: Difficulty =
    queryDifficulty === 'HARDENED' || queryDifficulty === 'NIGHTMARE' || queryDifficulty === 'STANDARD'
      ? queryDifficulty
      : storedDifficulty;

  const nickname = getStoredNickname();
  const locale = getStoredLanguage();
  const [paused, setPaused] = useState(false);
  const [summary, setSummary] = useState<LocalRunSummary | null>(null);
  const [submittedRun, setSubmittedRun] = useState<RunSubmissionResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ariaLine, setAriaLine] = useState(locale === 'ru' ? 'Канал ARIA в ожидании событий...' : 'ARIA link idle... awaiting event stream.');
  const [typedLine, setTypedLine] = useState('');
  const [hud, setHud] = useState<PipelineHudPayload | null>(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [dailyStarted, setDailyStarted] = useState(mode !== 'DAILY');
  const lastAriaAtRef = useRef(0);

  const loadDailyChallenge = useCallback(
    () => (mode === 'DAILY' ? gameApi.getDailyChallenge() : Promise.resolve(null)),
    [mode],
  );
  const dailyChallenge = useAsyncResource(loadDailyChallenge);

  const loadNarrativeState = useCallback(() => gameApi.getNarrativeState(nickname), [nickname]);
  const narrativeState = useAsyncResource(loadNarrativeState);
  const firstShiftSeen = Boolean(narrativeState.data?.seenBeatKeys.includes('act1.init_shift'));

  const runOptions = useMemo<PipelineRunOptions>(() => {
    if (mode === 'DAILY' && dailyChallenge.data) {
      return {
        mode: 'DAILY',
        difficulty: selectedDifficulty,
        challengeDate: dailyChallenge.data.challengeDate,
        challengeSeed: dailyChallenge.data.seed,
        locale,
      };
    }

    if (mode === 'FIRST_SHIFT') {
      return { mode: 'FIRST_SHIFT', difficulty: 'STANDARD', locale };
    }
    if (mode === 'TIMED') {
      return { mode: 'TIMED', difficulty: selectedDifficulty, timeLimitSeconds: Math.max(60, timedDuration), locale };
    }

    return { mode: 'ENDLESS', difficulty: selectedDifficulty, locale };
  }, [dailyChallenge.data, locale, mode, selectedDifficulty, timedDuration]);

  useEffect(() => {
    setDailyStarted(mode !== 'DAILY');
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypedLine((current) => {
        if (current.length >= ariaLine.length) {
          return current;
        }

        return ariaLine.slice(0, current.length + 1);
      });
    }, 22);

    return () => clearInterval(timer);
  }, [ariaLine]);

  useEffect(() => {
    setTypedLine('');
  }, [ariaLine]);

  const markDailyLogSeen = useCallback(async (challenge: DailyChallengeResponse | null) => {
    if (!challenge) {
      return;
    }

    await gameApi.markNarrativeSeen({
      nickname,
      beatKey: challenge.narrativeBeatKey,
    });
  }, [nickname]);

  useEffect(() => {
    const onRunComplete = async (event: Event) => {
      const customEvent = event as CustomEvent<LocalRunSummary>;
      const runSummary = customEvent.detail;
      if (runSummary.mode === 'FIRST_SHIFT') {
        setShowBriefing(true);
        await gameApi.markNarrativeSeen({ nickname, beatKey: 'act1.init_shift' });
        return;
      }

      if (runSummary.mode === 'DAILY') {
        await markDailyLogSeen(dailyChallenge.data);
      }

      setSummary(runSummary);
      setSubmitError(null);
      setSubmittedRun(null);

      try {
        const { mode: summaryMode, ...summaryRest } = runSummary;
        const persistMode = summaryMode === 'DAILY' ? 'DAILY' : 'ENDLESS';
        const response = await gameApi.submitRun({
          nickname,
          ...summaryRest,
          mode: persistMode,
        });
        setSubmittedRun(response);
      } catch (error) {
        if (error instanceof ApiError) {
          const detailText = error.details?.length ? ` (${error.details.join(' | ')})` : '';
          setSubmitError(`Run submission failed: ${error.message}${detailText}`);
          return;
        }
        setSubmitError('Run submission failed. Backend may be unavailable.');
      }
    };

    const onPipelineEvent = (event: Event) => {
      const detail = (event as CustomEvent<PipelineEventPayload>).detail;
      if (Date.now() - lastAriaAtRef.current < ARIA_COOLDOWN_MS && detail.type !== 'run.loss') {
        return;
      }

      const line = pickAriaLine(detail.type);
      if (!line) {
        return;
      }

      setAriaLine(line);
      lastAriaAtRef.current = Date.now();
    };

    const onScriptedLine = (event: Event) => {
      const line = (event as CustomEvent<{ line: string }>).detail.line;
      setAriaLine(line);
      lastAriaAtRef.current = Date.now();
    };

    const onHudUpdate = (event: Event) => {
      setHud((event as CustomEvent<PipelineHudPayload>).detail);
    };

    window.addEventListener(RUN_COMPLETE_EVENT, onRunComplete);
    window.addEventListener(PIPELINE_EVENT, onPipelineEvent);
    window.addEventListener(ARIA_LINE_EVENT, onScriptedLine);
    window.addEventListener(HUD_UPDATE_EVENT, onHudUpdate);

    return () => {
      window.removeEventListener(RUN_COMPLETE_EVENT, onRunComplete);
      window.removeEventListener(PIPELINE_EVENT, onPipelineEvent);
      window.removeEventListener(ARIA_LINE_EVENT, onScriptedLine);
      window.removeEventListener(HUD_UPDATE_EVENT, onHudUpdate);
    };
  }, [dailyChallenge.data, markDailyLogSeen, nickname]);

  const onSkipFirstShift = () => {
    const confirmed = window.confirm('// ARIA: понял, ты уже бывал здесь. Пропустить первую смену?');
    if (confirmed) {
      navigate(`/play?difficulty=${selectedDifficulty}`);
    }
  };

  const onTogglePause = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    window.dispatchEvent(new CustomEvent(PIPELINE_PAUSE_EVENT, { detail: { paused: nextPaused } }));
  };

  return (
    <section className={mode === 'DAILY' ? 'daily-mode-shell' : undefined}>
      <h2>{t(locale, 'divisionConsole')}</h2>
      <p>
        {t(locale, 'activeOperator')}: <strong>{nickname}</strong>. {t(locale, 'mode')}: <strong>{mode}</strong>. {t(locale, 'difficulty')}:{' '}
        <strong>{runOptions.mode === 'FIRST_SHIFT' ? 'STANDARD' : selectedDifficulty}</strong>.
      </p>
      {mode === 'TIMED' && <p>{locale === 'ru' ? `Лимит времени: ${runOptions.timeLimitSeconds}s.` : `Time limit: ${runOptions.timeLimitSeconds}s.`}</p>}
      {(mode === 'ENDLESS' || mode === 'DAILY' || mode === 'TIMED') && (
        <button type="button" onClick={onTogglePause}>
          {paused ? t(locale, 'resume') : t(locale, 'pause')}
        </button>
      )}

      <div className="panel panel-console">
        <div className="metrics-grid">
          <div>INTEGRITY {renderIntegrityBar(hud?.integrityPercent ?? 100)} {hud?.integrityPercent ?? 100}%</div>
          <div>COMPUTE {hud?.credits ?? 0} ¢</div>
          <div>SURGE CYCLE {String(hud?.wave ?? 1).padStart(2, '0')}</div>
          <div>THROUGHPUT {hud?.processed ?? 0}</div>
          <div>SHIFT {hud?.timeSeconds ?? 0}s</div>
          <div>SESSION PROFILE {hud?.selectedSessionLabel ?? 'Light Session'}</div>
        </div>
      </div>

      <div className="aria-panel" role="status" aria-live="polite">
        <div className="aria-tag">// ARIA</div>
        <div className="aria-line">{typedLine}</div>
      </div>

      {mode === 'FIRST_SHIFT' && firstShiftSeen && (
        <div className="panel panel-accent">
          <h3>{locale === 'ru' ? 'Обнаружен повторный оператор' : 'Repeat operator detected'}</h3>
          <p>{locale === 'ru' ? 'Пропустите обучение и сразу перейдите в бесконечный режим.' : 'Skip onboarding and jump directly into live Endless operations.'}</p>
          <button type="button" onClick={onSkipFirstShift}>
            {locale === 'ru' ? 'Пропустить первую смену' : 'Skip first shift'}
          </button>
        </div>
      )}

      {mode === 'DAILY' && dailyChallenge.isLoading && <LoadingState label="daily challenge seed" />}
      {mode === 'DAILY' && dailyChallenge.error && (
        <ErrorState
          title="Daily challenge unavailable"
          message="Could not load today's deterministic challenge from /api/challenges/daily. Please retry or play Endless mode."
        />
      )}
      {mode === 'DAILY' && dailyChallenge.data && (
        <div className="panel panel-daily-log">
          <h3>{dailyChallenge.data.logTitle}</h3>
          <p className="muted">{dailyChallenge.data.actReference}</p>
          <p>{dailyChallenge.data.logExcerpt}</p>
          <p>
            Seed <code>{dailyChallenge.data.seed}</code> · leaderboard window <code>{dailyChallenge.data.leaderboardWindowKey}</code>
          </p>
          {!dailyStarted && (
            <button type="button" onClick={() => setDailyStarted(true)}>
              {locale === 'ru' ? 'НАЧАТЬ РЕКОНСТРУКЦИЮ' : 'BEGIN RECONSTRUCTION'}
            </button>
          )}
        </div>
      )}

      {(mode === 'ENDLESS' || mode === 'FIRST_SHIFT' || mode === 'TIMED' || (dailyChallenge.data && dailyStarted)) && (
        <PhaserGameCanvas runOptions={runOptions} />
      )}

      {showBriefing && (
        <div className="panel panel-accent">
          <h3>{locale === 'ru' ? 'БРИФИНГ СМЕНЫ ЗАВЕРШЁН' : 'SHIFT BRIEFING COMPLETE'}</h3>
          <p>
            Callsign acknowledged for <strong>{nickname}</strong>. Endless and Daily queues are unlocked. First Codex fragment is now
            available.
          </p>
          <p>
            <button type="button" onClick={() => navigate('/codex')}>
              {locale === 'ru' ? 'Открыть кодекс' : 'Open Codex'}
            </button>{' '}
            <button type="button" onClick={() => navigate(`/play?difficulty=${selectedDifficulty}`)}>
              {locale === 'ru' ? 'Начать бесконечную смену' : 'Begin Endless Shift'}
            </button>
          </p>
        </div>
      )}

      {summary && (
        <div className="panel">
          <h3>{locale === 'ru' ? 'Результат последней смены' : 'Latest Shift Outcome'}</h3>
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

      {narrativeState.isLoading && <LoadingState label="narrative state" />}
      {narrativeState.error && <p className="muted">Narrative progression service unavailable; onboarding state may not persist.</p>}
    </section>
  );
}
