import { useState } from 'react';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { PRICING_PLANS } from '../data/content';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'LKR' | 'USD'>('LKR');

  return (
    <section id="pricing" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Transparent, Scalable Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Start for free, scale as your business expands.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Transparent pricing without surprise overages. Choose your preferred currency in LKR or USD.
          </p>

          {/* Controls: Billing Cycle + Currency */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {/* Monthly / Annual Toggle */}
            <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Annual billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setCurrency('LKR')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currency === 'LKR'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                LKR (රු.)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const isHighlighted = plan.highlight;
            const price =
              currency === 'LKR'
                ? billingCycle === 'monthly'
                  ? `රු. ${plan.priceLKRMonthly.toLocaleString()}`
                  : `රු. ${plan.priceLKRAnnual.toLocaleString()}`
                : billingCycle === 'monthly'
                ? `$${plan.priceUSDMonthly}`
                : `$${plan.priceUSDAnnual}`;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 backdrop-blur-md ${
                  isHighlighted
                    ? 'bg-white/5 border-2 border-violet-500 shadow-2xl shadow-violet-600/10 lg:-translate-y-2'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular badge */}
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white bg-violet-600 shadow-lg shadow-violet-600/40">
                    MOST POPULAR FOR GROWING BRANDS
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 min-h-[32px] mb-6">{plan.tagline}</p>

                  {/* Price display */}
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold text-white">
                        {price}
                      </span>
                      {plan.priceUSDMonthly > 0 && (
                        <span className="text-xs text-gray-400">/ month</span>
                      )}
                    </div>
                    {billingCycle === 'annual' && plan.priceUSDMonthly > 0 && (
                      <span className="text-[11px] text-green-400 block mt-1">
                        Billed annually (Includes 20% discount)
                      </span>
                    )}
                    {plan.priceUSDMonthly === 0 && (
                      <span className="text-[11px] text-gray-400 block mt-1">
                        Free forever · No credit card required
                      </span>
                    )}
                  </div>

                  {/* Core limits highlight */}
                  <div className="space-y-2 mb-6 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Conversations:</span>
                      <span className="font-semibold text-white">{plan.limits.conversations}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Languages:</span>
                      <span className="font-semibold text-violet-300">{plan.limits.languages}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Knowledge:</span>
                      <span className="font-semibold text-white">{plan.limits.sources}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Included in {plan.name}:
                    </p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <button
                  type="button"
                  id={`pricing-plan-btn-${plan.id}`}
                  onClick={() => onSelectPlan(plan.name)}
                  className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isHighlighted
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise footnote */}
        <div className="mt-12 text-center text-xs text-gray-400">
          Need custom volume, private cloud hosting in Sri Lanka, or custom API endpoints?{' '}
          <button
            onClick={() => onSelectPlan('Custom Enterprise')}
            className="text-violet-400 font-semibold hover:underline"
          >
            Contact our Colombo enterprise team
          </button>
        </div>
      </div>
    </section>
  );
}
