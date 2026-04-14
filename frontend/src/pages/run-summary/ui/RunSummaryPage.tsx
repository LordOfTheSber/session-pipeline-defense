import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { getStoredLanguage } from '@/shared/lib/i18n';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

function ariaAssessment(score: number, locale: 'en' | 'ru'): string {
  if (score >= 3000) {
    return locale === 'ru' ? '// выше ожиданий' : '// above expectations';
  }
  if (score >= 1300) {
    return locale === 'ru' ? '// приемлемо' : '// adequate';
  }
  return locale === 'ru' ? '// нам нужно поговорить' : '// we need to talk';
}

export function RunSummaryPage() {
  const locale = getStoredLanguage();
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
      <h2>{locale === 'ru' ? 'ОТЧЁТ СМЕНЫ' : 'SHIFT REPORT'}</h2>
      <p>
        {locale === 'ru'
          ? <>Выберите смену для <strong>{nickname}</strong>. Записи отсортированы по дате (сначала новые).</>
          : <>Select a shift for <strong>{nickname}</strong>. Records are sorted by date (newest first).</>}
      </p>

      {runHistory.isLoading && <LoadingState label={locale === 'ru' ? 'список попыток' : 'run list'} />}
      {runHistory.error && (
        <ErrorState
          title={locale === 'ru' ? 'Список попыток недоступен' : 'Run list unavailable'}
          message={
            locale === 'ru'
              ? 'Не удалось загрузить список попыток. Убедитесь, что никнейм сохранён, а backend запущен.'
              : 'Could not load run history list. Ensure your profile nickname is saved and backend is running.'
          }
        />
      )}

      {sortedRunHistory.length > 0 && (
        <div className="panel">
          <label htmlFor="run-select">{locale === 'ru' ? 'Выберите смену' : 'Choose shift'}</label>{' '}
          <select id="run-select" value={selectedRunId} onChange={(event) => setSelectedRunIdFromList(event.target.value)}>
            {sortedRunHistory.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {new Date(entry.createdAt).toLocaleString()} · {locale === 'ru' ? 'Счёт' : 'Score'} {entry.score} · {entry.mode} · {entry.difficulty}
              </option>
            ))}
          </select>
        </div>
      )}

      {!runHistory.isLoading && !runHistory.error && sortedRunHistory.length === 0 && (
        <div className="panel">
          <p>{locale === 'ru' ? 'Для этого никнейма пока нет смен. Сначала завершите хотя бы одну попытку.' : 'No shifts found for this nickname yet. Complete at least one run first.'}</p>
        </div>
      )}

      {selectedRunId && runSummary.isLoading && <LoadingState label={locale === 'ru' ? 'сводка попытки' : 'run summary'} />}
      {selectedRunId && runSummary.error && (
        <ErrorState
          title={locale === 'ru' ? 'Сводка попытки недоступна' : 'Run summary unavailable'}
          message={
            locale === 'ru'
              ? `Попытку ${selectedRunId} не удалось загрузить. Убедитесь, что запись существует и backend запущен.`
              : `Run ${selectedRunId} could not be loaded. Ensure the run exists and backend services are running.`
          }
        />
      )}

      {runSummary.data && (
        <div className="panel panel-accent">
          <p>{locale === 'ru' ? 'Оператор' : 'Operator'}: {runSummary.data.nicknameSnapshot}</p>
          <p>{locale === 'ru' ? 'ID попытки' : 'Run ID'}: {runSummary.data.id}</p>
          <ul>
            <li>{locale === 'ru' ? 'Длительность смены' : 'Shift duration'}: {runSummary.data.survivalSeconds}s</li>
            <li>{locale === 'ru' ? 'Обработано пакетов' : 'Processed packets'}: {runSummary.data.processedCount}</li>
            <li>{locale === 'ru' ? 'Пик цикла surge' : 'Peak surge cycle'}: {runSummary.data.waveReached}</li>
            <li>{locale === 'ru' ? 'Режим' : 'Mode'}: {runSummary.data.mode}</li>
            <li>{locale === 'ru' ? 'Сложность' : 'Difficulty'}: {runSummary.data.difficulty}</li>
            <li>{locale === 'ru' ? 'Счёт' : 'Score'}: {runSummary.data.score}</li>
            <li>{locale === 'ru' ? 'Оценка ARIA' : 'ARIA assessment'}: {ariaAssessment(runSummary.data.score, locale)}</li>
            <li>
              {locale === 'ru' ? 'Валидация' : 'Validation'}:{' '}
              {runSummary.data.suspicious
                ? locale === 'ru'
                  ? `Помечено (${runSummary.data.validationNotes ?? 'без заметок'})`
                  : `Flagged (${runSummary.data.validationNotes ?? 'No notes'})`
                : locale === 'ru'
                  ? 'Чисто'
                  : 'Clean'}
            </li>
          </ul>
          <p>
            <Link to="/play">{locale === 'ru' ? 'СЛЕДУЮЩАЯ СМЕНА' : 'NEXT SHIFT'}</Link> · <Link to="/codex">{locale === 'ru' ? 'АРХИВ' : 'ARCHIVE'}</Link> · <Link to="/leaderboards">{locale === 'ru' ? 'ЛИДЕРБОРД' : 'LEADERBOARD'}</Link>
          </p>
        </div>
      )}

      {!selectedRunId && !runHistory.isLoading && !runHistory.error && (
        <div className="panel">
          <p>{locale === 'ru' ? 'Выберите попытку из списка выше, чтобы увидеть детали.' : 'Pick a run from the list above to view details.'}</p>
        </div>
      )}
    </section>
  );
}
