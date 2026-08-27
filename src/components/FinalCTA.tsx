import { Sparkles, ArrowRight, Bot, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onOpenDemo: (plan?: string) => void;
}

export default function FinalCTA({ onOpenDemo }: FinalCTAProps) {
  return (
    <section className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-16 backdrop-blur-md shadow-2xl text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Get Started in 5 Minutes
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Your business deserves an assistant that{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                speaks your customers&apos; language.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Launch trilingual customer support in Sinhala, Tamil, and English today. Zero
              engineering required. Free tier includes 100 resolved conversations every month.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                id="final-cta-start-free-btn"
                onClick={() => onOpenDemo('free-starter')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>Start building free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="final-cta-book-demo-btn"
                onClick={() => onOpenDemo('enterprise-walkthrough')}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all active:scale-98"
              >
                Talk to our team
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Live in &lt; 5 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Sri Lanka PDPA compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
