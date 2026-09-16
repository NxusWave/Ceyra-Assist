import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  ArrowLeft,
  Loader2,
  Inbox,
  User,
  Bot,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useAssistContext } from '../contexts/AssistContext';
import { supabase } from '../lib/supabaseClient';

interface ConversationRow {
  id: string;
  visitor_id: string | null;
  status: string | null;
  started_at: string | null;
  last_message_at: string | null;
}

interface MessageRow {
  role: string;
  content: string;
  created_at: string | null;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '—';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function visitorLabel(id: string | null): string {
  if (!id) return 'Anonymous visitor';
  return `Visitor · ${id.slice(0, 10)}`;
}

export default function ConversationsPage() {
  const { chatbotId } = useAssistContext();

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const loadConversations = useCallback(
    async (showSpinner = false) => {
      if (!chatbotId) return;
      if (showSpinner) setRefreshing(true);
      try {
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('id, visitor_id, status, started_at, last_message_at')
          .eq('chatbot_id', chatbotId)
          .order('last_message_at', { ascending: false, nullsFirst: false })
          .limit(100);

        if (fetchError) throw fetchError;
        setConversations(data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load conversations.');
      } finally {
        if (showSpinner) setRefreshing(false);
        setLoading(false);
      }
    },
    [chatbotId]
  );

  useEffect(() => {
    setLoading(true);
    loadConversations();
  }, [loadConversations]);

  // Light auto-refresh so new visitor messages show up without a manual reload
  useEffect(() => {
    const interval = setInterval(() => loadConversations(), 20000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const openConversation = async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setMessagesError(null);
    setMessagesLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err: any) {
      setMessagesError(err?.message || 'Failed to load messages.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const selected = conversations.find((c) => c.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Conversations
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Live chat history between visitors and your AI assistant.
          </p>
        </div>
        <button
          type="button"
          id="conversations-refresh-btn"
          onClick={() => loadConversations(true)}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-sm text-gray-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          <span>Loading conversations...</span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/25 text-violet-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No conversations yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Embed the widget on your website using the{' '}
            <span className="text-violet-300">Embed &amp; Allowed Domains</span> tab. Visitor
            chats will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
          {/* Conversation list */}
          <div
            className={`rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden ${
              selectedId ? 'hidden lg:block' : ''
            }`}
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
              <span>All conversations ({conversations.length})</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-white/5">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => openConversation(convo.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors ${
                    selectedId === convo.id
                      ? 'bg-violet-600/10 border-l-2 border-violet-500'
                      : 'hover:bg-white/[0.04] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-2 text-xs font-semibold text-white truncate">
                      <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      {visitorLabel(convo.visitor_id)}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        (convo.status || '').toLowerCase() === 'open'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      {convo.status || 'open'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    {relativeTime(convo.last_message_at || convo.started_at)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message viewer */}
          <div
            className={`rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden ${
              !selectedId ? 'hidden lg:flex' : 'flex'
            } flex-col min-h-[420px] lg:min-h-[520px]`}
          >
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/25 text-violet-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-400 max-w-[220px] mx-auto leading-relaxed">
                    Select a conversation from the list to view the full message history.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Detail header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="lg:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {visitorLabel(selected.visitor_id)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Started {relativeTime(selected.started_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      (selected.status || '').toLowerCase() === 'open'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {selected.status || 'open'}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b0b0e]">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12 text-xs text-gray-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                      <span>Loading messages...</span>
                    </div>
                  ) : messagesError ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                      {messagesError}
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">
                      No messages recorded in this conversation.
                    </p>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-br-md'
                              : 'bg-white/[0.06] text-gray-200 border border-white/10 rounded-bl-md'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 opacity-70">
                            {msg.role === 'user' ? (
                              <User className="w-3 h-3" />
                            ) : (
                              <Bot className="w-3 h-3 text-violet-400" />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              {msg.role === 'user' ? 'Visitor' : 'Assistant'}
                            </span>
                          </div>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-gray-600 mt-1 px-1">
                          {relativeTime(msg.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}