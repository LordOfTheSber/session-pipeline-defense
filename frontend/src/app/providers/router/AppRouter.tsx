import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { LeaderboardPage } from '../../../pages/leaderboards/ui/LeaderboardPage';
import { MainMenuPage } from '../../../pages/main-menu/ui/MainMenuPage';
import { PlayPage } from '../../../pages/play/ui/PlayPage';
import { RunSummaryPage } from '../../../pages/run-summary/ui/RunSummaryPage';
import { SettingsPage } from '../../../pages/settings/ui/SettingsPage';

export function AppRouter() {
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
