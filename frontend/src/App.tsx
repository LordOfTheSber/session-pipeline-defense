import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MainMenuPage } from './pages/MainMenuPage';
import { PlayPage } from './pages/PlayPage';
import { RunSummaryPage } from './pages/RunSummaryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/leaderboards" element={<LeaderboardPage />} />
        <Route path="/run-summary" element={<RunSummaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
