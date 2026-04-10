import { Link } from 'react-router-dom';

export function MainMenuPage() {
  return (
    <section>
      <h2>Main Menu</h2>
      <p>
        Deploy short-lived <strong>Sessions</strong> to process incoming <strong>Data</strong> before the pipeline hits an overload
        breach.
      </p>
      <div className="card-grid">
        <Link to="/play" className="menu-card">
          <h3>Start Run</h3>
          <p>Begin a survival run with lane-based data pressure.</p>
        </Link>
        <Link to="/leaderboards" className="menu-card">
          <h3>Leaderboards</h3>
          <p>Review global and daily throughput performance.</p>
        </Link>
        <Link to="/settings" className="menu-card">
          <h3>Profile & Settings</h3>
          <p>Set nickname and preferred difficulty defaults.</p>
        </Link>
      </div>
    </section>
  );
}
