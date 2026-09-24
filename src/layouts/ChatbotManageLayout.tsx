import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { Sliders, Code2, MessageSquare, ArrowLeft } from 'lucide-react';

export default function ChatbotManageLayout() {
  const { chatbotId } = useParams();
  const location = useLocation();
  const base = `/dashboard/assist/bots/${chatbotId}`;
  const isDetails = location.pathname === base;
  const isEmbed = location.pathname === `${base}/embed`;
  const isConversations = location.pathname === `${base}/conversations`;

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/dashboard/assist/chatbots"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Chatbots</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 pb-4 border-b border-white/10 overflow-x-auto">
        <Link
          to={base}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
            isDetails ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Details</span>
        </Link>
        <Link
          to={`${base}/embed`}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
            isEmbed ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Embed & Domains</span>
        </Link>
        <Link
          to={`${base}/conversations`}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 rounded-t-xl transition-colors shrink-0 ${
            isConversations ? 'font-semibold border-violet-500 text-violet-300 bg-violet-600/10' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Conversations</span>
        </Link>
      </div>

      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  );
}
