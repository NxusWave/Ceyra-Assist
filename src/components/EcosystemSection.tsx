import { useState } from 'react';
import {
  MessageSquareText,
  PhoneCall,
  Users2,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Network,
  Share2,
  Database,
} from 'lucide-react';

interface EcosystemSectionProps {
  onOpenDemo: (module?: string) => void;
}

export default function EcosystemSection({ onOpenDemo }: EcosystemSectionProps) {
  const [hoveredNode, setHoveredNode] = useState<string>('support');

  return (
    <section id="ecosystem" className="py-24 relative border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            One Connected AI Platform
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Your single AI intelligence layer.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Start with Support AI today. As we release Voice, CRM, and Automations, your knowledge base
            and customer insights remain seamlessly unified without rebuilding.
          </p>
        </div>

        {/* Interactive Ecosystem Architecture Visualizer */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8 sm:p-12 shadow-2xl relative">
          {/* Grid of connected modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* 1. Ceyra Support AI (LIVE NOW) */}
            <div
              onMouseEnter={() => setHoveredNode('support')}
              className={`p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                hoveredNode === 'support'
                  ? 'bg-violet-600/10 border-violet-500 shadow-xl shadow-violet-500/10'
                  : 'bg-white/5 border-white/5 hover:border-violet-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400">
                  AVAILABLE NOW
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Ceyra Support AI
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Autonomous trilingual website & WhatsApp support agent.
              </p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-green-400 font-medium">Ready to Deploy</span>
                <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>

            {/* 2. Ceyra Voice (COMING SOON) */}
            <div
              onMouseEnter={() => setHoveredNode('voice')}
              className={`p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                hoveredNode === 'voice'
                  ? 'bg-violet-600/10 border-violet-500 shadow-xl shadow-violet-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                  Coming soon
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Ceyra Voice
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Sinhala & Tamil phone agents for bookings & notifications.
              </p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Shared Knowledge Base</span>
                <span className="text-gray-500">Beta Q3</span>
              </div>
            </div>

            {/* 3. Ceyra CRM (COMING SOON) */}
            <div
              onMouseEnter={() => setHoveredNode('crm')}
              className={`p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                hoveredNode === 'crm'
                  ? 'bg-violet-600/10 border-violet-500 shadow-xl shadow-violet-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                  Coming soon
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Ceyra CRM
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Turns chats across WhatsApp & web into structured lead pipelines.
              </p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Automatic Lead Scoring</span>
                <span className="text-gray-500">Beta Q4</span>
              </div>
            </div>

            {/* 4. Ceyra Automations (COMING SOON) */}
            <div
              onMouseEnter={() => setHoveredNode('automations')}
              className={`p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                hoveredNode === 'automations'
                  ? 'bg-violet-600/10 border-violet-500 shadow-xl shadow-violet-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                  Coming soon
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Ceyra Automations
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Triggers LankaPay payments, courier dispatches & ERP sync.
              </p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">No-code Workflows</span>
                <span className="text-gray-500">Beta Q4</span>
              </div>
            </div>
          </div>

          {/* Central Neural Hub Indicator */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Ceyra Shared Vector Intelligence</span>
                <span className="text-gray-400">One business brain powers all customer touchpoints</span>
              </div>
            </div>

            <button
              onClick={() => onOpenDemo()}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-medium transition-colors"
            >
              Explore early access beta →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
