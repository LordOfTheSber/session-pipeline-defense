import { useCallback } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { getStoredNickname } from '@/shared/lib/profilePrefs';
import { getStoredLanguage } from '@/shared/lib/i18n';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function RunHistoryPage() {
  const nickname = getStoredNickname();
  const locale = getStoredLanguage();
  const loadRunHistory = useCallback(() => gameApi.getPlayerRuns(nickname, 15), [nickname]);
  const runHistory = useAsyncResource(loadRunHistory);

  return (
    <section>
      <h2>{locale === 'ru' ? 'История попыток' : 'Run History'}</h2>
      <p>
        {locale === 'ru'
          ? <>Последние попытки для <strong>{nickname}</strong> загружены из <code>/api/players/{`{nickname}`}/runs</code>.</>
          : <>Recent runs for <strong>{nickname}</strong> loaded from <code>/api/players/{`{nickname}`}/runs</code>.</>}
      </p>

      {runHistory.isLoading && <LoadingState label={locale === 'ru' ? 'история попыток игрока' : 'player run history'} />}
      {runHistory.error && (
        <ErrorState
          title={locale === 'ru' ? 'История попыток недоступна' : 'Run history unavailable'}
          message={
            locale === 'ru'
              ? 'Не удалось загрузить историю попыток. Сначала сохраните профиль и проверьте, что backend запущен.'
              : 'Could not load player run history. Save your profile first and ensure backend is running.'
          }
        />
      )}

      {runHistory.data && (
        <div className="panel">
          {runHistory.data.length === 0 ? (
            <div className="empty-state">
              <p>{locale === 'ru' ? 'Для этого никнейма пока нет попыток.' : 'No runs found yet for this nickname.'}</p>
              <p>
                {locale === 'ru'
                  ? 'Запустите бесконечный режим и завершите хотя бы одну попытку — таблица заполнится автоматически.'
                  : 'Start an Endless run, finish once, and this table will populate automatically.'}
              </p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>{locale === 'ru' ? 'Когда' : 'When'}</th>
                  <th>{locale === 'ru' ? 'Режим' : 'Mode'}</th>
                  <th>{locale === 'ru' ? 'Сложность' : 'Difficulty'}</th>
                  <th>{locale === 'ru' ? 'Счёт' : 'Score'}</th>
                  <th>{locale === 'ru' ? 'Волна' : 'Wave'}</th>
                  <th>{locale === 'ru' ? 'Обработано' : 'Processed'}</th>
                  <th>{locale === 'ru' ? 'Выживание' : 'Survival'}</th>
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
