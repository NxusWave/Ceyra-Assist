import { useState, type FormEvent } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Shield, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    website: '',
    primaryLang: 'trilingual',
    plan: initialProductOrPlan,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
            company: formData.company,
            website: formData.website,
            primary_lang: formData.primaryLang,
            plan: formData.plan,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setErrorMessage(null);
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
          onClick={handleReset}
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

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

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
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Website URL or Shopify Store
                  </label>
                  <input
                    type="text"
                    placeholder="https://yourstore.lk"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
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
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Assistant Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
              <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white">
              Check your email
            </h3>

            <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
              Check your email to confirm your account, then come back and log in.
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-center max-w-sm mx-auto space-y-1">
              <p className="text-gray-400">Confirmation sent to:</p>
              <p className="text-violet-300 font-semibold truncate">{formData.email}</p>
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
