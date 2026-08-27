import { useState, type ReactNode } from 'react';
import {
  Palmtree,
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { INDUSTRY_USE_CASES } from '../data/content';
import { Language } from '../types';

interface IndustriesSectionProps {
  onOpenDemo: (industryName?: string) => void;
}

export default function IndustriesSection({ onOpenDemo }: IndustriesSectionProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('hospitality');
  const [dialogLang, setDialogLang] = useState<Language>('si');

  const activeCase =
    INDUSTRY_USE_CASES.find((c) => c.id === selectedIndustry) || INDUSTRY_USE_CASES[0];

  const iconMap: Record<string, ReactNode> = {
    Palmtree: <Palmtree className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Stethoscope: <Stethoscope className="w-5 h-5" />,
    GraduationCap: <GraduationCap className="w-5 h-5" />,
    Store: <Store className="w-5 h-5" />,
  };

  return (
    <section id="solutions" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Tailored Industry Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Built for the way Sri Lankan businesses operate.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            From Southern coast luxury resorts to Colombo retail brands and medical practices, Ceyra
            adapts to your vertical.
          </p>
        </div>

        {/* Industry Pill Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {INDUSTRY_USE_CASES.map((item) => {
            const isSelected = item.id === selectedIndustry;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndustry(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/25'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {iconMap[item.icon]}
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Summary & Key Metric */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  {iconMap[activeCase.icon]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {activeCase.title}
                  </h3>
                  <p className="text-xs text-violet-400 font-semibold">{activeCase.tag}</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">{activeCase.summary}</p>

              {/* Stat Highlight Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-green-500/20 text-green-400 flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {activeCase.keyMetric}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{activeCase.metricLabel}</div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onOpenDemo(activeCase.title)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all"
                >
                  <span>Build for {activeCase.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Trilingual Simulated Interaction */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                    <span>Real Inquiry Simulation</span>
                  </span>

                  {/* Language switch for this case */}
                  <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    {(['en', 'si', 'ta'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setDialogLang(lang)}
                        className={`px-2.5 py-1 text-[10px] rounded font-semibold ${
                          dialogLang === lang
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {lang === 'en' ? 'EN' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Customer Question */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-gray-500">Customer Inquiry</span>
                  <div className="inline-block bg-violet-600 text-white p-3 rounded-2xl rounded-tr-xs text-xs text-left leading-relaxed">
                    {activeCase.sampleQuestion[dialogLang]}
                  </div>
                </div>

                {/* Simulated Ceyra Response */}
                <div className="space-y-1 text-left">
                  <span className="text-[10px] text-violet-400 font-medium">Ceyra AI Response (Instant)</span>
                  <div className="bg-white/5 border border-white/5 text-gray-200 p-3.5 rounded-2xl rounded-tl-xs text-xs leading-relaxed">
                    {activeCase.sampleAnswer[dialogLang]}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>Accuracy: 99.7%</span>
                  <span>Avg Latency: 0.9s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
