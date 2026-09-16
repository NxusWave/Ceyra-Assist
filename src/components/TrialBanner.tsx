import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import type { TrialInfo } from '../lib/trial';

interface TrialBannerProps {
  trial: TrialInfo | null;
}

/**
 * Persistent trial-status banner shown on every /dashboard/* page while the
 * owner's package is still on a trial. Renders nothing for paid plans.
 */
export default function TrialBanner({ trial }: TrialBannerProps) {
  if (!trial) return null;

  if (trial.state === 'expired') {
    return (
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-rose-200">
              Your 7-day free trial has ended
            </p>
            <p className="text-[11px] text-rose-300/80 mt-0.5">
              Your assistant has stopped responding to visitors. Pick a plan to go live again.
            </p>
          </div>
        </div>
        <a
          href="/#pricing"
          className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold transition-colors"
        >
          Choose a plan
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  const ending = trial.state === 'ending';

  return (
    <div
      className={`mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3 rounded-2xl border ${
        ending
          ? 'bg-amber-500/10 border-amber-500/25'
          : 'bg-violet-600/10 border-violet-500/20'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <Clock
          className={`w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0 ${
            ending ? 'text-amber-400' : 'text-violet-400'
          }`}
        />
        <p
          className={`text-xs ${
            ending ? 'text-amber-200' : 'text-gray-300'
          }`}
        >
          <span className="font-semibold">
            {trial.daysLeft === 1
              ? 'Last day'
              : `${trial.daysLeft} days left`}{' '}
            in your free trial.
          </span>{' '}
          <span className="text-gray-400">
            Choose a plan anytime to keep your assistant running without interruption.
          </span>
        </p>
      </div>
      <a
        href="/#pricing"
        className={`flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
          ending
            ? 'bg-amber-500 hover:bg-amber-400 text-black'
            : 'bg-violet-600 hover:bg-violet-500 text-white'
        }`}
      >
        View plans
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}