import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Settings, Pause, Play, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

export default function ChatbotsListPage() {
  const {
    chatbots,
    botLimit,
    canCreateBot,
    setActiveChatbot,
    refreshChatbots,
    loading,
  } = useAssistContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The Overview cards deep-link here with ?filter=online / ?filter=paused so
  // the list shows exactly the chatbots behind the number that was clicked.
  const filter = searchParams.get('filter');

  const visibleBots = useMemo(() => {
    if (filter === 'online') {
      return chatbots.filter((b: any) => (b.status || 'active') === 'active');
    }
    if (filter === 'paused') {
      return chatbots.filter((b: any) => (b.status || 'active') !== 'active');
    }
    return chatbots;
  }, [chatbots, filter]);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleManage = (id: string) => {
    setActiveChatbot(id);
    // Deep-link the builder into this chatbot's details (edit mode) — from
    // there its Embed and Conversations views are one click away.
    navigate(`/dashboard/assist/builder?bot=${id}`);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setActionError(null);
    try {
      const { error } = await supabase
        .from('chatbots')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      if (refreshChatbots) await refreshChatbots();
    } catch (err: any) {
      setActionError(err?.message || 'Could not update this chatbot. Please try again.');
    }
  };

  const handleCreate = () => {
    if (!canCreateBot) {
      navigate('/dashboard/account');
      return;
    }
    // The builder opens in "create new" mode; saving there creates the bot.
    navigate('/dashboard/assist/builder');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Chatbots</h1>
          <p className="text-sm text-gray-400">
            {chatbots.length} of {botLimit} chatbots used
            {filter
              ? ` — showing ${visibleBots.length} ${filter === 'online' ? 'online' : 'paused'}`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {filter && (
            <Link
              to="/dashboard/assist/chatbots"
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filter</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Chatbot</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-gray-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          <span>Loading your chatbots...</span>
        </div>
      ) : visibleBots.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-10 text-center space-y-3">
          <p className="text-sm text-gray-300">
            {filter
              ? `No ${filter === 'online' ? 'online' : 'paused'} chatbots right now.`
              : 'No chatbots yet.'}
          </p>
          {filter ? (
            <Link
              to="/dashboard/assist/chatbots"
              className="inline-block text-xs text-violet-400 hover:underline"
            >
              Show all chatbots
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first chatbot</span>
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleBots.map((bot: any) => {
          const status = bot.status || 'active';
          const color = bot.primary_color || '#8B5CF6';
          return (
            <div
              key={bot.id}
              className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 flex flex-col justify-between hover:border-violet-500/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="text-sm font-bold text-white truncate">{bot.chatbot_name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {status === 'active' ? 'Online' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Created {new Date(bot.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => handleManage(bot.id)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(bot.id, status)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    status === 'active'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {status === 'active' ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
