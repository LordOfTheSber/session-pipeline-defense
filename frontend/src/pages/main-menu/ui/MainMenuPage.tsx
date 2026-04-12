import { Link } from 'react-router-dom';
import { getStoredDifficulty } from '@/shared/lib/profilePrefs';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { gameApi } from '@/shared/api/gameApi';

export function MainMenuPage() {
  const preferredDifficulty = getStoredDifficulty();
  const dailyChallenge = useAsyncResource(() => gameApi.getDailyChallenge());
  const pipelineStatus = dailyChallenge.data ? 'SURGE DETECTED' : 'PIPELINE NOMINAL';

  return (
    <section>
      <h2>OmniData Division Terminal</h2>
      <p>
        STATUS: <strong>{pipelineStatus}</strong>
      </p>
      <p>
        Deploy short-lived <strong>Sessions</strong> to process incoming <strong>Data</strong> before the pipeline hits an overload
        breach.
      </p>
      <div className="card-grid">
        <Link to="/play?mode=FIRST_SHIFT" className="menu-card">
          <h3>BEGIN SHIFT</h3>
          <p>Story onboarding: ARIA walks Operator-7 through a safe mini-wave without modal tutorials.</p>
        </Link>
        <Link to={`/play?difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>NEXT SHIFT</h3>
          <p>Begin endless survival with lane-based data pressure at {preferredDifficulty}.</p>
        </Link>
        <Link to={`/play?mode=DAILY&difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>RECONSTRUCTION</h3>
          <p>Recover today&apos;s archive fragment and run the deterministic challenge seed.</p>
        </Link>
        <Link to="/leaderboards" className="menu-card">
          <h3>RANKINGS</h3>
          <p>Review global and daily throughput performance.</p>
        </Link>
        <Link to="/codex" className="menu-card">
          <h3>CODEX</h3>
          <p>Review unlocked lore terms and recovered log fragments.</p>
        </Link>
        <Link to="/settings" className="menu-card">
          <h3>PREFERENCES</h3>
          <p>Console preferences, nickname, accessibility, and default difficulty.</p>
        </Link>
      </div>
    </section>
  );
}
