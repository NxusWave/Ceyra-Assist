import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Circle, Inbox } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

interface RecentMessage {
  id: string;
  content: string;
  role: string;
  created_at: string;
  chatbot_name: string;
}

interface DayCount {
  date: string;
  label: string;
  count: number;
}

export default function AssistOverviewPage() {
  const { chatbots } = useAssistContext();
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [trend, setTrend] = useState<DayCount[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [totalConvos, setTotalConvos] = useState(0);
  const [loading, setLoading] = useState(true);

  const onlineCount = chatbots.filter((b: any) => (b.status || 'active') === 'active').length;

  useEffect(() => {
    async function load() {
      if (chatbots.length === 0) {
        setLoading(false);
        return;
      }
      const botIds = chatbots.map((b) => b.id);
      const botNameById: Record<string, string> = {};
      chatbots.forEach((b) => { botNameById[b.id] = b.chatbot_name; });

      const { data: convos } = await supabase
        .from('conversations')
        .select('id, chatbot_id, status, started_at')
        .in('chatbot_id', botIds);

      const convoToBotId: Record<string, string> = {};
      (convos || []).forEach((c) => { convoToBotId[c.id] = c.chatbot_id; });

      setTotalConvos((convos || []).length);
      setOpenCount((convos || []).filter((c) => c.status === 'open').length);

      // Build a 14-day trend, filling in zero-count days
      const days: DayCount[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({
          date: key,
          label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          count: 0,
        });
      }
      const dayIndex: Record<string, number> = {};
      days.forEach((d, idx) => { dayIndex[d.date] = idx; });

      (convos || []).forEach((c) => {
        const key = (c.started_at || '').slice(0, 10);
        if (dayIndex[key] !== undefined) {
          days[dayIndex[key]].count += 1;
        }
      });
      setTrend(days);

      const convoIds = (convos || []).map((c) => c.id);
      if (convoIds.length > 0) {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, role, created_at, conversation_id')
          .in('conversation_id', convoIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentMessages(
          (messages || []).map((m) => ({
            id: m.id,
            content: m.content,
            role: m.role,
            created_at: m.created_at,
            chatbot_name: botNameById[convoToBotId[m.conversation_id]] || 'Unknown bot',
          }))
        );
      }

      setLoading(false);
    }
    load();
  }, [chatbots]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
        <p className="text-sm text-gray-400">A snapshot across all your Assist chatbots.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
          <p className="text-[11px] text-gray-400 mb-1">Total Chatbots</p>
          <p className="text-xl font-bold text-white">{chatbots.length}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
          <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            Online
          </p>
          <p className="text-xl font-bold text-white">{onlineCount}/{chatbots.length}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
          <p className="text-[11px] text-gray-400 mb-1">Total Conversations</p>
          <p className="text-xl font-bold text-white">{totalConvos}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
          <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <Inbox className="w-3 h-3" />
            Open
          </p>
          <p className="text-xl font-bold text-white">{openCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Conversations — Last 14 Days
          </p>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-xs text-gray-500">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip
                  contentStyle={{ background: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>Recent Messages</span>
          </div>
          <div className="divide-y divide-white/5 overflow-y-auto flex-1">
            {loading ? (
              <div className="p-5 text-center text-xs text-gray-500">Loading...</div>
            ) : recentMessages.length === 0 ? (
              <div className="p-5 text-center text-xs text-gray-500">
                No messages yet.{' '}
                <Link to="/dashboard/assist/embed" className="text-violet-400 hover:underline">
                  Set up your widget
                </Link>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-600/15 text-violet-300 border border-violet-500/20 truncate max-w-[110px]">
                      {msg.chatbot_name}
                    </span>
                    <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {msg.role === 'user' ? 'Visitor: ' : ''}
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
