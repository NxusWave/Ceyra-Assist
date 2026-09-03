import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Inbox,
  Code2,
  CreditCard,
  Settings,
  Upload,
  X,
  Sparkles,
  Send,
  Check,
  RotateCcw,
  Menu,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Globe,
  Sliders,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import { supabase } from '../lib/supabaseClient';

type ReplyLanguage = 'Auto-detect' | 'Sinhala' | 'Tamil' | 'English';
type Tone = 'Friendly' | 'Formal' | 'Casual';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Auth & Business State
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Chatbot persistence & editing state
  const [savedChatbotId, setSavedChatbotId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [chatbotName, setChatbotName] = useState('Colombo Boutique Bakery Support');
  const [publicAgentName, setPublicAgentName] = useState('Ceyra Assistant');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi! Welcome to Colombo Boutique Bakery. 🍰 How can I help you with our menu, delivery, or custom cake orders today?'
  );
  const [brandColor, setBrandColor] = useState('#7C3AED');
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>('Auto-detect');
  const [tone, setTone] = useState<Tone>('Friendly');

  // Preview interactive state
  const [testInput, setTestInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);
  const [savedNotification, setSavedNotification] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndBusiness() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          navigate('/', { replace: true });
          return;
        }

        const currentUser = session.user;
        if (isMounted) {
          setUser(currentUser);
        }

        // Check the "businesses" table for a row where owner_id equals the logged-in user's id
        const { data: existingBusinesses, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (fetchError) {
          console.warn('Notice checking businesses table:', fetchError.message);
        }

        if (existingBusinesses && existingBusinesses.length > 0) {
          const currentBusiness = existingBusinesses[0];
          if (isMounted) {
            setBusiness(currentBusiness);
            setBusinessId(currentBusiness.id || null);
            if (currentBusiness.name) {
              setChatbotName(`${currentBusiness.name} Support`);
              setWelcomeMessage(
                `Hi! Welcome to ${currentBusiness.name}. How can I assist you today?`
              );
            }
          }
        } else {
          // If none exists yet, insert one using the user's id as owner_id and name from metadata
          const defaultBusinessName =
            currentUser.user_metadata?.company ||
            currentUser.user_metadata?.full_name ||
            'My Business';

          const { data: newBusiness, error: insertError } = await supabase
            .from('businesses')
            .insert([
              {
                owner_id: currentUser.id,
                name: defaultBusinessName,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.warn('Notice inserting business record:', insertError.message);
          }

          if (isMounted) {
            setBusiness(newBusiness || { owner_id: currentUser.id, name: defaultBusinessName });
            if (newBusiness?.id) {
              setBusinessId(newBusiness.id);
            }
            setChatbotName(`${defaultBusinessName} Support`);
            setWelcomeMessage(
              `Hi! Welcome to ${defaultBusinessName}. How can I assist you today?`
            );
          }
        }
      } catch (err) {
        console.error('Session validation error:', err);
        navigate('/', { replace: true });
        return;
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    }

    checkAuthAndBusiness();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#', active: false },
    { name: 'Chatbots', icon: Bot, href: '#', active: true },
    { name: 'Knowledge Base', icon: BookOpen, href: '#', active: false },
    { name: 'Inbox', icon: Inbox, href: '#', active: false, badge: '3' },
    { name: 'Embed Code', icon: Code2, href: '#', active: false },
    { name: 'Billing', icon: CreditCard, href: '#', active: false },
    { name: 'Settings', icon: Settings, href: '#', active: false },
  ];

  const presetColors = [
    '#7C3AED', // Violet (Default)
    '#4F46E5', // Indigo
    '#2563EB', // Blue
    '#0D9488', // Teal
    '#059669', // Emerald
    '#E11D48', // Rose
    '#D97706', // Amber
    '#000000', // Midnight
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleRemoveAvatar = () => {
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestInput('');

    // Simulate instant AI reply based on configured tone and name
    setTimeout(() => {
      let replyText = `Thanks for asking! As ${publicAgentName || 'your assistant'}, I am currently running in ${tone.toLowerCase()} mode.`;
      if (replyLanguage !== 'Auto-detect') {
        replyText += ` Configured for ${replyLanguage} responses.`;
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: replyText }]);
    }, 500);
  };

  const handleResetPreview = () => {
    setMessages([]);
    setTestInput('');
  };

  const handleSave = async () => {
    if (isSaving) return;
    setSaveError(null);
    setIsSaving(true);

    try {
      let targetBusinessId = businessId || business?.id;

      // Fallback check if businessId wasn't cached yet
      if (!targetBusinessId && user?.id) {
        const { data: bizRecord } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (bizRecord?.id) {
          targetBusinessId = bizRecord.id;
          setBusinessId(bizRecord.id);
        }
      }

      if (!targetBusinessId) {
        throw new Error('Business profile could not be found. Please refresh the page and try again.');
      }

      // Insert new row into the chatbots table with specified columns only:
      // business_id, name (Chatbot Name field), public_agent_name, welcome_message, brand_color, reply_language, tone.
      // Leave avatar_url, system_prompt, ai_model, and is_active unset so their table defaults apply.
      const { data: insertedChatbot, error: insertError } = await supabase
        .from('chatbots')
        .insert([
          {
            business_id: targetBusinessId,
            name: chatbotName.trim() || 'My Chatbot',
            public_agent_name: publicAgentName.trim() || 'Ceyra Assistant',
            welcome_message: welcomeMessage.trim(),
            brand_color: brandColor,
            reply_language: replyLanguage,
            tone: tone,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (insertedChatbot?.id) {
        setSavedChatbotId(insertedChatbot.id);
        setIsEditing(true);
      }

      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (err: any) {
      console.error('Error saving chatbot:', err);
      setSaveError(err.message || 'Failed to save chatbot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authChecking) {
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
            <span>Loading your workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  const businessDisplayName = business?.name || user?.user_metadata?.company || 'My Business';
  const userInitials = (businessDisplayName || 'MB')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col lg:flex-row font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f2312_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2312_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-violet-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E0E12]/80 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <CeyraLogo className="w-7 h-7" />
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tighter text-white">CEYRA</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-violet-400 border border-white/10">
              Assist
            </span>
          </div>
        </Link>
        <button
          id="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 1. Left Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0E0E12]/95 lg:bg-[#0E0E12]/60 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-5 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo matching Navbar */}
          <Link
            to="/"
            id="sidebar-brand-link"
            className="flex items-center gap-3 group px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tighter text-white">CEYRA</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-violet-400 border border-white/10">
                Assist
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5" id="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  id={`nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 text-white border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)] font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        item.active ? 'text-violet-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 font-semibold border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User & Home Link */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <span>Back to Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{businessDisplayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || 'Pro Workspace'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Area: Form + Live Preview */}
      <div className="flex-1 flex flex-col xl:flex-row min-w-0">
        {/* Main Content Form Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-3xl overflow-y-auto">
          {/* Breadcrumb & Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Chatbots
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-violet-400">Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Build your chatbot
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                Draft
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Configure your assistant's identity, conversational tone, and visual styling.
            </p>
          </div>

          {/* Builder Form */}
          <div className="space-y-7 bg-[#111115]/70 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            {/* 1. Chatbot Name */}
            <div className="space-y-2">
              <label htmlFor="chatbot-name-input" className="block text-sm font-semibold text-gray-200">
                Chatbot Name
              </label>
              <input
                type="text"
                id="chatbot-name-input"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder="e.g. Colombo Bakery Support Bot"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-400">Just for your reference</p>
            </div>

            {/* 2. Public Agent Name */}
            <div className="space-y-2">
              <label htmlFor="public-agent-name-input" className="block text-sm font-semibold text-gray-200">
                Public Agent Name
              </label>
              <input
                type="text"
                id="public-agent-name-input"
                value={publicAgentName}
                onChange={(e) => setPublicAgentName(e.target.value)}
                placeholder="e.g. Maya or Ceyra Assistant"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-400">This is what your customers will see</p>
            </div>

            {/* 3. Avatar Upload Section (placed right after Public Agent Name) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">Agent Avatar</label>
              <div className="flex items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                {/* Circular preview */}
                <div
                  className="relative group w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-white/15 shadow-md cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload avatar"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Agent Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center transition-colors"
                      style={{
                        background: `linear-gradient(135deg, ${brandColor}44, ${brandColor}99)`,
                      }}
                    >
                      <Bot className="w-8 h-8 text-white drop-shadow" />
                    </div>
                  )}

                  {/* Hover upload overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Upload action buttons & helper text */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="avatar-file-input"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="upload-avatar-button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        id="remove-avatar-button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">PNG or JPG, at least 200x200px recommended.</p>
                </div>
              </div>
            </div>

            {/* 4. Welcome Message */}
            <div className="space-y-2">
              <label htmlFor="welcome-message-input" className="block text-sm font-semibold text-gray-200">
                Welcome Message
              </label>
              <textarea
                id="welcome-message-input"
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Hi! How can I help you today?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm resize-none"
              />
              <p className="text-xs text-gray-400">
                The initial greeting displayed as soon as a visitor opens the chat widget.
              </p>
            </div>

            {/* 5. Brand Color */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-200">Brand Color</label>
              <div className="flex flex-wrap items-center gap-3">
                {/* Preset swatch buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      id={`preset-color-${color.replace('#', '')}`}
                      onClick={() => setBrandColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform border ${
                        brandColor.toLowerCase() === color.toLowerCase()
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111115] border-white/50'
                          : 'border-white/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>

                {/* Color input swatch + hex input */}
                <div className="flex items-center gap-2 ml-auto bg-white/[0.03] border border-white/10 px-2.5 py-1 rounded-xl">
                  <input
                    type="color"
                    id="brand-color-picker"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-6 h-6 rounded-md bg-transparent cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    id="brand-color-hex-input"
                    value={brandColor.toUpperCase()}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-20 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 6. Reply Language */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-violet-400" />
                Reply Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Auto-detect', 'Sinhala', 'Tamil', 'English'] as ReplyLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    id={`reply-lang-${lang.toLowerCase()}`}
                    onClick={() => setReplyLanguage(lang)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-center border ${
                      replyLanguage === lang
                        ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] font-semibold'
                        : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Auto-detect seamlessly matches Sinhala, Tamil, English, or mixed Singlish/Tanglish.
              </p>
            </div>

            {/* 7. Tone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-violet-400" />
                Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Friendly', 'Formal', 'Casual'] as Tone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    id={`tone-${t.toLowerCase()}`}
                    onClick={() => setTone(t)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-center border ${
                      tone === t
                        ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] font-semibold'
                        : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message alert */}
            {saveError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{saveError}</div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  id="save-continue-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : savedNotification ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Changes Saved</span>
                    </>
                  ) : (
                    <span>Save & Continue</span>
                  )}
                </button>
                <button
                  type="button"
                  id="test-chatbot-btn"
                  onClick={() => {
                    const testInputEl = document.getElementById('preview-chat-input');
                    testInputEl?.focus();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-sm font-medium border border-white/10 transition-colors"
                >
                  Test This Chatbot
                </button>
              </div>

              {savedNotification && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" /> Changes saved
                </span>
              )}
            </div>
          </div>
        </main>

        {/* Right Side: Live Preview Panel */}
        <aside className="w-full xl:w-[460px] p-6 sm:p-8 lg:p-10 xl:border-l border-white/10 bg-[#0A0A0E]/60 backdrop-blur-md flex flex-col justify-start">
          <div className="sticky top-10 space-y-4">
            {/* Header of Preview */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Live Widget Preview
                </h2>
                <p className="text-xs text-gray-500">Live preview updating with your configuration</p>
              </div>
              <button
                type="button"
                id="reset-preview-btn"
                onClick={handleResetPreview}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 text-xs flex items-center gap-1 transition-colors"
                title="Reset conversation preview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Mock Chat Widget Box */}
            <div
              id="live-chat-widget-preview"
              className="w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#121217] flex flex-col h-[560px]"
            >
              {/* Chat Widget Header */}
              <div
                className="px-4 py-3.5 text-white flex items-center justify-between relative transition-colors duration-300"
                style={{ backgroundColor: brandColor }}
              >
                <div className="flex items-center gap-3">
                  {/* Live Avatar */}
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 bg-black/20 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={publicAgentName || 'Agent'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                    {/* Active green status indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-black/20" />
                  </div>

                  <div className="leading-tight min-w-0">
                    <p className="text-sm font-bold truncate text-white drop-shadow-sm">
                      {publicAgentName || 'Ceyra Assistant'}
                    </p>
                    <p className="text-[11px] text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Online • Typically replies instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-white/80">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F0F14] text-xs">
                <div className="text-center my-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-gray-500 border border-white/5">
                    Today
                  </span>
                </div>

                {/* Bot Welcome Message */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Bot Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="w-4 h-4 text-violet-400" />
                    )}
                  </div>
                  <div className="max-w-[80%] bg-[#1A1A22] border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-gray-200 leading-relaxed shadow-sm">
                    {welcomeMessage || 'Hi! How can I help you today?'}
                  </div>
                </div>

                {/* Suggested prompt chips */}
                <div className="pl-9 flex flex-wrap gap-1.5 pt-1">
                  {['Islandwide Delivery 🚚', 'Menu & Pricing 🍰', 'Payment Methods 💳'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setMessages((prev) => [
                            ...prev,
                            { sender: 'user', text: chip },
                            {
                              sender: 'bot',
                              text: `Here is information on ${chip}: Delivery takes 2-3 business days across Sri Lanka with Cash on Delivery and Mintpay available!`,
                            },
                          ]);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 transition-colors"
                      >
                        {chip}
                      </button>
                    )
                  )}
                </div>

                {/* Dynamic messages */}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Bot Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Bot className="w-4 h-4 text-violet-400" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'text-white rounded-tr-sm'
                          : 'bg-[#1A1A22] border border-white/10 text-gray-200 rounded-tl-sm'
                      }`}
                      style={msg.sender === 'user' ? { backgroundColor: brandColor } : undefined}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#16161D] border-t border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  id="preview-chat-input"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  id="preview-send-btn"
                  className="p-2 rounded-xl text-white transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-md"
                  style={{ backgroundColor: brandColor }}
                  aria-label="Send test message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Powered by watermark */}
              <div className="py-1.5 bg-[#0D0D12] text-center border-t border-white/5">
                <span className="text-[10px] text-gray-500 font-medium tracking-tight">
                  ⚡ Powered by <span className="text-gray-400 font-semibold">Ceyra Assist</span>
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
