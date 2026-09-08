import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sliders, Code2, LayoutDashboard, ArrowLeft, Loader2 } from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import { AssistProvider, useAssistContext } from '../contexts/AssistContext';

function AssistLayoutInner() {
  const { loading } = useAssistContext();
  const location = useLocation();
  const isEmbedTab = location.pathname === '/dashboard/assist/embed';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col items-center justify-center relative font-sans isolate overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <CeyraLogo className="w-12 h-12 animate-pulse" />
            <div className="absolute -inset-2 bg-violet-600/20 blur-lg rounded-full -z-10" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            <span>Loading Assist...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 font-sans">
      <div className="w-full max-w-7xl mx-auto p-6 sm:p-8 lg:p-10 pb-0">
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="pb-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
              Chatbots
            </span>
            <span className="text-[11px] text-gray-400 font-mono">Product: assist</span>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Hub</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Link
            to="/dashboard/assist"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors ${
              !isEmbedTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Chatbot Builder</span>
          </Link>
          <Link
            to="/dashboard/assist/embed"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors ${
              isEmbedTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Embed & Allowed Domains</span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-10">
        <Outlet />
      </div>
    </div>
  );
}

export default function AssistLayout() {
  return (
    <AssistProvider>
      <AssistLayoutInner />
    </AssistProvider>
  );
}
