import { type ReactNode } from 'react';
import { DatabaseZap, SlidersHorizontal, Code2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/content';

interface HowItWorksProps {
  onOpenDemo: () => void;
}

export default function HowItWorks({ onOpenDemo }: HowItWorksProps) {
  const iconMap: Record<string, ReactNode> = {
    DatabaseZap: <DatabaseZap className="w-5 h-5 text-violet-400" />,
    SlidersHorizontal: <SlidersHorizontal className="w-5 h-5 text-violet-400" />,
    Code2: <Code2 className="w-5 h-5 text-violet-400" />,
  };

  return (
    <section id="how-it-works" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Fast 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Live on your website in under 5 minutes.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            No machine learning engineers, no complicated APIs. Simple setup for business owners,
            marketers, and web teams.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div
              key={item.step}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/20 transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div>
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400">
                    {iconMap[item.icon]}
                  </div>
                  <span className="text-3xl font-bold text-gray-700 group-hover:text-violet-500/50 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-violet-400 border border-white/10 mb-3">
                  {item.badge}
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">
                  {item.title}
                </h3>
                <h4 className="text-xs font-semibold text-violet-400 mb-3">{item.subtitle}</h4>

                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  {item.metrics}
                </span>
                <span className="text-violet-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Learn more →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action bar */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onOpenDemo}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all"
          >
            <span>Start your 3-step setup free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
