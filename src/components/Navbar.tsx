import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Globe, ChevronDown, CheckCircle2, LayoutDashboard, User, LogOut } from 'lucide-react';
import CeyraLogo from './CeyraLogo';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface NavbarProps {
  onOpenDemo: (prefilledPlan?: string) => void;
  onOpenLogin: () => void;
  currentLang: 'en' | 'si' | 'ta';
  onChangeLang: (lang: 'en' | 'si' | 'ta') => void;
}

export default function Navbar({
  onOpenDemo,
  onOpenLogin,
  currentLang,
  onChangeLang,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  // null = still checking, true = active Supabase session, false = signed out
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  // Signed-in user identity for the avatar dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const applyUser = (session: Session | null) => {
    if (session?.user) {
      const meta = (session.user.user_metadata || {}) as Record<string, string>;
      const email = session.user.email || '';
      setUserEmail(email);
      setUserName(
        meta.full_name || meta.name || meta.company || email.split('@')[0] || 'My Account'
      );
    } else {
      setUserEmail('');
      setUserName('');
    }
  };

  // Detect an existing session so a logged-in user is never shown as logged
  // out on the landing page and can always return to the dashboard without
  // re-authenticating.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      applyUser(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      applyUser(session);
      setUserMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close the user dropdown when clicking outside of it.
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const userInitials = (userName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const navLinks = [
    { name: 'Assist', href: '#featured-support' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Capabilities', href: '#capabilities' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Pricing', href: '#pricing' },
  ];

  const languageLabels: Record<'en' | 'si' | 'ta', { name: string; native: string }> = {
    en: { name: 'English', native: 'EN' },
    si: { name: 'Sinhala', native: 'සිංහල' },
    ta: { name: 'Tamil', native: 'தமிழ்' },
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 shadow-2xl py-3.5'
          : 'bg-black/20 backdrop-blur-xl border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <a
            href="#"
            id="brand-logo-link"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tighter text-white">
                CEYRA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-violet-400 border border-white/10">
                Assist
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-400">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-6">
            {/* Trilingual Language Selector */}
            <div className="relative">
              <button
                type="button"
                id="lang-selector-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                title="Switch Preview Language"
              >
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>{languageLabels[currentLang].native}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-xl bg-[#0F1015] border border-white/10 shadow-2xl z-50 backdrop-blur-xl">
                  {(['en', 'si', 'ta'] as const).map((langKey) => (
                    <button
                      key={langKey}
                      onClick={() => {
                        onChangeLang(langKey);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 flex items-center justify-between transition-colors"
                    >
                      <span>{languageLabels[langKey].name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {languageLabels[langKey].native}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasSession === false && (
              <>
                {/* Log In */}
                <button
                  type="button"
                  id="login-header-btn"
                  onClick={onOpenLogin}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Log in
                </button>

                {/* Rounded Full Get Started Button */}
                <button
                  type="button"
                  id="get-started-nav-btn"
                  onClick={() => onOpenDemo('starter')}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-600/25 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Get started</span>
                </button>
              </>
            )}

            {/* Session-aware: user avatar + name dropdown with account actions */}
            {hasSession && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="navbar-user-menu-btn"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0">
                    {userInitials}
                  </span>
                  <span className="text-sm font-medium text-gray-200 max-w-[140px] truncate">
                    {userName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    id="navbar-user-menu"
                    role="menu"
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0F1015] border border-white/10 shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                  >
                    {/* Identity header */}
                    <div className="px-3.5 pt-3 pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {userInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{userName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5" role="none">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </div>

                    <div className="py-1.5 border-t border-white/5" role="none">
                      <button
                        type="button"
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {hasSession && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}
            {hasSession === false && (
              <button
                type="button"
                onClick={() => onOpenDemo('starter')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500"
              >
                Get started
              </button>
            )}
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#0F1015]/95 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-gray-400">Language Mode</span>
              <div className="flex gap-1">
                {(['en', 'si', 'ta'] as const).map((langKey) => (
                  <button
                    key={langKey}
                    onClick={() => onChangeLang(langKey)}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      currentLang === langKey
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {languageLabels[langKey].native}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {hasSession && (
                <>
                  {/* Signed-in identity */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0">
                      {userInitials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-full shadow-md flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              )}
              {hasSession === false && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 rounded-full border border-white/10"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenDemo();
                    }}
                    className="w-full py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-full shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Start 7-Day Free Trial</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
