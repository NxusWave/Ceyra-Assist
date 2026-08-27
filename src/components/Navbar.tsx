import { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, Globe, ChevronDown, CheckCircle2 } from 'lucide-react';
import CeyraLogo from './CeyraLogo';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDemo('starter')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500"
            >
              Get started
            </button>
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
                <span>Get started free</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
