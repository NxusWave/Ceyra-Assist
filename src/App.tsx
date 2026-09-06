import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardHub from './pages/DashboardHub';
import AssistDashboard from './pages/AssistDashboard';
import AuthSessionManager from './components/AuthSessionManager';

export default function App() {
  return (
    <>
      {/* Keeps sessions alive across visits; ends them only on manual
          sign-out or after the inactivity timeout. */}
      <AuthSessionManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardHub />} />
        <Route path="/dashboard/assist" element={<AssistDashboard />} />
      </Routes>
    </>
  );
}

