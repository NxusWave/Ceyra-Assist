import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bot,
  Layers,
  User,
  LayoutDashboard,
  LayoutGrid,
  Home,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import CeyraLogo from './CeyraLogo';
import BusinessAvatar from './BusinessAvatar';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from './DemoModal';

interface ProductPackage {
  product: string;
  plan: string;
  status: string;
}

const productName = (product: string) => {
  const capitalized = product.charAt(0).toUpperCase() + product.slice(1);
  return product.toLowerCase() === SIGNUP_PRODUCT ? `Ceyra ${capitalized}` : capitalized;
};

const productStatusDot = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'active') return 'bg-emerald-400';
  if (s === 'trial') return 'bg-amber-400';
  return 'bg-gray-500';
};

/**
 * Persistent shell for every route under /dashboard/*.
 *
 * - Left sidebar (persistent): Dashboard overview, My Account, and a
 *   "My Products" dropdown listing every product owned by the user
 *   (e.g. /dashboard/assist), plus Sign Out pinned at the bottom.
 * - Top bar: Home (icon only) and the business avatar/name, which navigates
 *   to My Account. There is deliberately no sign-out here — it lives in the
 *   sidebar only.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();

  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<ProductPackage[]>([]);
  const [productsOpen, setProductsOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLayoutData() {
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
        if (isMounted) setUser(currentUser);

        // 2. Ensure a businesses row exists for the signed-in owner
        let currentBusiness: any = null;
        const { data: existingBusinesses } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (existingBusinesses && existingBusinesses.length > 0) {
          currentBusiness = existingBusinesses[0];
        } else {
          const defaultBusinessName =
            currentUser.user_metadata?.company ||
            currentUser.user_metadata?.full_name ||
            'My Business';

          const { data: newBusiness } = await supabase
            .from('businesses')
            .insert([
              {
                owner_id: currentUser.id,
                name: defaultBusinessName,
              },
            ])
            .select()
            .single();

          currentBusiness = newBusiness || {
            owner_id: currentUser.id,
            name: defaultBusinessName,
          };
        }
        if (isMounted) setBusiness(currentBusiness);

        // 3. All products (packages) owned by this user
        const { data: packageRows } = await supabase
          .from('packages')
          .select('product, plan, status')
          .eq('user_id', currentUser.id);

        if (isMounted) {
          if (packageRows && packageRows.length > 0) {
            setProducts(packageRows as ProductPackage[]);
          } else {
            // Fallback: the signup product is always provisioned on first load
            setProducts([{ product: SIGNUP_PRODUCT, plan: 'starter', status: 'trial' }]);
          }
        }
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    }

    loadLayoutData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const businessDisplayName =
    business?.name || user?.user_metadata?.company || 'My Business';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error signing out:', err);
      setSigningOut(false);
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
            <span>Loading Ceyra Console...</span>
          </div>
        </div>
      </div>
    );
  }

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
      isActive
        ? 'bg-violet-600/15 text-violet-300 border-violet-500/20 shadow-sm'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border-transparent'
    }`;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-radial-grid opacity-30 pointer-events-none -z-10" />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===== Persistent Left Sidebar ===== */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-[#0E0E12] border-r border-white/10 flex flex-col p-5 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-base font-bold tracking-tight text-white block">CEYRA</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-violet-400 block">
                Console
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 pt-4">
          <NavLink
            to="/dashboard"
            end
            className={navLinkClasses}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/account"
            className={navLinkClasses}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <User className="w-4 h-4" />
            <span>My Account</span>
          </NavLink>

          {/* My Products dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setProductsOpen((open) => !open)}
              aria-expanded={productsOpen}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] border border-transparent transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-left">My Products</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                  productsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {productsOpen && (
              <div className="ml-4 pl-3 border-l border-white/5 space-y-1 mt-1">
                {products.map((pkg) => (
                  <NavLink
                    key={pkg.product}
                    to={`/dashboard/${pkg.product}`}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors border ${
                        isActive
                          ? 'bg-violet-600/15 text-violet-300 border-violet-500/20'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border-transparent'
                      }`
                    }
                  >
                    {pkg.product.toLowerCase() === SIGNUP_PRODUCT ? (
                      <Bot className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Layers className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{productName(pkg.product)}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${productStatusDot(
                        pkg.status
                      )}`}
                    />
                  </NavLink>
                ))}
                <p className="px-3 py-2 text-[10px] italic text-gray-600">
                  More products coming soon
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom: Sign out (only place to sign out from the console) */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ===== Right column: top bar + routed page ===== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#0E0E12]/90 border-b border-white/10 backdrop-blur-xl">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Left: mobile menu toggle + mobile brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle navigation"
                className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
                <CeyraLogo className="w-7 h-7" />
                <span className="font-bold text-white text-base">CEYRA</span>
              </Link>
            </div>

            {/* Right: Home (icon only) + avatar/name → My Account */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                id="dashboard-home-btn"
                title="Back to Home"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboard/account"
                id="dashboard-avatar-btn"
                title="My Account"
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <BusinessAvatar
                  name={businessDisplayName}
                  avatarUrl={business?.logo_url}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-200 max-w-[140px] truncate">
                  {businessDisplayName}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Routed page content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}