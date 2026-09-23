import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Circle, Bot, PauseCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

interface RecentMessage {
  id: string;
  content: string;
  role: string;
  created_at: string;
  conversation_id: string;
  chatbot_id: string;
  chatbot_name: string;
}

export default function AssistOverviewPage() {
  const { chatbots, setActiveChatbot, loading: contextLoading } = useAssistContext();
  const navigate = useNavigate();
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const onlineCount = chatbots.filter((b: any) => (b.status || 'active') === 'active').length;
  const pausedCount = chatbots.length - onlineCount;

  const openBotConversations = (botId: string, conversationId: string) => {
    if (botId) setActiveChatbot(botId);
    navigate('/dashboard/assist/conversations', {
      state: { chatbotId: botId, conversationId },
    });
  };

  useEffect(() => {
    async function loadRecent() {
      if (chatbots.length === 0) {
        setLoading(false);
        return;
      }
      const botIds = chatbots.map((b) => b.id);

      const { data: convos } = await supabase
        .from('conversations')
        .select('id, chatbot_id')
        .in('chatbot_id', botIds)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(50);

      const convoIds = (convos || []).map((c) => c.id);
      const convoToBotId: Record<string, string> = {};
      (convos || []).forEach((c) => { convoToBotId[c.id] = c.chatbot_id; });

      if (convoIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, role, created_at, conversation_id')
        .in('conversation_id', convoIds)
        .order('created_at', { ascending: false })
        .limit(10);

      const botNameById: Record<string, string> = {};
      chatbots.forEach((b) => { botNameById[b.id] = b.chatbot_name; });

      const enriched = (messages || []).map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        created_at: m.created_at,
        conversation_id: m.conversation_id,
        chatbot_id: convoToBotId[m.conversation_id] || '',
        chatbot_name: botNameById[convoToBotId[m.conversation_id]] || 'Unknown bot',
      }));

      setRecentMessages(enriched);
      setLoading(false);
    }
    loadRecent();
  }, [chatbots]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
        <p className="text-sm text-gray-400">
          A snapshot across all your Assist chatbots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/assist/chatbots')}
          className="group text-left rounded-2xl bg-white/[0.02] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.04] p-5 transition-colors"
        >
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-violet-400" />
            Total Chatbots
          </p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-white">{chatbots.length}</p>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-violet-300 transition-colors flex items-center gap-0.5">
              View all
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard/assist/chatbots?filter=online')}
          className="group text-left rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04] p-5 transition-colors"
        >
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            Online Chatbots
          </p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-white">
              {onlineCount} / {chatbots.length}
            </p>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
              View online
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard/assist/chatbots?filter=paused')}
          className="group text-left rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.04] p-5 transition-colors"
        >
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
            Paused Chatbots
          </p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-white">{pausedCount}</p>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-amber-300 transition-colors flex items-center gap-0.5">
              View paused
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>Recent Messages — All Chatbots</span>
          </div>
          <span className="text-[10px] text-gray-500">Last 10 · click to open</span>
        </div>
        <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
          {loading || contextLoading ? (
            <div className="p-6 text-center text-xs text-gray-500">Loading...</div>
          ) : recentMessages.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No messages yet.{' '}
              <Link to="/dashboard/assist/chatbots" className="text-violet-400 hover:underline">
                Open a chatbot to set up its embed widget
              </Link>{' '}
              and start receiving conversations.
            </div>
          ) : (
            recentMessages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => openBotConversations(msg.chatbot_id, msg.conversation_id)}
                title="Open this conversation"
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/15 text-violet-300 border border-violet-500/20 shrink-0 mt-0.5">
                  {msg.chatbot_name}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-300 truncate">
                    <span className="text-gray-500">
                      {msg.role === 'user' ? 'Visitor: ' : msg.role === 'agent' ? 'You: ' : ''}
                    </span>
                    {msg.content}
                  </p>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
