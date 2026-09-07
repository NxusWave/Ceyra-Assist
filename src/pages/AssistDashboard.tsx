import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  BookOpen,
  Inbox,
  Share2,
  CreditCard,
  Settings,
  Home,
  MessageSquare,
  Globe,
  Sliders,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Upload,
  Send,
  Trash2,
  LogOut,
  Palette,
  Check,
  HelpCircle,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import BusinessAvatar from '../components/BusinessAvatar';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from '../components/DemoModal';

type ReplyLanguage = 'Auto-detect' | 'Sinhala' | 'Tamil' | 'English';
type Tone = 'Friendly' | 'Formal' | 'Casual';

export default function AssistDashboard() {
  const navigate = useNavigate();

  // Auth & Business State
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Chatbot Builder Form State
  const [chatbotName, setChatbotName] = useState('Colombo Boutique Bakery Support');
  const [publicAgentName, setPublicAgentName] = useState('Ceyra Assistant');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>('Auto-detect');
  const [tone, setTone] = useState<Tone>('Friendly');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi! Welcome to Colombo Boutique Bakery. How can I assist you with our menu, delivery, or custom orders today?'
  );
  const [savedNotification, setSavedNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Chat Simulator State
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string; lang?: string }>
  >([
    {
      sender: 'bot',
      text: 'Ayubowan! 🙏 Welcome to Colombo Boutique Bakery. How can I help you today?',
      time: 'Just now',
      lang: 'Sinhala / English',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        let currentBusiness: any = null;
        const { data: existingBusinesses, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (fetchError) {
          console.warn('Notice querying businesses table:', fetchError.message);
        }

        if (existingBusinesses && existingBusinesses.length > 0) {
          currentBusiness = existingBusinesses[0];
        } else {
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
          currentBusiness = newBusiness || { owner_id: currentUser.id, name: defaultBusinessName };
        }

        if (isMounted) {
          setBusiness(currentBusiness);
          if (currentBusiness?.name) {
            setChatbotName(`${currentBusiness.name} Support`);
          }
        }

        // Check the "packages" table where user_id = current user and product = SIGNUP_PRODUCT
        const businessId = currentBusiness?.id || null;
        try {
          const { data: existingPackages, error: pkgError } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('product', SIGNUP_PRODUCT);

          if (pkgError) {
            console.warn('Notice querying packages table in AssistDashboard:', pkgError.message);
          }

          if (!existingPackages || existingPackages.length === 0) {
            const { error: insertPkgError } = await supabase
              .from('packages')
              .insert([
                {
                  user_id: currentUser.id,
                  product: SIGNUP_PRODUCT,
                  status: 'trial',
                  plan: 'starter',
                  business_id: businessId,
                },
              ]);

            if (insertPkgError) {
              console.warn('Notice creating assist package row:', insertPkgError.message);
            }
          }
        } catch (pkgErr) {
          console.warn('Packages check notice:', pkgErr);
        }

        // Fetch the FIRST chatbot row for this business only
        if (businessId) {
          try {
            const { data } = await supabase
              .from('chatbots')
              .select('*')
              .eq('business_id', businessId)
              .order('created_at', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (data && isMounted) {
              setChatbotId(data.id);
              if (data.chatbot_name) setChatbotName(data.chatbot_name);
              if (data.public_agent_name) setPublicAgentName(data.public_agent_name);
              if (data.avatar_url) setAvatarPreview(data.avatar_url);
              if (data.primary_color) setPrimaryColor(data.primary_color);
              if (data.reply_language) setReplyLanguage(data.reply_language as ReplyLanguage);
              if (data.tone) setTone(data.tone as Tone);
              if (data.welcome_message) setWelcomeMessage(data.welcome_message);
            }
          } catch (botErr) {
            console.warn('Notice querying chatbots table in AssistDashboard:', botErr);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChatbot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    const business_id = business?.id;
    if (!business_id) {
      setSaveError('Business profile not loaded. Please reload the page.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // a. Upload avatar file if set
      let finalAvatarUrl: string | null = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const path = `${business_id}/avatar-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('chatbot-avatars')
          .upload(path, avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('chatbot-avatars')
          .getPublicUrl(path);

        finalAvatarUrl = publicUrlData?.publicUrl || null;
        setAvatarPreview(finalAvatarUrl);
        setAvatarFile(null);
      } else if (avatarPreview && !avatarPreview.startsWith('blob:')) {
        finalAvatarUrl = avatarPreview;
      } else {
        finalAvatarUrl = null;
      }

      // b. Update or insert chatbot row
      if (chatbotId) {
        const { error: updateError } = await supabase
          .from('chatbots')
          .update({
            chatbot_name: chatbotName,
            public_agent_name: publicAgentName,
            avatar_url: finalAvatarUrl,
            primary_color: primaryColor,
            reply_language: replyLanguage,
            tone: tone,
            welcome_message: welcomeMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatbotId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data, error: insertError } = await supabase
          .from('chatbots')
          .insert({
            business_id: business_id,
            chatbot_name: chatbotName,
            public_agent_name: publicAgentName,
            avatar_url: finalAvatarUrl,
            primary_color: primaryColor,
            reply_language: replyLanguage,
            tone: tone,
            welcome_message: welcomeMessage,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          setChatbotId(data.id);
        }
      }

      // c. On success, show notification
      setSavedNotification(true);
      setTimeout(() => {
        setSavedNotification(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving chatbot:', err);
      setSaveError(err.message || 'Failed to save chatbot configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsg = {
      sender: 'user' as const,
      text: userText,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = '';
      const lower = userText.toLowerCase();

      if (
        lower.includes('sinhala') ||
        lower.includes('සිංහල') ||
        lower.includes('මිල') ||
        lower.includes('කොළඹ') ||
        lower.includes('කේක්') ||
        lower.includes('බෙදාහැරීම්') ||
        replyLanguage === 'Sinhala'
      ) {
        botReply =
          'අපගේ බේකරිය සෑම දිනකම නැවුම් කේක්, පේස්ට්‍රි සහ පාන් පිළියෙල කරනු ලබයි. කොළඹ අවට පැය 2ක් ඇතුළත ඩිලිවරි පහසුකම් ඇත!';
      } else if (
        lower.includes('tamil') ||
        lower.includes('தமிழ்') ||
        lower.includes('விலை') ||
        lower.includes('கேக்') ||
        replyLanguage === 'Tamil'
      ) {
        botReply =
          'வணக்கம்! எங்களின் புதிய கேக் மற்றும் பேக்கரி உணவு வகைகளுக்கு கொழும்பு பகுதியில் உடனடி டெலிவரி வசதி உண்டு.';
      } else if (lower.includes('menu') || lower.includes('order') || lower.includes('cake')) {
        botReply =
          'We bake artisan sourdough, French croissants, and custom celebration cakes! Would you like me to send our latest catalog or take your order details?';
      } else {
        botReply = `Thank you for contacting ${chatbotName}! I'm operating in ${tone.toLowerCase()} mode. How else can I assist you with your order?`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: botReply,
          time: 'Just now',
          lang: 'Auto Trilingual',
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      navigate('/', { replace: true });
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

  const navItems = [
    { name: 'Dashboard Hub', icon: LayoutDashboard, href: '/dashboard', active: false },
    { name: 'Chatbots', icon: Bot, href: '/dashboard/assist', active: true },
    { name: 'Analytics', icon: BarChart3, href: '#', active: false },
    { name: 'Channels', icon: Share2, href: '#', active: false },
    { name: 'Knowledge Base', icon: BookOpen, href: '#', active: false },
    { name: 'Inbox', icon: Inbox, href: '#', active: false },
    { name: 'Billing', icon: CreditCard, href: '#', active: false },
    { name: 'Settings', icon: Settings, href: '#', active: false },
  ];

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
            <span>Loading Chatbot Builder...</span>
          </div>
        </div>
      </div>
    );
  }

  const businessDisplayName =
    business?.name || user?.user_metadata?.company || 'Colombo Bakery';
  const userInitials = (businessDisplayName || 'CB')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col lg:flex-row font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E0E12] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <CeyraLogo className="w-7 h-7" />
          <span className="font-bold text-white text-base">Ceyra Assist</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0E0E12] border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  CEYRA
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-violet-400 block">
                  Assist Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    item.active
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-violet-400' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-between text-xs text-violet-400 hover:text-violet-300 px-3 py-2 rounded-lg bg-violet-600/10 border border-violet-500/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </span>
            <LayoutDashboard className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <span>Back to Home</span>
            <Home className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Link
              to="/dashboard/account"
              className="flex items-center gap-2.5 group/account hover:opacity-90 transition-opacity"
              title="Manage Account"
            >
              <BusinessAvatar
                name={businessDisplayName}
                avatarUrl={business?.logo_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white group-hover/account:text-violet-300 transition-colors truncate">
                  {businessDisplayName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || 'Pro Workspace'}</p>
              </div>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full mt-2 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
        {/* Breadcrumb: Back to Dashboard */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                Chatbots
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Product: assist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Build your chatbot
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Configure branding, trilingual behavior, persona, and greetings for your assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard Hub</span>
            </Link>
            <button
              onClick={handleSaveChatbot}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
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
            <span>Chatbot configuration updated and deployed to your live channels!</span>
          </div>
        )}

        {/* Builder Layout: Form on Left, Live Simulator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
          {/* Left Column: Chatbot Builder Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSaveChatbot} className="space-y-6">
              {/* 1. Chatbot Name */}
              <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-2">
                <label htmlFor="chatbot-name-input" className="block text-sm font-semibold text-gray-200">
                  Chatbot Name
                </label>
                <p className="text-xs text-gray-400">
                  Internal identifier for this agent in your Ceyra console.
                </p>
                <input
                  id="chatbot-name-input"
                  type="text"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder="e.g. Colombo Bakery Support"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* 2. Avatar & Public Name */}
              <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">Agent Persona & Avatar</h3>
                    <p className="text-xs text-gray-400">
                      The public identity shown to your customers on the chat widget.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bot className="w-8 h-8" style={{ color: primaryColor }} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
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
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Remove Avatar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Recommended: 256x256 PNG or JPG with transparent background.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="agent-public-name" className="block text-xs font-medium text-gray-300 mb-1">
                    Public Agent Name
                  </label>
                  <input
                    id="agent-public-name"
                    type="text"
                    value={publicAgentName}
                    onChange={(e) => setPublicAgentName(e.target.value)}
                    placeholder="e.g. Ceyra Assistant or Asha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* 3. Primary Color & Theme */}
              <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">Brand Color Accent</h3>
                    <p className="text-xs text-gray-400">
                      Applied to widget headers, bubbles, and interactive highlights.
                    </p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setPrimaryColor(preset.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        primaryColor === preset.value
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <Palette className="w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Language & Tone */}
              <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200">Trilingual Behavior & Tone</h3>
                  <p className="text-xs text-gray-400">
                    Engineered specifically for Sri Lankan conversational nuance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Primary Language Mode
                    </label>
                    <select
                      value={replyLanguage}
                      onChange={(e) => setReplyLanguage(e.target.value as ReplyLanguage)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="Auto-detect" className="bg-[#111115] text-white">
                        Auto-detect (Sinhala / Tamil / English)
                      </option>
                      <option value="Sinhala" className="bg-[#111115] text-white">
                        Sinhala (සිංහල & Singlish)
                      </option>
                      <option value="Tamil" className="bg-[#111115] text-white">
                        Tamil (தமிழ் & Tanglish)
                      </option>
                      <option value="English" className="bg-[#111115] text-white">
                        English (Global)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Tone of Voice
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Friendly', 'Formal', 'Casual'] as Tone[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className={`py-2 px-2 text-center text-xs rounded-xl font-medium border transition-colors ${
                            tone === t
                              ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                              : 'bg-white/[0.02] text-gray-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Welcome Message */}
              <div className="p-5 rounded-2xl bg-[#111115]/80 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="welcome-msg-input" className="block text-sm font-semibold text-gray-200">
                    Welcome Greeting Message
                  </label>
                  <span className="text-[10px] text-gray-500">
                    {welcomeMessage.length} characters
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  The initial greeting displayed as soon as a visitor opens the chat.
                </p>
                <textarea
                  id="welcome-msg-input"
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
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save and Publish Chatbot'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Chatbot Preview / Simulator */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <h3 className="text-sm font-semibold text-white">Live Simulator Preview</h3>
              </div>
              <span className="text-[11px] text-gray-500">Updates live with your changes</span>
            </div>

            {/* Mock Chat Container */}
            <div className="rounded-3xl bg-[#0E0E12] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[580px] relative">
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between text-white shadow-md transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{publicAgentName}</h4>
                    <p className="text-[10px] text-white/80 leading-none mt-0.5">
                      {businessDisplayName} · Online
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs font-mono">
                  <span>{tone}</span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0A0B]/60">
                {/* Initial Welcome message */}
                <div className="flex items-start gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-xs bg-white/5 border border-white/10 text-xs text-gray-200 leading-relaxed shadow-sm">
                    {welcomeMessage}
                  </div>
                </div>

                {/* Conversation message stream */}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'text-white rounded-tr-xs shadow-md'
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-xs shadow-sm'
                      }`}
                      style={
                        msg.sender === 'user'
                          ? { backgroundColor: primaryColor }
                          : undefined
                      }
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

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-[#0E0E12] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  'කේක් ඩිලිවරි තියෙනවද?',
                  'Fresh sourdough bread today?',
                  'கேக் விபரம் சொல்லுங்கள்',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputMessage(chip);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-gray-300 hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#0E0E12] border-t border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Test reply in Sinhala, Tamil, or English..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  id="test-chatbot-btn"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                  title="Test This Chatbot"
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
      </main>
    </div>
  );
}
