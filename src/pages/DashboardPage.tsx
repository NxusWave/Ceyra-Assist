import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Inbox,
  Share2,
  CreditCard,
  Settings,
  ExternalLink,
  MessageSquare,
  Globe,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit2,
  Check,
  X,
  LogOut,
  Zap,
  Shield,
  Send,
  Menu,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import { supabase } from '../lib/supabaseClient';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Auth & Business State
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [editingBusinessName, setEditingBusinessName] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [savingBusinessName, setSavingBusinessName] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'inbox' | 'channels' | 'settings'>('overview');

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
          console.warn('Notice querying businesses table:', fetchError.message);
        }

        if (existingBusinesses && existingBusinesses.length > 0) {
          const currentBusiness = existingBusinesses[0];
          if (isMounted) {
            setBusiness(currentBusiness);
            setNewBusinessName(currentBusiness.name || 'My Business');
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
            const provisioned = newBusiness || { owner_id: currentUser.id, name: defaultBusinessName };
            setBusiness(provisioned);
            setNewBusinessName(defaultBusinessName);
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

  const handleUpdateBusinessName = async () => {
    if (!newBusinessName.trim() || !business) return;
    setSavingBusinessName(true);

    try {
      if (business.id) {
        const { error } = await supabase
          .from('businesses')
          .update({ name: newBusinessName.trim() })
          .eq('id', business.id);

        if (error) {
          console.error('Error updating business name:', error.message);
        }
      } else if (user?.id) {
        const { error } = await supabase
          .from('businesses')
          .update({ name: newBusinessName.trim() })
          .eq('owner_id', user.id);

        if (error) {
          console.error('Error updating business name:', error.message);
        }
      }

      setBusiness((prev: any) => ({ ...prev, name: newBusinessName.trim() }));
      setEditingBusinessName(false);
    } catch (err) {
      console.error('Failed to update business name:', err);
    } finally {
      setSavingBusinessName(false);
    }
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

  const navItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'inbox', name: 'Inquiries & Inbox', icon: Inbox, badge: '5' },
    { id: 'analytics', name: 'Language Analytics', icon: BarChart3 },
    { id: 'channels', name: 'Channels & Integrations', icon: Share2 },
    { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen },
    { id: 'billing', name: 'Plan & Billing', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: Settings },
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
            <span>Verifying session and workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  const businessDisplayName = business?.name || user?.user_metadata?.company || 'My Business';
  const userInitials = (businessDisplayName || 'MB')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Mock workspace statistics for active dashboard
  const stats = [
    {
      label: 'Monthly Interactions',
      value: '2,840',
      change: '+18.4%',
      trend: 'up',
      subtitle: 'Across Sinhala, Tamil, English',
    },
    {
      label: 'Autonomous Resolution',
      value: '91.8%',
      change: '+3.2%',
      trend: 'up',
      subtitle: 'Resolved without escalation',
    },
    {
      label: 'Average Latency',
      value: '1.08s',
      change: '-0.15s',
      trend: 'up',
      subtitle: 'Sub-second real-time streaming',
    },
    {
      label: 'Active Connected Channels',
      value: '3 Channels',
      change: '100% Uptime',
      trend: 'neutral',
      subtitle: 'WhatsApp, Web, Instagram',
    },
  ];

  const recentInquiries = [
    {
      id: 'inq-1',
      customer: 'Kamal Jayawardena',
      channel: 'WhatsApp',
      language: 'Sinhala',
      langCode: 'si',
      query: 'හෙට උදේ 10ට Colombo 07 ට cake delivery එකක් දාන්න පුලුවන්ද?',
      response: 'ඔව්, Colombo 07 ප්‍රදේශයට හෙට උදෑසන 10 ට delivery ලබාදිය හැක. රසය සහ ප්‍රමාණය තහවුරු කරන්න.',
      time: '4 mins ago',
      status: 'Resolved',
    },
    {
      id: 'inq-2',
      customer: 'Praveen Selliah',
      channel: 'Web Widget',
      language: 'Tamil',
      langCode: 'ta',
      query: 'கார்ப்பரேட் கேட்டரிங் மெனு மற்றும் விலை விபரங்கள் கிடைக்குமா?',
      response: 'நிச்சயமாக! கார்ப்பரேட் கேட்டரிங் கையேடு மற்றும் பேக்கேஜ் விபரங்களை மின்னஞ்சலுக்கு அனுப்பியுள்ளோம்.',
      time: '18 mins ago',
      status: 'Resolved',
    },
    {
      id: 'inq-3',
      customer: 'Michelle Fernando',
      channel: 'Web Widget',
      language: 'English',
      langCode: 'en',
      query: 'Do you offer gluten-free sourdough loaves on weekdays?',
      response: 'Yes! We bake fresh gluten-free sourdough loaves every Tuesday and Thursday morning.',
      time: '42 mins ago',
      status: 'Resolved',
    },
    {
      id: 'inq-4',
      customer: 'Dilshan Wickramasinghe',
      channel: 'Instagram DM',
      language: 'Sinhala',
      langCode: 'si',
      query: 'Credit card discount තියෙනවද HNB card වලට?',
      response: 'ඔව්, සෑම සිකුරාදා දිනකම HNB Credit Card සඳහා 20% ක විශේෂ වට්ටමක් හිමිවේ.',
      time: '1 hour ago',
      status: 'Resolved',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col lg:flex-row font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E0E12] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <CeyraLogo className="w-7 h-7" />
          <span className="font-bold text-white text-base">Ceyra Console</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0E0E12] border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Workspace Brand / Identity */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  CEYRA
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-violet-400 block">
                  Enterprise Workspace
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

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (['overview', 'inbox', 'analytics', 'channels', 'settings'].includes(item.id)) {
                      setActiveTab(item.id as any);
                    }
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-violet-400' : 'text-gray-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Account Details & Actions */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User & Business Profile Card */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{businessDisplayName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

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

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
        {/* Workspace Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                Live Console
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                All Services Active
              </span>
            </div>

            {/* Editable Business Name */}
            <div className="flex items-center gap-3">
              {editingBusinessName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-violet-500 text-white text-lg font-bold focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateBusinessName}
                    disabled={savingBusinessName}
                    className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                    title="Save name"
                  >
                    {savingBusinessName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setNewBusinessName(businessDisplayName);
                      setEditingBusinessName(false);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {businessDisplayName}
                  </h1>
                  <button
                    onClick={() => setEditingBusinessName(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Rename business"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Trilingual autonomous customer support & engagement workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('channels')}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white transition-colors flex items-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Channels</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>View Inbox</span>
            </button>
          </div>
        </div>

        {/* 1. Executive Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#111115]/70 border border-white/10 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{stat.label}</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <p className="text-[11px] text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* 2. Trilingual Breakdown & Channel Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trilingual Volume Split */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111115]/70 border border-white/10 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Language Intelligence Distribution</h3>
                <p className="text-xs text-gray-400">Live detection and synthesis by language</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-600/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                <Globe className="w-3.5 h-3.5" />
                <span>Trilingual Mode</span>
              </div>
            </div>

            {/* Language Progress Bars */}
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-200">Sinhala (සිංහල)</span>
                  <span className="font-semibold text-violet-300">48% (1,363 interactions)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-200">English (Global)</span>
                  <span className="font-semibold text-indigo-300">34% (965 interactions)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '34%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-200">Tamil (தமிழ்)</span>
                  <span className="font-semibold text-teal-300">18% (512 interactions)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Zero-code real-time phonetics, Singlish & Tanglish handling enabled</span>
              </span>
              <span className="text-emerald-400 font-medium">99.8% Accuracy</span>
            </div>
          </div>

          {/* Connected Channels Overview */}
          <div className="p-6 rounded-2xl bg-[#111115]/70 border border-white/10 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-semibold text-white">Active Channels</h3>
            <p className="text-xs text-gray-400">Connected touchpoints for {businessDisplayName}</p>

            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">WhatsApp Business</h4>
                    <p className="text-[11px] text-gray-400">Official Cloud API</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Website Live Widget</h4>
                    <p className="text-[11px] text-gray-400">JS Embed script active</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Instagram & Messenger</h4>
                    <p className="text-[11px] text-gray-400">Meta Graph Webhook</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recent Customer Inquiries Stream */}
        <div className="rounded-2xl bg-[#111115]/70 border border-white/10 backdrop-blur-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Live Customer Inquiries</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time conversations processed and resolved by your Ceyra assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Filter:</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-white border border-white/10">
                All Languages (3)
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-xs text-white">{inq.customer}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                      {inq.channel}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        inq.langCode === 'si'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : inq.langCode === 'ta'
                          ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                          : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {inq.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {inq.time}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {inq.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-gray-300 font-medium">
                    <span className="text-gray-500 mr-2">Query:</span>
                    {inq.query}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-violet-400 mr-2">AI Reply:</span>
                    {inq.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Update Knowledge Base</h4>
            <p className="text-xs text-gray-400">
              Upload fresh PDFs, menus, pricing sheets, or FAQs to keep answers accurate.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Autonomous Escalations</h4>
            <p className="text-xs text-gray-400">
              Seamless human-in-the-loop handoff triggers for orders over LKR 50,000.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Privacy & Guardrails</h4>
            <p className="text-xs text-gray-400">
              Enterprise data sovereignty with no training on proprietary Sri Lankan business data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
