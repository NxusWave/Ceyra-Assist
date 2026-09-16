import { useState, type ChangeEvent, type FormEvent } from 'react';
import { X, MailCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Enterprise contact form — opened from the pricing section's "Contact us"
 * link and the final CTA's "Talk to our team" button. Stores the request in
 * the `contact_requests` table (see contact-requests.table.sql).
 */
export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    message: '',
  });

  if (!isOpen) return null;

  const update =
    (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim() || !form.message.trim()) {
      setErrorMessage('Please fill in your name and a short message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('contact_requests').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        website: form.website.trim() || null,
        message: form.message.trim(),
        source: 'enterprise-pricing',
      });

      if (error) throw error;
      setStep('success');
    } catch (err: any) {
      console.error('Contact request failed:', err);
      setErrorMessage(
        err?.message || "Couldn't send your message right now. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setErrorMessage(null);
    setForm({ name: '', email: '', company: '', website: '', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0A0A0B] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close contact form"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="mb-5">
              <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3">
                Contact us
              </div>
              <h3 className="text-xl font-bold text-white">Talk to our team</h3>
              <p className="text-xs text-gray-400 mt-1.5">
                Custom volumes, private cloud hosting in Sri Lanka, custom API endpoints — tell us
                what you need and we'll get back to you.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Your name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="e.g. Nimal Perera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Work email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@company.lk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={update('company')}
                    placeholder="Company name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={update('website')}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  What do you need? *
                </label>
                <textarea
                  value={form.message}
                  onChange={update('message')}
                  rows={4}
                  placeholder="e.g. We handle ~20,000 conversations/month and need inventory sync with our ERP..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send message</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
              <MailCheck className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white">Message received</h3>

            <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
              Thanks {form.name.split(' ')[0] || 'there'} — our team will get back to you within one
              business day.
            </p>

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