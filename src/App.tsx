import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHub from './pages/DashboardHub';
import AssistDashboard from './pages/AssistDashboard';
import EmbedSettingsPage from './pages/EmbedSettingsPage';
import AccountPage from './pages/AccountPage';
import AuthSessionManager from './components/AuthSessionManager';

export default function App() {
  return (
    <>
      {/* Keeps sessions alive across visits; ends them only on manual
          sign-out or after the inactivity timeout. */}
      <AuthSessionManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Persistent console shell (sidebar + top bar) for /dashboard/* */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHub />} />
          <Route path="assist" element={<AssistDashboard />} />
          <Route path="assist/embed" element={<EmbedSettingsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Routes>
    </>
  );
}

