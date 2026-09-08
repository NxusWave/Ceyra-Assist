import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Info,
  Code2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

interface ChatbotDomain {
  id: string;
  chatbot_id: string;
  domain?: string;
  domain_name?: string;
  created_at?: string;
}

/**
 * Normalizes input domain by stripping protocol, trailing slashes, paths, query, and port.
 * e.g. "https://mybakery.lk/store?ref=1" -> "mybakery.lk"
 */
function cleanDomainInput(raw: string): string {
  let cleaned = raw.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[0];
  }
  return cleaned;
}

/**
 * Validates whether string is domain-shaped (or localhost for dev convenience).
 */
function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  if (domain === 'localhost' || domain === '127.0.0.1') return true;
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

export default function EmbedSettingsPage() {
  const { business, chatbotId, plan } = useAssistContext();

  const [domains, setDomains] = useState<ChatbotDomain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  // Form states
  const [newDomainInput, setNewDomainInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Copy snippet feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDomains() {
      if (!chatbotId) {
        setLoadingDomains(false);
        return;
      }
      setLoadingDomains(true);
      try {
        const { data: domainRows, error: domError } = await supabase
          .from('chatbot_domains')
          .select('*')
          .eq('chatbot_id', chatbotId)
          .order('created_at', { ascending: true });

        if (domError) {
          console.warn('Notice loading chatbot_domains:', domError.message);
        }

        if (isMounted && domainRows) {
          setDomains(domainRows);
        }
      } catch (err) {
        console.error('Error loading embed domains:', err);
      } finally {
        if (isMounted) {
          setLoadingDomains(false);
        }
      }
    }

    loadDomains();

    return () => {
      isMounted = false;
    };
  }, [chatbotId]);

  const isStarter = plan === 'starter' || plan === 'trial' || plan === 'free' || !plan;
  const isCapReached = isStarter && domains.length >= 1;

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const raw = newDomainInput.trim();
    if (!raw) {
      setInputError('Please enter a website domain.');
      return;
    }

    const clean = cleanDomainInput(raw);

    if (!isValidDomain(clean)) {
      setInputError('Please enter a valid domain (e.g. mybakery.lk). Protocol and paths are automatically stripped.');
      return;
    }

    // Check duplicate
    const alreadyExists = domains.some(
      (d) => (d.domain || d.domain_name || '').toLowerCase() === clean
    );
    if (alreadyExists) {
      setInputError(`The domain "${clean}" is already registered.`);
      return;
    }

    // Plan gating check: starter plan allows only ONE domain total
    if (isCapReached) {
      setInputError('Multiple domains are available on Growth plan and above. Upgrade to add more.');
      return;
    }

    if (!chatbotId) {
      setInputError('Chatbot configuration is still loading. Please try again in a moment.');
      return;
    }

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_domains')
        .insert([
          {
            chatbot_id: chatbotId,
            domain: clean,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setDomains((prev) => [...prev, data]);
      } else {
        setDomains((prev) => [
          ...prev,
          { id: `temp-${Date.now()}`, chatbot_id: chatbotId, domain: clean },
        ]);
      }

      setNewDomainInput('');
    } catch (err: any) {
      console.error('Error adding domain:', err);
      setInputError(err.message || 'Failed to register domain. Please check permissions.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDomain = async (domainId: string, domainName: string) => {
    setDeletingId(domainId);
    setInputError(null);

    try {
      const { error } = await supabase
        .from('chatbot_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        throw error;
      }

      setDomains((prev) => prev.filter((d) => d.id !== domainId));
    } catch (err: any) {
      console.error('Error removing domain:', err);
      setInputError(`Failed to remove ${domainName}: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const embedSnippet = `<script src="https://assist.ceyra.ai/widget.js" data-chatbot-id="${chatbotId || '{chatbot_id}'}" async></script>`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  const planLabel = (plan || 'starter').charAt(0).toUpperCase() + (plan || 'starter').slice(1);

  return (
    <div className="pt-6">
      {/* Main Grid: Allowed Domains on Left (7 cols), Snippet & Instructions on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Allowed Domains */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#111115]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-400" />
                  <h2 className="text-base font-bold text-white">Allowed Domains</h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Only websites matching these registered hostnames can load your chatbot.
                </p>
              </div>

              {/* Plan status pill */}
              <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-gray-300 font-medium">
                  {planLabel} Plan:
                </span>
                <span className="text-violet-300 font-semibold">
                  {isStarter ? '1 Domain allowed' : 'Unlimited Domains'}
                </span>
              </div>
            </div>

            {/* Plan Gating Alert when cap is reached on Starter */}
            {isCapReached && (
              <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-violet-200 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Starter Plan Limit Reached (1/1 Domain)</p>
                    <p className="text-violet-300/80 mt-0.5">
                      Multiple domains are available on Growth plan and above. Upgrade to add more.
                    </p>
                  </div>
                </div>
                <Link
                  to="/#pricing"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  <span>Upgrade Plan</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Add Domain Form */}
            <form onSubmit={handleAddDomain} className="space-y-3">
              <label htmlFor="new-domain-input" className="block text-xs font-semibold text-gray-300">
                Register New Domain
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="new-domain-input"
                    type="text"
                    value={newDomainInput}
                    onChange={(e) => {
                      setNewDomainInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    placeholder="e.g. mybakery.lk"
                    disabled={isCapReached || isAdding}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCapReached || isAdding || !newDomainInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 whitespace-nowrap"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isAdding ? 'Registering...' : 'Add Domain'}</span>
                </button>
              </div>

              {/* Inline Validation / Gating Error */}
              {inputError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{inputError}</span>
                    {inputError.includes('Growth plan') && (
                      <Link
                        to="/#pricing"
                        className="ml-2 font-semibold text-violet-300 underline hover:text-violet-200 inline-flex items-center gap-1"
                      >
                        View Pricing
                        <ExternalLink className="w-3 h-3 inline" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* List of Registered Domains */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span>Registered Domains ({domains.length})</span>
                {isStarter && (
                  <span className="text-[11px] text-gray-500 font-normal">
                    {domains.length}/1 used
                  </span>
                )}
              </div>

              {loadingDomains ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs text-gray-500 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>Loading registered domains...</span>
                </div>
              ) : domains.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <Globe className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs font-medium text-gray-300">
                    No domains registered yet
                  </p>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Enter your live website domain above (e.g. <span className="text-gray-300 font-mono">colombobakery.lk</span>) to authorize the widget script.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
                  {domains.map((item) => {
                    const domainStr = item.domain || item.domain_name || 'unnamed-domain';
                    const isDeleting = deletingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate font-mono">
                              {domainStr}
                            </p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Authorized Origin</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(item.id, domainStr)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/25 text-gray-400 hover:text-rose-300 text-xs transition-colors disabled:opacity-40"
                          title={`Remove ${domainStr}`}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Informational Localhost Note */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-xs text-gray-400">
              <Info className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-gray-200">Local testing note: </span>
                <span className="font-mono text-violet-300">localhost</span> and{' '}
                <span className="font-mono text-violet-300">127.0.0.1</span> are always allowed for
                local testing and don't count toward your domain limit.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Embed Script Snippet & Integration Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Warning Banner if No Domains Registered */}
          {domains.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-300 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-amber-200">
                  Register at least one domain above before this widget will work on your site.
                </p>
                <p className="text-amber-300/80 leading-relaxed">
                  For your security and token protection, the widget API rejects requests originating from unauthorized domains.
                </p>
              </div>
            </div>
          )}

          {/* Snippet Card */}
          <div className="p-6 rounded-3xl bg-[#111115]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Embed Script</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                HTML Widget
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Copy and paste this script tag into the <span className="font-mono text-violet-300">&lt;head&gt;</span> or immediately before the closing <span className="font-mono text-violet-300">&lt;/body&gt;</span> tag of your website.
            </p>

            {/* Code Block */}
            <div className="relative group">
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/10 font-mono text-xs text-gray-300 overflow-x-auto selection:bg-violet-600 selection:text-white leading-relaxed">
                <span className="text-violet-400">&lt;script</span>{' '}
                <span className="text-blue-400">src</span>=
                <span className="text-emerald-400">"https://assist.ceyra.ai/widget.js"</span>{' '}
                <span className="text-blue-400">data-chatbot-id</span>=
                <span className="text-emerald-400">"{chatbotId || '{chatbot_id}'}"</span>{' '}
                <span className="text-amber-400">async</span>
                <span className="text-violet-400">&gt;&lt;/script&gt;</span>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopySnippet}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 text-xs font-semibold text-white transition-all shadow-sm group-hover:border-white/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-violet-400" />
                    <span>Copy Embed Snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Setup instructions */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Quick CMS Compatibility</span>
              </h4>
              <div className="space-y-2 text-[11px] text-gray-400">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-semibold text-gray-300">Shopify</p>
                  <p className="text-gray-400 mt-0.5">
                    Online Store → Themes → Edit code → paste inside <span className="font-mono text-gray-300">theme.liquid</span> before <span className="font-mono text-gray-300">&lt;/body&gt;</span>.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-semibold text-gray-300">WordPress & WooCommerce</p>
                  <p className="text-gray-400 mt-0.5">
                    Use WPCode or Header/Footer script injector plugin to add to site footer.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-semibold text-gray-300">Custom HTML / Next.js</p>
                  <p className="text-gray-400 mt-0.5">
                    Add standard script tag into root template or layout file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
