import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Globe, Plus, Trash2, Copy, Check, AlertTriangle, AlertCircle,
  Sparkles, ExternalLink, Loader2, ShieldCheck, Info,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAssistContext } from '../contexts/AssistContext';

interface ChatbotDomain {
  id: string;
  chatbot_id: string;
  domain: string;
}

function cleanDomainInput(raw: string): string {
  let cleaned = raw.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  if (cleaned.includes(':')) cleaned = cleaned.split(':')[0];
  return cleaned;
}

function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  if (domain === 'localhost' || domain === '127.0.0.1') return true;
  return /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain);
}

export default function EmbedSettingsPage() {
  const { chatbotId } = useParams();
  const { business } = useAssistContext();

  const [domains, setDomains] = useState<ChatbotDomain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const plan = (business?.plan || 'starter').toLowerCase();
  const isStarter = plan === 'starter' || plan === 'trial' || !plan;
  const isCapReached = isStarter && domains.length >= 1;

  useEffect(() => {
    if (!chatbotId) return;
    (async () => {
      setLoadingDomains(true);
      const { data } = await supabase
        .from('chatbot_domains')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: true });
      setDomains(data || []);
      setLoadingDomains(false);
    })();
  }, [chatbotId]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const clean = cleanDomainInput(newDomainInput.trim());
    if (!clean) return setInputError('Please enter a website domain.');
    if (!isValidDomain(clean)) return setInputError('Please enter a valid domain (e.g. mybakery.lk).');
    if (domains.some((d) => d.domain.toLowerCase() === clean)) return setInputError(`"${clean}" is already registered.`);
    if (isCapReached) return setInputError('Multiple domains are available on Growth plan and above. Upgrade to add more.');
    if (!chatbotId) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_domains')
        .insert([{ chatbot_id: chatbotId, domain: clean }])
        .select()
        .single();
      if (error) throw error;
      setDomains((prev) => [...prev, data]);
      setNewDomainInput('');
    } catch (err: any) {
      setInputError(err.message || 'Failed to register domain.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    setDeletingId(domainId);
    try {
      const { error } = await supabase.from('chatbot_domains').delete().eq('id', domainId);
      if (error) throw error;
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
    } catch (err: any) {
      setInputError(err.message || 'Failed to remove domain.');
    } finally {
      setDeletingId(null);
    }
  };

  const embedSnippet = `<script src="https://ceyra-assist.vercel.app/widget.js" data-chatbot-id="${chatbotId || '{chatbot_id}'}" async></script>`;

  const handleCopySnippet = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 rounded-3xl bg-[#111115]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">Allowed Domains</h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Only websites matching these registered hostnames can load your chatbot.</p>
            </div>
            <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-gray-300 font-medium">{planLabel} Plan:</span>
              <span className="text-violet-300 font-semibold">{isStarter ? '1 Domain allowed' : 'Unlimited Domains'}</span>
            </div>
          </div>

          {isCapReached && (
            <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-violet-200">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Starter Plan Limit Reached (1/1 Domain)</p>
                  <p className="text-violet-300/80 mt-0.5">Multiple domains are available on Growth plan and above.</p>
                </div>
              </div>
              <a href="/#pricing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md whitespace-nowrap self-start sm:self-auto">
                <span>Upgrade Plan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <form onSubmit={handleAddDomain} className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">Register New Domain</label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newDomainInput}
                onChange={(e) => { setNewDomainInput(e.target.value); if (inputError) setInputError(null); }}
                placeholder="e.g. mybakery.lk"
                disabled={isCapReached || isAdding}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isCapReached || isAdding || !newDomainInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{isAdding ? 'Registering...' : 'Add Domain'}</span>
              </button>
            </div>
            {inputError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{inputError}</span>
              </div>
            )}
          </form>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span>Registered Domains ({domains.length})</span>
              {isStarter && <span className="text-[11px] text-gray-500 font-normal">{domains.length}/1 used</span>}
            </div>
            {loadingDomains ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                <span>Loading...</span>
              </div>
            ) : domains.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                <Globe className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs font-medium text-gray-300">No domains registered yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
                {domains.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate font-mono">{item.domain}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Authorized Origin</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/10 text-gray-400 hover:text-rose-300 disabled:opacity-40"
                    >
                      {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-xs text-gray-400">
            <Info className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-gray-200">Local testing note: </span>
              <span className="font-mono text-violet-300">localhost</span> and <span className="font-mono text-violet-300">127.0.0.1</span> are always allowed.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        {domains.length === 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-200">Register at least one domain above before this widget will work on your site.</p>
          </div>
        )}

        <div className="p-6 rounded-3xl bg-[#111115]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Embed Script</h3>
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">HTML Widget</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Copy and paste this script tag into the <span className="font-mono text-violet-300">&lt;head&gt;</span> or before <span className="font-mono text-violet-300">&lt;/body&gt;</span>.
          </p>
          <div className="relative group">
            <div className="p-4 rounded-2xl bg-[#09090C] border border-white/10 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
              <span className="text-violet-400">&lt;script</span>{' '}
              <span className="text-blue-400">src</span>=
              <span className="text-emerald-400">"https://ceyra-assist.vercel.app/widget.js"</span>{' '}
              <span className="text-blue-400">data-chatbot-id</span>=
              <span className="text-emerald-400">"{chatbotId || '{chatbot_id}'}"</span>{' '}
              <span className="text-amber-400">async</span>
              <span className="text-violet-400">&gt;&lt;/script&gt;</span>
            </div>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-emerald-400" /><span className="text-emerald-300">Copied!</span></>
              ) : (
                <><Copy className="w-4 h-4 text-violet-400" /><span>Copy Embed Snippet</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
