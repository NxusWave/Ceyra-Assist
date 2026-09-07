import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Layers,
  ArrowRight,
  LogOut,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  Home,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  LayoutGrid,
  ChevronRight,
  Plus,
  User,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import BusinessAvatar from '../components/BusinessAvatar';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from '../components/DemoModal';

interface PackageItem {
  id?: string;
  user_id?: string;
  business_id?: string;
  product: string;
  status: string;
  plan: string;
  created_at?: string;
}

export default function DashboardHub() {
  const navigate = useNavigate();

  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [conversationCount, setConversationCount] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        // 1. Session verification guard
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

        // 2. Ensure businesses row exists
        let currentBusiness: any = null;
        const { data: existingBusinesses, error: fetchBizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (fetchBizError) {
          console.warn('Notice querying businesses:', fetchBizError.message);
        }

        if (existingBusinesses && existingBusinesses.length > 0) {
          currentBusiness = existingBusinesses[0];
        } else {
          const defaultBusinessName =
            currentUser.user_metadata?.company ||
            currentUser.user_metadata?.full_name ||
            'My Business';

          const { data: newBusiness, error: insertBizError } = await supabase
            .from('businesses')
            .insert([
              {
                owner_id: currentUser.id,
                name: defaultBusinessName,
              },
            ])
            .select()
            .single();

          if (insertBizError) {
            console.warn('Notice inserting business record:', insertBizError.message);
          }
          currentBusiness = newBusiness || {
            owner_id: currentUser.id,
            name: defaultBusinessName,
          };
        }

        if (isMounted) {
          setBusiness(currentBusiness);
        }

        // 3. Ensure packages row for SIGNUP_PRODUCT exists
        const businessId = currentBusiness?.id || null;
        try {
          const { data: existingPackages, error: fetchPkgError } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('product', SIGNUP_PRODUCT);

          if (fetchPkgError) {
            console.warn('Notice querying packages table:', fetchPkgError.message);
          }

          if (!existingPackages || existingPackages.length === 0) {
            const { data: newPkg, error: insertPkgError } = await supabase
              .from('packages')
              .insert([
                {
                  user_id: currentUser.id,
                  product: SIGNUP_PRODUCT,
                  status: 'trial',
                  plan: 'starter',
                  business_id: businessId,
                },
              ])
              .select()
              .single();

            if (insertPkgError) {
              console.warn('Notice creating assist package:', insertPkgError.message);
            }
          }
        } catch (pkgErr) {
          console.warn('Packages table integration notice:', pkgErr);
        }

        // 4. Fetch all rows from packages for current user
        try {
          const { data: allUserPackages, error: allPkgError } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', currentUser.id);

          if (!allPkgError && allUserPackages && allUserPackages.length > 0) {
            if (isMounted) {
              setPackages(allUserPackages);
            }
          } else {
            // Fallback default assist package representation if table is empty or unprovisioned
            if (isMounted) {
              setPackages([
                {
                  product: SIGNUP_PRODUCT,
                  status: 'trial',
                  plan: 'starter',
                  business_id: businessId,
                },
              ]);
            }
          }
        } catch (err) {
          if (isMounted) {
            setPackages([
              {
                product: SIGNUP_PRODUCT,
                status: 'trial',
                plan: 'starter',
                business_id: businessId,
              },
            ]);
          }
        }

        // 5. If businessId exists, fetch conversation count across chatbots for this business
        if (businessId) {
          setLoadingMetrics(true);
          try {
            // Step 1: get all chatbot ids belonging to this business
            const { data: chatbotRows } = await supabase
              .from('chatbots')
              .select('id')
              .eq('business_id', businessId);

            const chatbotIds = (chatbotRows ?? []).map((c: { id: string }) => c.id);

            // Step 2: count conversations across all of this business's chatbots
            let conversationCountResult = 0;
            if (chatbotIds.length > 0) {
              const { count } = await supabase
                .from('conversations')
                .select('id', { count: 'exact', head: true })
                .in('chatbot_id', chatbotIds);
              conversationCountResult = count ?? 0;
            }

            if (isMounted) {
              setConversationCount(conversationCountResult);
            }
          } catch (cErr) {
            console.warn('Notice querying conversations count:', cErr);
            if (isMounted) setConversationCount(0);
          } finally {
            if (isMounted) setLoadingMetrics(false);
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

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col items-center justify-center relative font-sans isolate overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <CeyraLogo className="w-12 h-12 animate-pulse" />
            <div className="absolute -inset-2 bg-violet-600/20 blur-lg rounded-full -z-10" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            <span>Loading Ceyra Dashboard Hub...</span>
          </div>
        </div>
      </div>
    );
  }

  const businessDisplayName =
    business?.name || user?.user_metadata?.company || 'My Business';
  const userInitials = (businessDisplayName || 'MB')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    }
    if (s === 'trial') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
          <Clock className="w-3 h-3 text-amber-400" />
          Free Trial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-radial-grid opacity-30 pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0E0E12]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">CEYRA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-600/15 px-2 py-0.5 rounded-full border border-violet-500/25">
                  Dashboard Hub
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white border border-white/10 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />
                <span>My Products</span>
              </span>
              <Link
                to="/dashboard/account"
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span>Account</span>
              </Link>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors flex items-center gap-1"
              >
                <span>Back to Home</span>
                <Home className="w-3 h-3 text-gray-500" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Standardized Round Business Badge */}
            <Link
              to="/dashboard/account"
              id="dashboard-business-badge"
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs transition-colors"
              title="Manage Account"
            >
              <BusinessAvatar
                name={businessDisplayName}
                avatarUrl={business?.avatar_url || business?.logo_url}
                size="xs"
              />
              <span className="text-gray-200 font-medium max-w-[150px] truncate">
                {businessDisplayName}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/25 text-gray-400 hover:text-rose-300 text-xs font-medium transition-all flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>Enterprise AI Cloud</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome to your Workspace Hub
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
                Manage your active trilingual AI packages, deploy customer support assistants, and review live interactions for{' '}
                <span className="text-white font-medium">{businessDisplayName}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-[#0A0A0B]/60 border border-white/10 text-xs">
                <span className="text-gray-400 block text-[11px]">Active Packages</span>
                <span className="text-base font-bold text-white">
                  {packages.length} Subscribed
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-[#0A0A0B]/60 border border-white/10 text-xs">
                <span className="text-gray-400 block text-[11px]">System Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  All Engines Live
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Section: Subscribed Products & Packages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Subscribed Products</h2>
              <p className="text-xs text-gray-400">
                Active packages provisioned for your business
              </p>
            </div>
          </div>

          {/* Grid of Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => {
              const productNameCapitalized =
                pkg.product.charAt(0).toUpperCase() + pkg.product.slice(1);
              const isAssist = pkg.product.toLowerCase() === SIGNUP_PRODUCT;
              const planFormatted =
                pkg.plan.charAt(0).toUpperCase() + pkg.plan.slice(1);

              return (
                <div
                  key={pkg.id || `pkg-${idx}`}
                  className="rounded-3xl glass-panel-glow border border-violet-500/25 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-600/10 group"
                >
                  {/* Top Header of Card */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                        {isAssist ? <Bot className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {getStatusBadge(pkg.status)}
                        <span className="text-[11px] font-mono text-gray-400">
                          {planFormatted} Plan
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                      {isAssist ? `Ceyra ${productNameCapitalized}` : productNameCapitalized}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                      {isAssist
                        ? 'Autonomous trilingual customer support engine fluent in Sinhala, Tamil, English, and Singlish.'
                        : `Enterprise ${productNameCapitalized} toolsuite configured for your team.`}
                    </p>

                    {/* Metric Box for Assist: Count of rows in conversations for this business_id */}
                    {isAssist && (
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-6 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                            <span>Total Conversations:</span>
                          </span>
                          <span className="text-base font-bold text-white tracking-tight">
                            {loadingMetrics ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 inline" />
                            ) : (
                              conversationCount
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-white/5">
                          <span>Channel: Web / WhatsApp</span>
                          <span className="text-emerald-400 font-medium">Synced</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manage Button linking to /dashboard/{product} */}
                  <div className="pt-2">
                    <Link
                      to={`/dashboard/${pkg.product.toLowerCase()}`}
                      className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 group/btn active:scale-98"
                    >
                      <span>Manage {productNameCapitalized}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Placeholder Add-on Card for Ceyra Voice / Omnichannel */}
            <div className="rounded-3xl glass-panel border border-white/10 p-6 flex flex-col justify-between border-dashed opacity-80 hover:opacity-100 transition-opacity">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                    Add-on
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Ceyra Voice AI</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Inbound and outbound telephone IVR AI with natural Sinhala and Tamil speech synthesis.
                </p>
              </div>

              <button
                disabled
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 text-gray-500 text-xs font-semibold cursor-not-allowed border border-white/5 flex items-center justify-center gap-1.5"
              >
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl glass-panel-subtle border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 mt-0.5 flex-shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Trilingual Coverage
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Native scripts for Sinhala (සිංහල), Tamil (தமிழ்), English, and colloquial Sri Lankan phrasing.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel-subtle border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 mt-0.5 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Sri Lanka PDPA Compliance
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Encrypted enterprise data isolation. Your business documents are never shared or trained publicly.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel-subtle border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-400 mt-0.5 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                One-Click Channel Sync
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Embed directly to Shopify, WordPress, or WhatsApp Cloud API with instant auto-sync.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
