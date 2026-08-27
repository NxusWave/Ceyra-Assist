import { useState } from 'react';
import {
  Sparkles,
  Bot,
  Database,
  CheckCircle2,
  ArrowRight,
  Sliders,
  FileText,
  Globe2,
  Code,
  ShieldCheck,
  Zap,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface FeaturedSupportAIProps {
  onOpenDemo: (prefilled?: string) => void;
}

export default function FeaturedSupportAI({ onOpenDemo }: FeaturedSupportAIProps) {
  const [activeBuilderTab, setActiveBuilderTab] = useState<
    'knowledge' | 'prompt' | 'handover' | 'embed'
  >('knowledge');
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopy = () => {
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <section id="featured-support" className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline, Copy, Bullets, CTA */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Deep Dive · Ceyra Assist
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Deploy an assistant that speaks like your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                best team member.
              </span>
            </h2>

            <p className="text-base text-gray-400 leading-relaxed font-normal">
              Ceyra Assist learns directly from your website URLs, PDF product guides, and past
              WhatsApp chats. It resolves repetitive customer questions 24/7 across Sinhala, Tamil,
              and English with zero hallucinations.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3.5 pt-2">
              {[
                {
                  title: 'Native Trilingual Understanding',
                  desc: 'Fluently reads and responds in Sinhala (සිංහල), Tamil (தமிழ்), English, and Singlish.',
                },
                {
                  title: 'Instant Knowledge Ingestion',
                  desc: 'Auto-syncs with live Shopify catalogs, WordPress menus, and PDF pricelists.',
                },
                {
                  title: 'Smart Human Escalation',
                  desc: 'Seamlessly transfers complex queries to WhatsApp or Telegram with full context.',
                },
                {
                  title: '1-Line Embed & Fast Load',
                  desc: 'Lightweight embed widget works on any website without hurting Google SEO scores.',
                },
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-violet-600/20 text-violet-400 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{bullet.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="pt-3">
              <button
                type="button"
                id="build-chatbot-featured-btn"
                onClick={() => onOpenDemo('Ceyra Assist')}
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 group active:scale-98"
              >
                <span>Build your chatbot</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Refined Chatbot-Builder Dashboard Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
              {/* Top Navigation Bar inside Mockup */}
              <div className="px-5 py-3.5 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="h-4 w-[1px] bg-white/10 mx-1" />
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-violet-400" />
                    <span>Ceyra Bot Studio · &quot;Colombo Boutique Assistant&quot;</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    LIVE
                  </span>
                  <span className="text-gray-500 text-[11px]">ID: cy_8841a</span>
                </div>
              </div>

              {/* Sub-tabs inside Builder Mockup */}
              <div className="px-5 pt-3 bg-black/20 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
                  { id: 'prompt', label: 'Persona & Prompt', icon: Bot },
                  { id: 'handover', label: 'Handover Rules', icon: ShieldCheck },
                  { id: 'embed', label: 'Website Embed', icon: Code },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBuilderTab(tab.id as any)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                        activeBuilderTab === tab.id
                          ? 'border-violet-500 text-white bg-white/5'
                          : 'border-transparent text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mockup Tab Content */}
              <div className="p-6 bg-black/40 min-h-[360px]">
                {activeBuilderTab === 'knowledge' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Indexed Data Sources (3 Active)
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          AI refreshes documents automatically every 12 hours.
                        </p>
                      </div>
                      <button className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 text-[11px] font-medium flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3" />
                        <span>Sync Now</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        {
                          name: 'https://store.brand.lk/products (Shopify Catalog)',
                          type: 'Web Crawl',
                          size: '142 Pages',
                          status: 'Synced 14m ago',
                        },
                        {
                          name: 'Delivery_Rates_Islandwide_2026.pdf',
                          type: 'PDF Document',
                          size: '2.4 MB',
                          status: 'Synced 1h ago',
                        },
                        {
                          name: 'FAQ_Sinhala_Tamil_English_v3.xlsx',
                          type: 'Spreadsheet',
                          size: '420 Q&As',
                          status: 'Synced 3h ago',
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-200">{item.name}</div>
                              <div className="text-[10px] text-gray-500">{item.type} · {item.size}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-violet-500/5 border border-dashed border-violet-500/25 flex items-center justify-center gap-2 text-xs text-violet-300">
                      <span>+ Drag & drop new PDFs, Word docs, or website URLs to train instantly</span>
                    </div>
                  </div>
                )}

                {activeBuilderTab === 'prompt' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        System Prompt Persona Configurator
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Tone: Sri Lankan Warm Business</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-gray-300 leading-relaxed space-y-2">
                      <p className="text-violet-300">
                        // Core instructions executed by Ceyra LLM:
                      </p>
                      <p>
                        You are &apos;Asha&apos;, the official digital concierge for Colombo Boutique Resort.
                        Always greet visitors warmly. Support Sinhala (සිංහල), Tamil (தமிழ்), and English.
                      </p>
                      <p className="text-green-300">
                        Rules: Always quote room prices in LKR with tax included. If guest asks for Yala
                        safari packages, mention 4x4 jeeps with hotel pickup.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] text-gray-400 block">Greeting Language</span>
                        <span className="font-semibold text-white">Auto-Detect Visitor</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] text-gray-400 block">Creativity Temperature</span>
                        <span className="font-semibold text-white">0.2 (Factually Strict)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeBuilderTab === 'handover' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Human Escalation Routing
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-200">WhatsApp Notification</div>
                          <div className="text-[10px] text-gray-400">
                            Pings manager at +94 77 123 4567 when customer requests a human
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-200">Confidence Threshold</div>
                          <div className="text-[10px] text-gray-400">
                            Auto-escalate if AI certainty drops below 85%
                          </div>
                        </div>
                        <span className="text-violet-300 font-mono font-bold">85% Trigger</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeBuilderTab === 'embed' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        One-Line Embed Code
                      </span>
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3 h-3 text-green-200" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Tag</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      &lt;script src=&quot;https://cdn.ceyra.ai/v2/widget.js&quot; data-bot-id=&quot;cy_8841a&quot; async&gt;&lt;/script&gt;
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Paste before the &lt;/body&gt; tag on Shopify, WordPress, Webflow, or custom React apps.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom bar inside mockup */}
              <div className="px-5 py-2.5 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Globe2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Trilingual Accuracy Score: 99.4%</span>
                </span>
                <span className="text-green-400 font-medium">SSL Encrypted & PDPA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
