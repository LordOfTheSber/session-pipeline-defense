import { NavLink, Outlet } from 'react-router-dom';
import { getStoredLanguage } from '@/shared/lib/i18n';
export function AppLayout() {
  const locale = getStoredLanguage();

  const navItems = [
    { to: '/', label: locale === 'ru' ? 'Главная' : 'Main Menu' },
    { to: '/play', label: locale === 'ru' ? 'Игра' : 'Play' },
    { to: '/leaderboards', label: locale === 'ru' ? 'Рейтинг' : 'Leaderboards' },
    { to: '/run-summary', label: locale === 'ru' ? 'Отчёт' : 'Run Summary' },
    { to: '/run-history', label: locale === 'ru' ? 'История' : 'Run History' },
    { to: '/codex', label: 'Codex' },
    { to: '/settings', label: locale === 'ru' ? 'Настройки' : 'Settings' },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{locale === 'ru' ? 'Защита сессионного пайплайна' : 'Session Pipeline Defense'}</h1>
          <p>{locale === 'ru' ? 'Операционная консоль встречает аркадную оборону линий.' : 'Ops dashboard meets arcade lane defense.'}</p>
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
