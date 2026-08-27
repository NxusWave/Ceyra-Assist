import { useState } from 'react';
import {
  BookOpenCheck,
  Languages,
  UserCheck,
  Inbox,
  Palette,
  Layers,
  Sparkles,
  Check,
  ArrowRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { CAPABILITIES_LIST } from '../data/content';

export default function CapabilitiesBento() {
  const [activeLangSample, setActiveLangSample] = useState<'en' | 'si' | 'ta'>('si');

  return (
    <section id="capabilities" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Engineered for enterprise reliability, calibrated for Sri Lanka.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Everything your business requires to deliver accurate, delightful, and brand-aligned
            customer experiences around the clock.
          </p>
        </div>

        {/* 6-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Website and FAQ Training */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-violet-400 border border-white/10">
                  Live Sync
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Website & FAQ Training
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Ceyra crawls your online store, knowledge base, PDF catalogs, and Google Sheets to
                absorb exact product specs, prices, and policies.
              </p>

              {/* Visual preview */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-300">
                  <span>URL Ingestion: store.lk/menu</span>
                  <span className="text-green-400 font-mono">100% Vectorized</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="w-full bg-violet-500 h-full rounded-full" />
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Automatic daily sync</span>
              <span className="text-violet-400">Zero manual upkeep</span>
            </div>
          </div>

          {/* 2. Sinhala/Tamil/English Replies */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Languages className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  Proprietary NLP
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Sinhala, Tamil & English Native
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Handles colloquial nuances, polite local honorifics, and Singlish/Tanglish queries
                with conversational fluency.
              </p>

              {/* Interactive sample switcher */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex gap-1">
                  {(['en', 'si', 'ta'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setActiveLangSample(l)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        activeLangSample === l
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {l === 'en' ? 'EN' : l === 'si' ? 'සිංහල' : 'தமிழ்'}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-gray-200 font-medium">
                  {activeLangSample === 'en' && '“Delivery is free within Colombo 01–15 for orders above LKR 5,000.”'}
                  {activeLangSample === 'si' && '“රු. 5,000ට වැඩි ඇණවුම් සඳහා කොළඹ 01–15 නොමිලේ බෙදාහැරේ.”'}
                  {activeLangSample === 'ta' && '“ரூ. 5,000க்கு மேற்பட்ட ஆர்டர்களுக்கு கொழும்பு 01–15 இலவச டெலிவரி.”'}
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Automatic script detection</span>
              <span className="text-green-400">99.4% intent match</span>
            </div>
          </div>

          {/* 3. Human Handover */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  Zero Drop-off
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Intelligent Human Handover
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Escalates VIP questions, disputes, or custom order requests directly to your human
                support agents on WhatsApp or web inbox.
              </p>

              {/* Handover preview */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5 text-[11px]">
                <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div className="text-gray-300 truncate">
                  <span className="font-semibold text-white">WhatsApp Agent Alert:</span> &quot;Customer asking for custom bulk order discount&quot;
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Context passed automatically</span>
              <span className="text-violet-400">No repeat questions</span>
            </div>
          </div>

          {/* 4. Conversation Inbox */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Inbox className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  Live View
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Unified Conversation Inbox
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Filter conversations by sentiment, language, or resolution status. Inspect chat
                histories and jump into active sessions anytime.
              </p>

              {/* Mini inbox stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-gray-400">Resolved</div>
                  <div className="font-bold text-white text-xs mt-0.5">82.4%</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-gray-400">Satisfaction</div>
                  <div className="font-bold text-green-400 text-xs mt-0.5">4.9 / 5</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-gray-400">Avg Time</div>
                  <div className="font-bold text-white text-xs mt-0.5">1.2s</div>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Full transcript export</span>
              <span className="text-violet-400">CSV & Webhook sync</span>
            </div>
          </div>

          {/* 5. Brand Customization */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Palette className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  White-label
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Brand Customization
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Tailor primary accent colors, widget launcher icons, welcome greeting messages, and
                bot avatar to seamlessly blend into your company website.
              </p>

              {/* Color swatch demo */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-violet-600 border border-white/20" />
                  <span className="w-4 h-4 rounded-full bg-indigo-500 border border-white/20" />
                  <span className="w-4 h-4 rounded-full bg-blue-500 border border-white/20" />
                  <span className="w-4 h-4 rounded-full bg-green-500 border border-white/20" />
                  <span className="w-4 h-4 rounded-full bg-amber-500 border border-white/20" />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">#7C3AED Accent</span>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Dark & Light mode support</span>
              <span className="text-violet-400">Custom CSS support</span>
            </div>
          </div>

          {/* 6. Simple Website Embed */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  &lt;22KB Bundle
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Simple Website Embed
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                One asynchronous script tag. Compatible with Shopify, WooCommerce, WordPress, Wix,
                Squarespace, Webflow, and custom codebases.
              </p>

              {/* Code snippet badge */}
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[10px] text-green-400 truncate">
                &lt;script src=&quot;https://cdn.ceyra.ai/v2/widget.js&quot;&gt;&lt;/script&gt;
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>No iframe lag</span>
              <span className="text-green-400">100/100 Core Web Vitals</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
