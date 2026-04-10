import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Main Menu' },
  { to: '/play', label: 'Play' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/run-summary', label: 'Run Summary' },
  { to: '/settings', label: 'Settings' },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Session Pipeline Defense</h1>
          <p>Ops dashboard meets arcade lane defense.</p>
        </div>
        <nav>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active-link' : '')}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
