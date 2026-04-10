interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return <div className="panel state-loading">Loading {label}…</div>;
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
    </div>
  );
}
