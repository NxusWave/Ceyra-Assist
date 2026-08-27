import { useState, type FormEvent } from 'react';
import { X, Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import CeyraLogo from './CeyraLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onOpenRegister }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    setTimeout(() => {
      setLoggedIn(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0A0A0B] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!loggedIn ? (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <CeyraLogo className="w-8 h-8" />
              <span className="text-lg font-bold text-white">
                Ceyra Dashboard
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Sign in to your account
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Manage your trilingual assistants, analytics, and integrations.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@company.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-violet-400 hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center text-xs text-gray-400">
                Don&apos;t have a Ceyra account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                  className="text-violet-400 font-semibold hover:underline"
                >
                  Create one free
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Authenticated</h4>
            <p className="text-xs text-gray-400">Redirecting to Ceyra bot studio console...</p>
          </div>
        )}
      </div>
    </div>
  );
}
