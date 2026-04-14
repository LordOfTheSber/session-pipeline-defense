import { getStoredLanguage } from '@/shared/lib/i18n';

interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const locale = getStoredLanguage();
  return (
    <div className="panel state-loading">
      {locale === 'ru'
        ? `Загрузка ${label}… Если это длится дольше нескольких секунд, проверьте логи backend.`
        : `Loading ${label}… If this takes more than a few seconds, check backend logs.`}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
}

export function ErrorState({ title, message }: ErrorStateProps) {
  const locale = getStoredLanguage();
  return (
    <div className="panel state-error" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      <p className="muted">
        {locale === 'ru'
          ? 'Повторите попытку после проверки доступности API и контейнера PostgreSQL.'
          : 'Retry after confirming API service and PostgreSQL container are reachable.'}
      </p>
    </div>
  );
}
