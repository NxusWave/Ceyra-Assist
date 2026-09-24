import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHub from './pages/DashboardHub';
import AssistLayout from './layouts/AssistLayout';
import AssistDashboard from './pages/AssistDashboard';
import EmbedSettingsPage from './pages/EmbedSettingsPage';
import ConversationsPage from './pages/ConversationsPage';
import AccountPage from './pages/AccountPage';
import AuthSessionManager from './components/AuthSessionManager';
import AssistOverviewPage from './pages/AssistOverviewPage';
import ChatbotsListPage from './pages/ChatbotsListPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      {/* Keeps sessions alive across visits; ends them only on manual
          sign-out or after the inactivity timeout. */}
      <AuthSessionManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Persistent console shell (sidebar + top bar) for /dashboard/* */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHub />} />
          <Route path="assist" element={<AssistLayout />}>
            <Route index element={<AssistOverviewPage />} />
            <Route path="chatbots" element={<ChatbotsListPage />} />
            <Route path="builder" element={<AssistDashboard />} />
            <Route path="embed" element={<EmbedSettingsPage />} />
            <Route path="conversations" element={<ConversationsPage />} />
          </Route>
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Routes>
    </>
  );
}
