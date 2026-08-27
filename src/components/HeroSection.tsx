import { useState, type FormEvent } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Bot,
  Zap,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Globe2,
  CornerDownLeft,
} from 'lucide-react';
import { TRILINGUAL_HERO_DEMO } from '../data/content';
import { Language } from '../types';

interface HeroSectionProps {
  onOpenDemo: () => void;
  onExploreProducts: () => void;
  selectedLang: Language;
  onSelectLang: (lang: Language) => void;
}

export default function HeroSection({
  onOpenDemo,
  onExploreProducts,
  selectedLang,
  onSelectLang,
}: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<Language>(selectedLang);
  const [inputVal, setInputVal] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const demoData = TRILINGUAL_HERO_DEMO[activeTab];

  const handleQuickQuestion = (lang: Language) => {
    setActiveTab(lang);
    onSelectLang(lang);
    setSubmittedQuery(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSubmittedQuery(inputVal);
    setInputVal('');
  };

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-36 md:pb-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-7 text-left">
            {/* Small Badge */}
            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
              AI built for growing businesses
            </div>

            {/* Oversized Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white">
              AI products that help your business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                do more.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              From customer support to intelligent CRM, Ceyra provides practical AI tools designed
              for the unique communication needs of Sri Lankan businesses in Sinhala, Tamil, and English.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                id="hero-explore-products-btn"
                onClick={onExploreProducts}
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>Explore products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="hero-book-demo-btn"
                onClick={onOpenDemo}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Book a demo</span>
              </button>
            </div>

            {/* Key Micro Trust Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/5 max-w-xl">
              <div>
                <div className="text-2xl font-bold text-white">82%</div>
                <div className="text-xs text-gray-400 mt-0.5">Automated resolution</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">&lt; 1.2s</div>
                <div className="text-xs text-gray-400 mt-0.5">Response latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">3-in-1</div>
                <div className="text-xs text-gray-400 mt-0.5">Sinhala · Tamil · English</div>
              </div>
            </div>
          </div>

          {/* Right Column: Abstract Dashboard / Live Trilingual Chat Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl space-y-4">
              {/* Top Window Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-white">
                    Ceyra Support AI
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
                    ACTIVE
                  </span>
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                    {(['en', 'si', 'ta'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleQuickQuestion(lang)}
                        className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                          activeTab === lang
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {lang === 'en' ? 'EN' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Body Messages */}
              <div className="space-y-3.5 min-h-[260px] flex flex-col justify-between">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {/* Default or Trilingual Sample Bubble */}
                  <div className="bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-white/5 text-sm max-w-[85%] text-gray-200 leading-relaxed">
                    {activeTab === 'si'
                      ? 'හෙලෝ! මම ඔබට කොහොමද උදව් කරන්නේ? Cash on Delivery සහ බෙදාහැරීම් පිළිබඳව විමසිය හැක.'
                      : activeTab === 'ta'
                      ? 'வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? விநியோகம் மற்றும் சலுகைகள் பற்றி கேளுங்கள்.'
                      : 'Hello! How can I help your business today? Ask anything about delivery, orders, or booking.'}
                  </div>

                  {/* User Query Message */}
                  <div className="bg-violet-600/20 p-3.5 rounded-2xl rounded-tr-none border border-violet-500/30 text-sm ml-auto max-w-[85%] text-white leading-relaxed">
                    {submittedQuery || demoData.question}
                  </div>

                  {/* AI Response Card */}
                  <div className="bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-white/5 text-sm max-w-[90%] text-gray-200 leading-relaxed">
                    <p>{demoData.answer}</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-400">
                      <span className="text-green-400 font-medium">
                        Confidence: {demoData.confidence}
                      </span>
                      <span>·</span>
                      <span className="text-violet-400 font-medium">{demoData.intent}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Input */}
                <form
                  onSubmit={handleSubmit}
                  className="relative pt-2 border-t border-white/5"
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={
                        activeTab === 'en'
                          ? 'Ask anything in English...'
                          : activeTab === 'si'
                          ? 'සිංහලෙන් ඕනෑම දෙයක් අසන්න...'
                          : 'தமிழில் கேளுங்கள்...'
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                      title="Send message"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
