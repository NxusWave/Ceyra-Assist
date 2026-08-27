import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  Minimize2,
  Globe2,
  Zap,
} from 'lucide-react';
import { Language } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  lang?: Language;
}

export default function FloatingChatTester() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Ayubowan! 🙏 Welcome to Ceyra AI. You can test asking questions in English, Sinhala (සිංහල), or Tamil (தமிழ்). How can I assist your business today?',
      lang: 'en',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    {
      label: 'Islandwide delivery (EN)',
      text: 'What are your delivery times for Kandy and Galle?',
      lang: 'en' as Language,
    },
    {
      label: 'මිල ගණන් සහ COD (සිංහල)',
      text: 'Cash on Delivery තියෙනවද? බෙදාහැරීම් ගාස්තු කීයද?',
      lang: 'si' as Language,
    },
    {
      label: 'முன்பதிவு முறை (தமிழ்)',
      text: 'ஹோட்டல் முன்பதிவு மற்றும் சலுகை விவரங்கள் என்ன?',
      lang: 'ta' as Language,
    },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lower = text.toLowerCase();

      if (
        lower.includes('සිංහල') ||
        lower.includes('කොළඹ') ||
        lower.includes('මිල') ||
        lower.includes('බෙදාහැරීම්') ||
        lower.includes('cod') ||
        activeLang === 'si'
      ) {
        botResponse =
          'අප ආයතනය මුළු දිවයින පුරාම දින 2-3ක් ඇතුළත ආරක්ෂිතව භාණ්ඩ බෙදාහරිනු ලබයි. Cash on Delivery (COD), Koko සහ Mintpay මඟින් ගෙවීම් කළ හැක. වැඩිදුර විස්තර සඳහා WhatsApp ඔස්සේ අපගේ නියෝජිතයෙකු සම්බන්ධ කරගැනීමට අවශ්‍යද?';
      } else if (
        lower.includes('தமிழ்') ||
        lower.includes('டெலிவரி') ||
        lower.includes('முன்பதிவு') ||
        lower.includes('விலை') ||
        activeLang === 'ta'
      ) {
        botResponse =
          'நாங்கள் இலங்கை முழுவதும் 2–3 நாட்களில் விரைவான டெலிவரி வழங்குகிறோம். Cash on Delivery (COD), Koko தவணை முறைகள் மற்றும் கார்ட் மூலம் பணம் செலுத்தலாம். உங்களுக்கு வேறு ஏதேனும் உதவிகள் தேவையா?';
      } else {
        botResponse =
          'We provide autonomous 24/7 customer support across Sri Lanka. Ceyra answers in fluent Sinhala, Tamil, and English with instant document sync and zero-latency human escalation!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          lang: activeLang,
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
          </span>
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="text-xs font-bold tracking-wide">Test Ceyra AI</span>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[380px] h-[520px] rounded-3xl bg-[#0A0A0B] border border-white/10 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Ceyra Live Sandbox</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-gray-400">Trilingual Sri Lankan Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language bar */}
          <div className="px-3 py-1.5 bg-[#0A0A0B] border-b border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-gray-400 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-violet-400" />
              <span>Language:</span>
            </span>
            <div className="flex gap-1">
              {(['en', 'si', 'ta'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    activeLang === l
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'si' ? 'සිංහල' : 'தமிழ்'}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0A0B]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-xs shadow-md'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-xs shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 w-fit text-gray-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-200" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="p-2 bg-[#0A0A0B] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveLang(p.lang);
                  handleSend(p.text);
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-violet-600/20 border border-white/5 text-[10px] text-gray-300 hover:text-violet-300 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0A0A0B] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything in EN / සිංහල / தமிழ்..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
