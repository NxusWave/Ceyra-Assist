import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Pause, Play } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

export default function ChatbotsListPage() {
  const { chatbots, botLimit, canCreateBot, refreshChatbots } = useAssistContext();
  const navigate = useNavigate();

  const handleManage = (id: string) => {
    navigate(`/dashboard/assist/bots/${id}`);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await supabase.from('chatbots').update({ status: newStatus }).eq('id', id);
    if (refreshChatbots) await refreshChatbots();
  };

  const handleCreate = () => {
    navigate(canCreateBot ? '/dashboard/assist/builder' : '/dashboard/account');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Chatbots</h1>
          <p className="text-sm text-gray-400">
            {chatbots.length} of {botLimit} chatbots used
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Chatbot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {chatbots.map((bot: any) => {
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
    </div>
  );
}
