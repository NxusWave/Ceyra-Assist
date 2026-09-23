import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Code2,
  MessageSquare,
  LayoutDashboard,
  LayoutGrid,
  Home,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import { AssistProvider, useAssistContext } from '../contexts/AssistContext';

function BotSwitcherDropdown({ mobile = false }: { mobile?: boolean }) {
  const { chatbotId, chatbots, botLimit, canCreateBot, createChatbot, setActiveChatbot } =
    useAssistContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeBot = chatbots.find((b) => b.id === chatbotId) || chatbots[0];
  const activeColor = activeBot?.primary_color || '#8B5CF6';
  const activeName = activeBot?.chatbot_name || 'My Chatbot';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectBot = (id: string) => {
    setActiveChatbot(id);
    setIsOpen(false);
  };

  const handleCreateOrUpgrade = async () => {
    if (!canCreateBot) {
      setIsOpen(false);
      navigate('/dashboard/account');
      return;
    }
    setIsCreating(true);
    try {
      const newBotId = await createChatbot();
      if (newBotId) {
        navigate('/dashboard/assist/builder');
      }
    } finally {
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${mobile ? 'w-full' : 'inline-block'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs text-gray-200 transition-colors ${
          mobile ? 'w-full justify-between py-2' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: activeColor }}
          />
          <span className="font-medium text-white truncate max-w-[160px] sm:max-w-[220px]">
            {activeName}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 rounded-2xl bg-[#121216]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
            mobile ? 'left-0 right-0 w-full' : 'left-0 w-72'
          }`}
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-white/10 flex items-center justify-between">
            <span>Switch Chatbot</span>
            <span className="text-gray-500 font-mono text-[10px]">
              {chatbots.length}/{botLimit}
            </span>
          </div>

          <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
            {chatbots.map((bot) => {
              const isSelected = bot.id === activeBot?.id;
              const color = bot.primary_color || '#8B5CF6';
              return (
                <button
                  key={bot.id}
                  type="button"
                  onClick={() => handleSelectBot(bot.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-violet-600/15 text-white border border-violet-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate font-medium">{bot.chatbot_name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 mt-1 border-t border-white/10">
            {canCreateBot ? (
              <button
                type="button"
                onClick={handleCreateOrUpgrade}
                disabled={isCreating}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-600/10 transition-colors text-left"
              >
                {isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isCreating ? 'Creating Chatbot...' : '+ New Chatbot'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateOrUpgrade}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors text-left group"
              >
                <span className="text-[11px]">
                  {chatbots.length} of {botLimit} chatbots used —{' '}
                  <span className="text-violet-400 font-semibold group-hover:underline">
                    Upgrade
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssistLayoutInner() {
  const { loading } = useAssistContext();
  const location = useLocation();
  const isOverviewTab = location.pathname === '/dashboard/assist';
  const isChatbotsTab = location.pathname === '/dashboard/assist/chatbots';
  const isBuilderTab = location.pathname === '/dashboard/assist/builder';
  const isEmbedTab = location.pathname === '/dashboard/assist/embed';
  const isConversationsTab = location.pathname === '/dashboard/assist/conversations';

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
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
              Chatbots
            </span>
            <div className="hidden sm:block">
              <BotSwitcherDropdown />
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Hub</span>
          </Link>
        </div>

        {/* Mobile Bot Switcher Row */}
        <div className="sm:hidden pt-3">
          <BotSwitcherDropdown mobile />
        </div>

        <div className="flex items-center gap-2 pt-2 overflow-x-auto">
          <Link
            to="/dashboard/assist"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
              isOverviewTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </Link>
          <Link
            to="/dashboard/assist/chatbots"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
              isChatbotsTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Chatbots</span>
          </Link>
          <Link
            to="/dashboard/assist/builder"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
              isBuilderTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Chatbot Builder</span>
          </Link>
          <Link
            to="/dashboard/assist/embed"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
              isEmbedTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Embed & Allowed Domains</span>
          </Link>
          <Link
            to="/dashboard/assist/conversations"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
              isConversationsTab
                ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Conversations</span>
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
