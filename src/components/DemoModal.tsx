import { useState, type FormEvent } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Bot, Globe, Shield } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductOrPlan?: string;
}

export default function DemoModal({
  isOpen,
  onClose,
  initialProductOrPlan = 'Ceyra Assist',
}: DemoModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    primaryLang: 'trilingual',
    plan: initialProductOrPlan,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0A0A0B] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3">
              Get Started with Ceyra
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              Create your Trilingual AI Assistant
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Selected Configuration: <span className="text-violet-400 font-semibold">{initialProductOrPlan}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Fernando"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@brand.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="Colombo Luxury Stays"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Website URL or Shopify Store
                </label>
                <input
                  type="text"
                  placeholder="https://yourstore.lk (for instant knowledge indexing)"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Primary Customer Languages
                </label>
                <select
                  value={formData.primaryLang}
                  onChange={(e) => setFormData({ ...formData, primaryLang: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="trilingual">All 3: English + Sinhala (සිංහල) + Tamil (தமிழ்)</option>
                  <option value="en-si">English + Sinhala (සිංහල)</option>
                  <option value="en-ta">English + Tamil (தமிழ்)</option>
                  <option value="en-only">English only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Assistant Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 pt-2">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  Free 14-day trial
                </span>
                <span>·</span>
                <span>No credit card required</span>
                <span>·</span>
                <span>Instant bot generation</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white">
              Workspace Initialized!
            </h3>

            <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="text-white font-semibold">{formData.name || 'Friend'}</span>.
              We&apos;ve generated your custom Ceyra Assist instance and sent onboarding credentials
              to <span className="text-violet-300 font-semibold">{formData.email || 'your email'}</span>.
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-left max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Selected Plan:</span>
                <span className="text-white font-semibold">{formData.plan}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Bot ID:</span>
                <span className="text-green-400 font-mono">cy_9918x_live</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Languages:</span>
                <span className="text-violet-300">Sinhala · Tamil · English</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all"
              >
                Close & Return to Landing Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
