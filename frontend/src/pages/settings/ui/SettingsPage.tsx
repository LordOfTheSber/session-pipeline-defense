import { gameApi } from '@/shared/api/gameApi';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ErrorState, LoadingState } from '@/shared/ui/ResourceState';

export function SettingsPage() {
  const health = useAsyncResource(() => gameApi.getHealth(), []);

  return (
    <section>
      <h2>Profile & Settings</h2>
      <p>Nickname and preference persistence is planned for Phase 8.</p>

      {health.isLoading && <LoadingState label="backend health" />}
      {health.error && (
        <ErrorState
          title="Backend unavailable"
          message="Could not load API health status. Ensure backend is running on http://localhost:8080 and Vite dev proxy is active (or set VITE_API_BASE_URL)."
        />
      )}

      {health.data && (
        <div className="panel">
          <h3>Backend status</h3>
          <ul>
            <li>Service: {health.data.service}</li>
            <li>Status: {health.data.status}</li>
            <li>Timestamp: {new Date(health.data.timestamp).toLocaleString()}</li>
          </ul>
        </div>
      )}

      <div className="panel">Coming soon: nickname, difficulty preference, and challenge defaults.</div>
    </section>
  );
}
