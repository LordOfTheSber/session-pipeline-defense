import { Link } from 'react-router-dom';
import { getStoredDifficulty } from '@/shared/lib/profilePrefs';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { gameApi } from '@/shared/api/gameApi';
import { getStoredLanguage, t } from '@/shared/lib/i18n';

export function MainMenuPage() {
  const preferredDifficulty = getStoredDifficulty();
  const locale = getStoredLanguage();
  const dailyChallenge = useAsyncResource(() => gameApi.getDailyChallenge());
  const pipelineStatus = dailyChallenge.data ? (locale === 'ru' ? 'ОБНАРУЖЕН SURGE' : 'SURGE DETECTED') : 'PIPELINE NOMINAL';

  return (
    <section>
      <h2>{locale === 'ru' ? 'Терминал подразделения OmniData' : 'OmniData Division Terminal'}</h2>
      <p>
        STATUS: <strong>{pipelineStatus}</strong>
      </p>
      <p>{locale === 'ru' ? 'Размещайте временные сессии и обрабатывайте входящие данные до перегрузки пайплайна.' : 'Deploy short-lived Sessions to process incoming Data before the pipeline hits an overload breach.'}</p>
      <div className="card-grid">
        <Link to="/play?mode=FIRST_SHIFT" className="menu-card">
          <h3>{locale === 'ru' ? 'НАЧАТЬ СМЕНУ' : 'BEGIN SHIFT'}</h3>
          <p>{locale === 'ru' ? 'Сюжетное обучение: ARIA проведёт Оператора-7 через безопасную мини-волну.' : 'Story onboarding: ARIA walks Operator-7 through a safe mini-wave without modal tutorials.'}</p>
        </Link>
        <Link to={`/play?difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>{t(locale, 'nextShift')}</h3>
          <p>{locale === 'ru' ? `Запустите бесконечный режим с давлением по линиям на сложности ${preferredDifficulty}.` : `Begin endless survival with lane-based data pressure at ${preferredDifficulty}.`}</p>
        </Link>
        <Link to={`/play?mode=TIMED&duration=180&difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>{t(locale, 'timed3m')}</h3>
          <p>{locale === 'ru' ? 'Продержитесь 3 минуты и наберите максимум очков.' : 'Survive for 3 minutes and maximize score.'}</p>
        </Link>
        <Link to={`/play?mode=TIMED&duration=300&difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>{t(locale, 'timed5m')}</h3>
          <p>{locale === 'ru' ? 'Продержитесь 5 минут в ограниченном по времени режиме.' : 'Survive for 5 minutes in a fixed-duration run.'}</p>
        </Link>
        <Link to={`/play?mode=DAILY&difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>{locale === 'ru' ? 'РЕКОНСТРУКЦИЯ' : 'RECONSTRUCTION'}</h3>
          <p>{locale === 'ru' ? 'Восстановите сегодняшний архивный фрагмент и сыграйте детерминированный daily seed.' : 'Recover today&apos;s archive fragment and run the deterministic challenge seed.'}</p>
        </Link>
        <Link to="/leaderboards" className="menu-card">
          <h3>{locale === 'ru' ? 'РЕЙТИНГИ' : 'RANKINGS'}</h3>
          <p>{locale === 'ru' ? 'Просмотр глобальной и ежедневной производительности.' : 'Review global and daily throughput performance.'}</p>
        </Link>
        <Link to="/codex" className="menu-card">
          <h3>CODEX</h3>
          <p>{locale === 'ru' ? 'Просмотрите открытые термины лора и восстановленные фрагменты логов.' : 'Review unlocked lore terms and recovered log fragments.'}</p>
        </Link>
        <Link to="/settings" className="menu-card">
          <h3>{locale === 'ru' ? 'НАСТРОЙКИ' : 'PREFERENCES'}</h3>
          <p>{locale === 'ru' ? 'Параметры консоли, никнейм, доступность и сложность по умолчанию.' : 'Console preferences, nickname, accessibility, and default difficulty.'}</p>
        </Link>
      </div>
    </section>
  );
}
