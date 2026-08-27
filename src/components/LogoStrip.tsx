import { type ReactNode } from 'react';
import { TRUSTED_LOGOS } from '../data/content';
import { ShieldCheck, Compass, Anchor, ShoppingBag, Stethoscope, GraduationCap, Building2 } from 'lucide-react';

export default function LogoStrip() {
  const iconMap: Record<string, ReactNode> = {
    Resorts: <Compass className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
    Export: <Anchor className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
    'Supply Chain': <Building2 className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
    'E-commerce': <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
    Healthcare: <Stethoscope className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
    Education: <GraduationCap className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />,
  };

  return (
    <div id="trusted-by" className="py-8 border-y border-white/5 bg-black/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">
          Powering modern Sri Lankan enterprises & growing brands
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-center">
          {TRUSTED_LOGOS.map((item, index) => (
            <div
              key={index}
              className="group flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200"
            >
              {iconMap[item.category] || <Building2 className="w-4 h-4 text-gray-400" />}
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
