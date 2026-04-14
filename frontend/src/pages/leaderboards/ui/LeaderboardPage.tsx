import { useCallback, useEffect, useState } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { getStoredLanguage } from '@/shared/lib/i18n';
import type { Difficulty, LeaderboardEntry } from '@/shared/types/api';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';
import { getIsoDateToday, LEADERBOARD_LIMIT } from '../model/constants';

function LeaderboardTable({ title, entries }: { title: string; entries: LeaderboardEntry[] }) {
  const locale = getStoredLanguage();
  return (
    <div className="panel">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <div className="empty-state">
          <p>{locale === 'ru' ? 'Для этой сложности пока нет отправленных попыток.' : 'No runs submitted yet for this difficulty.'}</p>
          <p>{locale === 'ru' ? 'Совет: завершите попытку в режиме игры и обновите страницу.' : 'Tip: complete a run in Play mode, then refresh this page.'}</p>
        </div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{locale === 'ru' ? 'Никнейм' : 'Nickname'}</th>
              <th>{locale === 'ru' ? 'Счёт' : 'Score'}</th>
              <th>{locale === 'ru' ? 'Сложность' : 'Difficulty'}</th>
              <th>{locale === 'ru' ? 'Режим' : 'Mode'}</th>
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
  const locale = getStoredLanguage();
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

  const dailyChallenge = useAsyncResource(() => gameApi.getDailyChallenge());

  const loadGlobalLeaderboard = useCallback(
    () => {
      void refreshTick;
      return gameApi.getGlobalLeaderboard(LEADERBOARD_LIMIT, difficulty);
    },
    [difficulty, refreshTick],
  );
  const globalLeaderboard = useAsyncResource(loadGlobalLeaderboard);

  const loadDailyLeaderboard = useCallback(
    () => {
      void refreshTick;
      return gameApi.getDailyLeaderboard(today, LEADERBOARD_LIMIT, difficulty);
    },
    [today, difficulty, refreshTick],
  );
  const dailyLeaderboard = useAsyncResource(loadDailyLeaderboard);

  return (
    <section>
      <h2>{locale === 'ru' ? 'Консоль рейтингов' : 'Rankings Console'}</h2>
      <p>
        {locale === 'ru'
          ? 'Глобальные и ежедневные рейтинги из backend API с персистентным хранилищем.'
          : 'Global throughput + daily reconstruction standings from persistence-backed backend APIs.'}
      </p>

      <div className="panel leaderboard-controls">
        <label htmlFor="lb-difficulty">{locale === 'ru' ? 'Сложность' : 'Difficulty'}</label>
        <select id="lb-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          <option value="STANDARD">STANDARD</option>
          <option value="HARDENED">HARDENED</option>
          <option value="NIGHTMARE">NIGHTMARE</option>
        </select>
        <label>
          <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />{' '}
          {locale === 'ru' ? 'Автообновление (20с)' : 'Auto-refresh (20s)'}
        </label>
        <button type="button" onClick={() => setRefreshTick((value) => value + 1)}>
          {locale === 'ru' ? 'Обновить' : 'Refresh now'}
        </button>
        <span className="muted">{locale === 'ru' ? `Дата последнего запроса: ${today}` : `Last query date: ${today}`}</span>
      </div>

      {globalLeaderboard.isLoading ? (
        <LoadingState label={locale === 'ru' ? 'глобальный лидерборд' : 'global leaderboard'} />
      ) : globalLeaderboard.error ? (
        <ErrorState
          title={locale === 'ru' ? 'Глобальный лидерборд недоступен' : 'Global leaderboard unavailable'}
          message={
            locale === 'ru'
              ? 'API глобального лидерборда пока недоступен. Проверьте подключение backend и статус приёма результатов.'
              : 'The global leaderboard API endpoint is not available yet. Check backend connectivity and run ingestion status.'
          }
        />
      ) : (
        <LeaderboardTable title={locale === 'ru' ? 'Глобальная пропускная способность' : 'Global Throughput'} entries={globalLeaderboard.data ?? []} />
      )}

      {dailyChallenge.data && (
        <div className="panel panel-daily-log">
          <h3>{dailyChallenge.data.logTitle}</h3>
          <p>{dailyChallenge.data.logExcerpt}</p>
        </div>
      )}

      {dailyLeaderboard.isLoading ? (
        <LoadingState label={locale === 'ru' ? `ежедневный лидерборд (${today})` : `daily leaderboard (${today})`} />
      ) : dailyLeaderboard.error ? (
        <ErrorState
          title={locale === 'ru' ? 'Ежедневный лидерборд недоступен' : 'Daily leaderboard unavailable'}
          message={
            locale === 'ru'
              ? `API ежедневного лидерборда для ${today} пока недоступен. Проверьте backend и статус приёма результатов.`
              : `The daily leaderboard API endpoint for ${today} is not available yet. Check backend connectivity and run ingestion status.`
          }
        />
      ) : (
        <LeaderboardTable title={locale === 'ru' ? `РЕЙТИНГ РЕКОНСТРУКЦИИ — ${today}` : `RECONSTRUCTION RANKINGS — ${today}`} entries={dailyLeaderboard.data ?? []} />
      )}
    </section>
  );
}
