import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, CheckCircle2, Upload, Send, Trash2, Palette, Check, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

type ReplyLanguage = 'Auto-detect' | 'Sinhala' | 'Tamil' | 'English';
type Tone = 'Friendly' | 'Formal' | 'Casual';

interface Props {
  mode: 'create' | 'edit';
  chatbotId?: string;
  onSaved: (id: string) => void;
}

const BLANK_DEFAULTS = {
  chatbotName: 'New Chatbot',
  publicAgentName: 'Ceyra Assistant',
  primaryColor: '#8B5CF6',
  replyLanguage: 'Auto-detect' as ReplyLanguage,
  tone: 'Friendly' as Tone,
  welcomeMessage: 'Hi! How can I help you today?',
};

export default function ChatbotBuilderForm({ mode, chatbotId, onSaved }: Props) {
  const { business, canCreateBot } = useAssistContext();

  const [fetchingExisting, setFetchingExisting] = useState(mode === 'edit');
  const [chatbotName, setChatbotName] = useState(BLANK_DEFAULTS.chatbotName);
  const [publicAgentName, setPublicAgentName] = useState(BLANK_DEFAULTS.publicAgentName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState(BLANK_DEFAULTS.primaryColor);
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>(BLANK_DEFAULTS.replyLanguage);
  const [tone, setTone] = useState<Tone>(BLANK_DEFAULTS.tone);
  const [welcomeMessage, setWelcomeMessage] = useState(BLANK_DEFAULTS.welcomeMessage);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string }>
  >([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== 'edit' || !chatbotId) {
      setFetchingExisting(false);
      return;
    }
    let isMounted = true;
    (async () => {
      const { data } = await supabase.from('chatbots').select('*').eq('id', chatbotId).single();
      if (data && isMounted) {
        setChatbotName(data.chatbot_name || BLANK_DEFAULTS.chatbotName);
        setPublicAgentName(data.public_agent_name || BLANK_DEFAULTS.publicAgentName);
        setAvatarPreview(data.avatar_url || null);
        setPrimaryColor(data.primary_color || BLANK_DEFAULTS.primaryColor);
        setReplyLanguage((data.reply_language as ReplyLanguage) || BLANK_DEFAULTS.replyLanguage);
        setTone((data.tone as Tone) || BLANK_DEFAULTS.tone);
        setWelcomeMessage(data.welcome_message || BLANK_DEFAULTS.welcomeMessage);
      }
      if (isMounted) setFetchingExisting(false);
    })();
    return () => { isMounted = false; };
  }, [mode, chatbotId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [chatMessages, isTyping]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    const businessId = business?.id;
    if (!businessId) {
      setSaveError('Business profile not loaded. Please reload the page.');
      return;
    }
    if (mode === 'create' && !canCreateBot) {
      setSaveError("You've reached your plan's chatbot limit. Upgrade to add more.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let finalAvatarUrl: string | null = avatarPreview && !avatarPreview.startsWith('blob:') ? avatarPreview : null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const path = `${businessId}/avatar-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('chatbot-avatars')
          .upload(path, avatarFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from('chatbot-avatars').getPublicUrl(path);
        finalAvatarUrl = publicUrlData?.publicUrl || null;
        setAvatarFile(null);
      }

      const fields = {
        chatbot_name: chatbotName,
        public_agent_name: publicAgentName,
        avatar_url: finalAvatarUrl,
        primary_color: primaryColor,
        reply_language: replyLanguage,
        tone: tone,
        welcome_message: welcomeMessage,
      };

      if (mode === 'edit' && chatbotId) {
        const { error: updateError } = await supabase
          .from('chatbots')
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq('id', chatbotId);
        if (updateError) throw updateError;
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 3000);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/chatbot-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ businessId }),
        });
        const result = await response.json();
        if (!response.ok || !result.chatbot?.id) {
          throw new Error(result.error || 'Failed to create chatbot.');
        }
        const newId = result.chatbot.id;
        const { error: updateError } = await supabase.from('chatbots').update(fields).eq('id', newId);
        if (updateError) throw updateError;
        onSaved(newId);
      }
    } catch (err: any) {
      console.error('Error saving chatbot:', err);
      setSaveError(err.message || 'Failed to save chatbot configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/hero-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          businessName: business?.name,
          chatbotName: publicAgentName,
          tone: tone,
          replyLanguage: replyLanguage,
        }),
      });
      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || "Sorry, I could not generate a response.", time: 'Just now' },
      ]);
    } catch (err) {
      console.error('Simulator error:', err);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Sorry, I'm having trouble responding right now. Please try again.", time: 'Just now' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const colorPresets = [
    { label: 'Violet', value: '#8B5CF6' },
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Sky', value: '#0EA5E9' },
  ];

  if (fetchingExisting) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-400 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        <span>Loading chatbot...</span>
      </div>
    );
  }

  const businessDisplayName = business?.name || 'Your Business';

  return (
    <div>
      <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {mode === 'create' ? 'Create a New Chatbot' : 'Edit Chatbot'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure branding, trilingual behavior, persona, and greetings for your assistant.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : mode === 'create' ? 'Create Chatbot' : 'Save Changes'}</span>
        </button>
      </div>

      {saveError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      {savedNotification && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Chatbot configuration updated!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-2">
              <label className="block text-sm font-semibold text-gray-200">Chatbot Name</label>
              <p className="text-xs text-gray-400">Internal identifier for this agent in your Ceyra console.</p>
              <input
                type="text"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder="e.g. Colombo Bakery Support"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-200">Agent Persona & Avatar</h3>
                <p className="text-xs text-gray-400">The public identity shown to your customers on the chat widget.</p>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <div
                  className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-8 h-8" style={{ color: primaryColor }} />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      <span>Upload Avatar</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">Recommended: 256x256 PNG or JPG with transparent background.</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Public Agent Name</label>
                <input
                  type="text"
                  value={publicAgentName}
                  onChange={(e) => setPublicAgentName(e.target.value)}
                  placeholder="e.g. Ceyra Assistant or Asha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200">Brand Color Accent</h3>
                  <p className="text-xs text-gray-400">Applied to widget headers, bubbles, and interactive highlights.</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-white/20 shadow" style={{ backgroundColor: primaryColor }} />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setPrimaryColor(preset.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      primaryColor === preset.value ? 'border-white bg-white/10 text-white' : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.value }} />
                    <span>{preset.label}</span>
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <Palette className="w-3.5 h-3.5 text-gray-500" />
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-200">Trilingual Behavior & Tone</h3>
                <p className="text-xs text-gray-400">Engineered specifically for Sri Lankan conversational nuance.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Primary Language Mode</label>
                  <select
                    value={replyLanguage}
                    onChange={(e) => setReplyLanguage(e.target.value as ReplyLanguage)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Auto-detect" className="bg-[#111115] text-white">Auto-detect (Sinhala / Tamil / English)</option>
                    <option value="Sinhala" className="bg-[#111115] text-white">Sinhala (සිංහල & Singlish)</option>
                    <option value="Tamil" className="bg-[#111115] text-white">Tamil (தமிழ் & Tanglish)</option>
                    <option value="English" className="bg-[#111115] text-white">English (Global)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Tone of Voice</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Friendly', 'Formal', 'Casual'] as Tone[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`py-2 px-2 text-center text-xs rounded-xl font-medium border transition-colors ${
                          tone === t ? 'bg-violet-600/20 text-violet-300 border-violet-500/40' : 'bg-white/[0.02] text-gray-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-200">Welcome Greeting Message</label>
                <span className="text-[10px] text-gray-500">{welcomeMessage.length} characters</span>
              </div>
              <p className="text-xs text-gray-400">The initial greeting displayed as soon as a visitor opens the chat.</p>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-xl shadow-violet-600/25 transition-all flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : mode === 'create' ? 'Create Chatbot' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <h3 className="text-sm font-semibold text-white">Live Simulator Preview</h3>
            </div>
            <span className="text-[11px] text-gray-500">Updates live with your changes</span>
          </div>

          <div className="rounded-3xl bg-[#0E0E12] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[580px] relative">
            <div className="p-4 flex items-center justify-between text-white shadow-md transition-colors" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{publicAgentName}</h4>
                  <p className="text-[10px] text-white/80 leading-none mt-0.5">{businessDisplayName} · Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs font-mono">
                <span>{tone}</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0A0B]/60">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-xs bg-white/5 border border-white/10 text-xs text-gray-200 leading-relaxed shadow-sm">
                  {welcomeMessage}
                </div>
              </div>

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'text-white rounded-tr-xs shadow-md' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-xs shadow-sm'
                    }`}
                    style={msg.sender === 'user' ? { backgroundColor: primaryColor } : undefined}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 w-fit text-gray-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-200" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-[#0E0E12] border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Test reply in Sinhala, Tamil, or English..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>Trilingual Mode: {replyLanguage}</span>
            </span>
            <span className="text-emerald-400 font-medium">Ready to Deploy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
