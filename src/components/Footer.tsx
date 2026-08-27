import { Sparkles, Globe, ShieldCheck, Heart } from 'lucide-react';
import CeyraLogo from './CeyraLogo';

export default function Footer() {
  return (
    <footer id="main-footer" className="border-t border-white/5 text-gray-400 text-xs py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <CeyraLogo className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-white">
                Ceyra
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-violet-400 border border-white/10">
                Assist
              </span>
            </a>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The modern trilingual AI customer support platform engineered for Sri Lankan businesses —
              delivering instant, fluent customer resolution in Sinhala, Tamil, and Singlish.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              <span>All Systems Operational · SLA 99.98%</span>
            </div>

            <div className="pt-1 text-[11px] text-gray-400 flex items-center gap-1.5">
              <span>🇱🇰 Built for modern enterprises in Colombo, Sri Lanka</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Travel & Hospitality
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  E-commerce & Retail
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Clinics & Healthcare
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Tuition & Education
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Local Enterprises
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Company & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Ceyra
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Careers</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                    WE&apos;RE HIRING
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy (PDPA)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security Whitepaper
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <div>
            &copy; {new Date().getFullYear()} Ceyra AI Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Twitter / X
            </a>
            <a href="#" className="hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Discord Community
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
