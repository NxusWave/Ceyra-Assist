import { useState } from 'react';
import {
  MessageSquareText,
  PhoneCall,
  Users2,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Volume2,
  Layers,
  Zap,
  Globe,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { CHAT_DEMO_SCRIPT, PRODUCTS_LIST } from '../data/content';
import { Language } from '../types';

interface ProductsBentoGridProps {
  onOpenDemo: (productName?: string) => void;
}

export default function ProductsBentoGrid({ onOpenDemo }: ProductsBentoGridProps) {
  const [activeLangFilter, setActiveLangFilter] = useState<'all' | Language>('all');

  const filteredMessages =
    activeLangFilter === 'all'
      ? CHAT_DEMO_SCRIPT
      : CHAT_DEMO_SCRIPT.filter((m) => m.lang === activeLangFilter);

  const supportAI = PRODUCTS_LIST[0];
  const voiceAI = PRODUCTS_LIST[1];
  const crmAI = PRODUCTS_LIST[2];
  const automationsAI = PRODUCTS_LIST[3];

  return (
    <section id="products" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            The Ceyra Product Suite
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Intelligent building blocks for the next era of business.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Deploy Ceyra Support AI immediately today, with voice, relationship intelligence, and
            automated operations seamlessly interconnecting into one platform.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Large Hero Bento Card: Ceyra Support AI (Col Span 12 or 7) */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div>
              {/* Top Header of Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <MessageSquareText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white">
                        {supportAI.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Trilingual Conversational AI Agent
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDemo('Ceyra Support AI')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all"
                >
                  <span>Build your chatbot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {supportAI.description}
              </p>

              {/* Mini Chatbot Interface Preview (English, Sinhala, Tamil) */}
              <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden shadow-xl mb-6">
                {/* Chat window top header with language filter tabs */}
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-200">
                      Live Multi-Turn Trilingual Stream
                    </span>
                  </div>

                  {/* Language switcher tabs */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    {(
                      [
                        { key: 'all', label: 'All Dialog' },
                        { key: 'en', label: 'English' },
                        { key: 'si', label: 'සිංහල' },
                        { key: 'ta', label: 'தமிழ்' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setActiveLangFilter(t.key)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          activeLangFilter === t.key
                            ? 'bg-violet-600 text-white font-semibold shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Stack */}
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto bg-black/30">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-violet-600/30 text-white border border-violet-500/30 rounded-tr-none'
                            : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-500 font-mono">
                        <span>{msg.timestamp}</span>
                        {msg.lang && (
                          <span className="uppercase text-violet-400 font-semibold">
                            [{msg.lang}]
                          </span>
                        )}
                        {msg.intent && <span>Intent: {msg.intent}</span>}
                        {msg.confidence && (
                          <span className="text-green-400">
                            Confidence {msg.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-white/5">
              {supportAI.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Column of 3 Smaller Bento Cards: Voice, CRM, Automations (Col Span 12 or 5) */}
          <div className="lg:col-span-12 xl:col-span-5 grid grid-cols-1 gap-6">
            {/* Voice AI Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-300">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-fuchsia-300 border border-fuchsia-500/20">
                  Coming soon
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">
                {voiceAI.title}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {voiceAI.tagline}
              </p>

              {/* Visual Soundwave Audio Mockup */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-[11px] text-fuchsia-300">
                  <Radio className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                  <span>Telephony Engine</span>
                </div>
                <div className="flex items-center gap-1 h-5">
                  <span className="w-1 h-3 bg-fuchsia-400/80 rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-fuchsia-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-fuchsia-400/60 rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-4 bg-fuchsia-400/90 rounded-full animate-pulse delay-100" />
                  <span className="w-1 h-1.5 bg-fuchsia-400/50 rounded-full" />
                </div>
                <span className="text-[10px] font-mono text-gray-400">&lt;480ms Latency</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>Sinhala / Tamil Phonetics</span>
                <span className="text-fuchsia-400 font-medium">Join Beta Waitlist →</span>
              </div>
            </div>

            {/* CRM AI Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-300">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-emerald-300 border border-emerald-500/20">
                  Coming soon
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">
                {crmAI.title}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {crmAI.tagline}
              </p>

              {/* Visual Pipeline Pill Preview */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <div className="font-bold">WhatsApp</div>
                  <div className="text-[9px] text-gray-400">142 Leads</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                  <div className="font-bold">High Intent</div>
                  <div className="text-[9px] text-gray-400">89 Qualified</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                  <div className="font-bold">Closed Deals</div>
                  <div className="text-[9px] text-gray-400">LKR 4.2M</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>Omnichannel Pipeline</span>
                <span className="text-emerald-400 font-medium">Join Beta Waitlist →</span>
              </div>
            </div>

            {/* Automations AI Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-cyan-300 border border-cyan-500/20">
                  Coming soon
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">
                {automationsAI.title}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {automationsAI.tagline}
              </p>

              {/* Visual Node Flow Preview */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px] text-gray-300 mb-3">
                <span className="px-2 py-1 rounded bg-violet-600/30 text-violet-300">
                  Chat Trigger
                </span>
                <span className="text-gray-500">→</span>
                <span className="px-2 py-1 rounded bg-cyan-600/30 text-cyan-300">LankaPay COD</span>
                <span className="text-gray-500">→</span>
                <span className="px-2 py-1 rounded bg-emerald-600/30 text-emerald-300">
                  Courier Dispatched
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>No-code Webhooks & Sync</span>
                <span className="text-cyan-400 font-medium">Join Beta Waitlist →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
