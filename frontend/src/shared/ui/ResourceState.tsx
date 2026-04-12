interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return <div className="panel state-loading">Loading {label}… If this takes more than a few seconds, check backend logs.</div>;
}

interface ErrorStateProps {
  title: string;
  message: string;
}

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <div className="panel state-error" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      <p className="muted">Retry after confirming API service and PostgreSQL container are reachable.</p>
    </div>
  );
}
