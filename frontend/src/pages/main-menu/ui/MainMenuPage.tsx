import { Link } from 'react-router-dom';
import { getStoredDifficulty } from '@/shared/lib/profilePrefs';

export function MainMenuPage() {
  const preferredDifficulty = getStoredDifficulty();

  return (
    <section>
      <h2>Main Menu</h2>
      <p>
        Deploy short-lived <strong>Sessions</strong> to process incoming <strong>Data</strong> before the pipeline hits an overload
        breach.
      </p>
      <div className="card-grid">
        <Link to={`/play?difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>Endless Run</h3>
          <p>Begin endless survival with lane-based data pressure at {preferredDifficulty}.</p>
        </Link>
        <Link to={`/play?mode=DAILY&difficulty=${preferredDifficulty}`} className="menu-card">
          <h3>Daily Challenge</h3>
          <p>Play today’s server-seeded deterministic challenge run.</p>
        </Link>
        <Link to="/leaderboards" className="menu-card">
          <h3>Leaderboards</h3>
          <p>Review global and daily throughput performance.</p>
        </Link>
        <Link to="/run-history" className="menu-card">
          <h3>Run History</h3>
          <p>Inspect your recent runs for the saved nickname.</p>
        </Link>
        <Link to="/settings" className="menu-card">
          <h3>Profile & Settings</h3>
          <p>Set nickname and preferred difficulty defaults.</p>
        </Link>
      </div>
    </section>
  );
}
