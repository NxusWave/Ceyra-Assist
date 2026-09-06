import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

interface TierPlan {
  id: string;
  name: string;
  forWhom: string;
  monthlyPrice: string;
  annualMonthlyEquivalent: string;
  conversationsSpec: string;
  languagesSpec: string;
  knowledgeSpec: string;
  isPopular?: boolean;
  features: string[];
}

const PRICING_TIERS: TierPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    forWhom: 'Ideal for testing trilingual AI on small websites and personal shops.',
    monthlyPrice: 'LKR 7,500',
    annualMonthlyEquivalent: 'LKR 6,000',
    conversationsSpec: '100 / month',
    languagesSpec: 'Native Trilingual',
    knowledgeSpec: '1 Website or PDF',
    features: [
      '100 resolved conversations / month',
      'Native Trilingual NLP (Sinhala, Tamil, English)',
      '1 Website or PDF knowledge source',
      'Standard website embed widget',
      'Powered by Ceyra branding',
      'Community support & documentation',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    forWhom: 'Engineered for growing e-commerce brands, hotels, and active stores.',
    monthlyPrice: 'LKR 12,500',
    annualMonthlyEquivalent: 'LKR 10,000',
    conversationsSpec: '2,500 / month',
    languagesSpec: 'Full Trilingual + Dialects',
    knowledgeSpec: 'Unlimited URLs + 25 PDFs',
    isPopular: true,
    features: [
      '2,500 resolved conversations / month',
      'Trilingual + Singlish & Tanglish colloquial NLP',
      'Unlimited website pages & 25 PDFs',
      'Intelligent WhatsApp human handover',
      'Full brand customization & white-labeling',
      'Priority Colombo WhatsApp support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    forWhom: 'For high-volume enterprises requiring custom integrations and dedicated SLA.',
    monthlyPrice: 'LKR 45,000',
    annualMonthlyEquivalent: 'LKR 36,000',
    conversationsSpec: '15,000+ / month',
    languagesSpec: 'Trilingual + Custom Vocab',
    knowledgeSpec: 'Custom Integrations',
    features: [
      '15,000+ resolved conversations / month',
      'Trilingual with custom domain vocabularies',
      'Real-time ERP, SQL & Inventory Sync',
      'Multi-channel & custom webhook handovers',
      'Dedicated Sri Lanka local cloud instance',
      'Dedicated Colombo Account Manager (24/7)',
    ],
  },
];

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Simple pricing, no surprises
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Start your 7-day free trial today — no credit card required. Cancel anytime.
          </p>
        </div>

        {/* Segmented Controls: Billing Cycle + Currency */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
          {/* Billing Cycle Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            <button
              type="button"
              id="pricing-billing-monthly-btn"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              id="pricing-billing-annual-btn"
              onClick={() => setBillingCycle('annual')}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'annual'
                  ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Annual billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                Save 20%
              </span>
            </button>
          </div>

          {/* Currency Segmented Control (Visual only) */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              id="pricing-currency-lkr-btn"
              className="px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-white border border-white/15 shadow-sm cursor-default"
              aria-pressed="true"
            >
              LKR (Rs.)
            </button>
            <button
              type="button"
              id="pricing-currency-usd-btn"
              className="px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-400 opacity-60 cursor-not-allowed"
              disabled
              title="USD pricing coming soon"
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PRICING_TIERS.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ease-out backdrop-blur-md ${
                  isPopular
                    ? 'glass-panel-glow border-2 border-violet-500 shadow-2xl shadow-violet-600/20 lg:-translate-y-2 hover:scale-105 hover:border-violet-400 hover:shadow-violet-600/40 hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.4)] hover:z-10'
                    : 'glass-panel border border-white/10 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/20 hover:scale-105 hover:z-10'
                }`}
              >
                {/* Most Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-center text-[10px] font-bold tracking-wide uppercase text-white bg-violet-600 shadow-lg shadow-violet-600/40 whitespace-nowrap leading-tight">
                    Most Popular for<br />Growing Brands
                  </div>
                )}

                <div>
                  {/* 1. Plan Name + Description */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {plan.name}
                      </h3>
                      {isPopular && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-gray-300 border border-white/20 whitespace-nowrap">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 min-h-[36px] leading-relaxed">
                      {plan.forWhom}
                    </p>
                  </div>

                  {/* 2. Price + /month or /year + Note */}
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualMonthlyEquivalent}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        /month
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <span className="text-[11px] block mt-1.5 font-medium text-green-400">
                        Billed annually (Includes 20% discount)
                      </span>
                    )}
                  </div>

                  {/* Quick-Spec Box */}
                  <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Conversations:</span>
                      <span className="text-white font-bold">{plan.conversationsSpec}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Languages:</span>
                      <span className={`font-bold ${isPopular ? 'text-violet-400' : 'text-white'}`}>{plan.languagesSpec}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Knowledge:</span>
                      <span className="text-white font-bold">{plan.knowledgeSpec}</span>
                    </div>
                  </div>

                  {/* 3. Clean Checklist of Included Features */}
                  <div className="space-y-3.5">
                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      Included in {plan.name}:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed"
                        >
                          <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom: CTA Button + Subtle trial reassurance */}
                <div className="pt-6 mt-8 border-t border-white/5 space-y-3">
                  <button
                    type="button"
                    id={`pricing-plan-btn-${plan.id}`}
                    onClick={() => onSelectPlan(plan.name)}
                    className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 group active:scale-98"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                      7-day full access trial · Cancel anytime
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise footnote */}
        <div className="mt-14 text-center text-xs text-gray-400">
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
