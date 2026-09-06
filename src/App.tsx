import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardHub from './pages/DashboardHub';
import AssistDashboard from './pages/AssistDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardHub />} />
      <Route path="/dashboard/assist" element={<AssistDashboard />} />
    </Routes>
  );
}

