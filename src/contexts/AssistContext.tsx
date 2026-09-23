import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from '../components/DemoModal';
import { resolvePlanId } from '../lib/plans';

export interface AssistChatbot {
  id: string;
  chatbot_name: string;
  public_agent_name: string;
  primary_color: string | null;
  avatar_url: string | null;
  created_at?: string;
}

const BOT_LIMITS: Record<string, number> = {
  starter: 1,
  growth: 5,
  business: 10,
  enterprise: 10,
};

interface AssistContextValue {
  user: any;
  business: any;
  chatbotId: string | null;
  setChatbotId: (id: string | null) => void;
  setActiveChatbot: (id: string) => void;
  plan: string;
  loading: boolean;
  chatbots: AssistChatbot[];
  botLimit: number;
  canCreateBot: boolean;
  createChatbot: () => Promise<string | null>;
  createError: string | null;
  updateLocalChatbot: (updated: Partial<AssistChatbot> & { id: string }) => void;
}

const AssistContext = createContext<AssistContextValue | undefined>(undefined);

export function useAssistContext() {
  const ctx = useContext(AssistContext);
  if (!ctx) throw new Error('useAssistContext must be used within AssistProvider');
  return ctx;
}

export function AssistProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [chatbots, setChatbots] = useState<AssistChatbot[]>([]);
  const [botLimit, setBotLimit] = useState<number>(1);
  const [createError, setCreateError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>('starter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAssistContext() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session || !session.user) {
          navigate('/', { replace: true });
          return;
        }

        const currentUser = session.user;
        if (isMounted) setUser(currentUser);

        let currentBusiness: any = null;
        const { data: existingBusinesses } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (existingBusinesses && existingBusinesses.length > 0) {
          currentBusiness = existingBusinesses[0];
        } else {
          const defaultBusinessName =
            currentUser.user_metadata?.company ||
            currentUser.user_metadata?.full_name ||
            'My Business';

          const { data: newBusiness } = await supabase
            .from('businesses')
            .insert([{ owner_id: currentUser.id, name: defaultBusinessName }])
            .select()
            .single();

          currentBusiness = newBusiness || { owner_id: currentUser.id, name: defaultBusinessName };
        }

        if (isMounted) setBusiness(currentBusiness);

        const businessId = currentBusiness?.id || null;

        // ensure packages row exists
        try {
          const { data: existingPackages } = await supabase
            .from('packages')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('product', SIGNUP_PRODUCT);

          if (!existingPackages || existingPackages.length === 0) {
            await supabase.from('packages').insert([{
              user_id: currentUser.id,
              product: SIGNUP_PRODUCT,
              status: 'trial',
              plan: resolvePlanId(currentUser.user_metadata?.plan),
              business_id: businessId,
            }]);
            if (businessId) {
              await supabase.from('businesses').update({ trial_used: true }).eq('id', businessId);
            }
          } else if (businessId) {
            const unlinked = existingPackages.filter((p: any) => !p.business_id);
            for (const p of unlinked) {
              await supabase.from('packages').update({ business_id: businessId }).eq('id', p.id);
            }
          }
        } catch (pkgErr) {
          console.warn('Packages check notice:', pkgErr);
        }

        // resolve plan
        let resolvedPlan = currentBusiness?.plan || '';
        if (!resolvedPlan) {
          const { data: packageRows } = await supabase
            .from('packages')
            .select('plan')
            .eq('user_id', currentUser.id)
            .eq('product', SIGNUP_PRODUCT)
            .maybeSingle();
          if (packageRows?.plan) resolvedPlan = packageRows.plan;
        }
        const activePlanStr = (resolvedPlan || resolvePlanId(currentUser.user_metadata?.plan) || 'starter').toLowerCase();
        if (isMounted) setPlan(activePlanStr);

        // Compute botLimit as SUM of each plan's bot allowance across ALL of the business's packages rows
        // Include both 'trial' and 'active' status packages
        let computedLimit = 1;
        try {
          const { data: packages } = await supabase
            .from('packages')
            .select('plan, status')
            .or(`business_id.eq.${businessId},user_id.eq.${currentUser.id}`)
            .in('status', ['trial', 'active']);

          const livePackages = (packages || []).filter(
            (p: any) => p.status === 'trial' || p.status === 'active'
          );

          const totalSum = livePackages.reduce(
            (sum: number, pkg: any) => sum + (BOT_LIMITS[pkg.plan?.toLowerCase()] || 0),
            0
          );

          computedLimit = totalSum > 0 ? totalSum : (BOT_LIMITS[activePlanStr] || 1);
        } catch (calcErr) {
          console.warn('Notice computing botLimit from packages:', calcErr);
          computedLimit = BOT_LIMITS[activePlanStr] || 1;
        }
        if (isMounted) setBotLimit(computedLimit);

        // Load ALL chatbots for the business, not just the oldest one
        if (businessId) {
          const { data: chatbotsData } = await supabase
            .from('chatbots')
            .select('id, chatbot_name, public_agent_name, primary_color, avatar_url, created_at')
            .eq('business_id', businessId)
            .order('created_at', { ascending: true });

          let loadedChatbots: AssistChatbot[] = (chatbotsData || []) as AssistChatbot[];

          // Auto-provision a first bot ONLY when zero exist for the business
          if (loadedChatbots.length === 0) {
            const { data: createdChatbot } = await supabase
              .from('chatbots')
              .insert([{
                business_id: businessId,
                chatbot_name: `${currentBusiness?.name || 'My Business'} Support`,
                public_agent_name: 'Ceyra Assistant',
              }])
              .select('id, chatbot_name, public_agent_name, primary_color, avatar_url, created_at')
              .single();

            if (createdChatbot) {
              loadedChatbots = [createdChatbot as AssistChatbot];
            }
          }

          if (isMounted) {
            setChatbots(loadedChatbots);

            // Restore active bot from localStorage if still exists, else fall back to oldest one
            const storedActiveId = localStorage.getItem(`ceyra_active_bot_${businessId}`);
            const matchingBot = loadedChatbots.find(b => b.id === storedActiveId);
            const activeId = matchingBot ? matchingBot.id : (loadedChatbots[0]?.id || null);

            setChatbotId(activeId);
            if (activeId) {
              try {
                localStorage.setItem(`ceyra_active_bot_${businessId}`, activeId);
              } catch (e) {
                console.warn('Failed to persist active bot to localStorage:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('AssistContext load error:', err);
        navigate('/', { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAssistContext();
    return () => { isMounted = false; };
  }, [navigate]);

  const setActiveChatbot = (id: string) => {
    setChatbotId(id);
    if (business?.id && id) {
      try {
        localStorage.setItem(`ceyra_active_bot_${business.id}`, id);
      } catch (e) {
        console.warn('Failed to persist active bot to localStorage:', e);
      }
    }
  };

  const setChatbotIdCompat = (id: string | null) => {
    setChatbotId(id);
    if (business?.id && id) {
      try {
        localStorage.setItem(`ceyra_active_bot_${business.id}`, id);
      } catch (e) {
        console.warn('Failed to persist active bot to localStorage:', e);
      }
    }
  };

  const updateLocalChatbot = (updated: Partial<AssistChatbot> & { id: string }) => {
    setChatbots(prev => prev.map(bot => bot.id === updated.id ? { ...bot, ...updated } : bot));
  };

  const canCreateBot = chatbots.length < botLimit;

  const createChatbot = async (): Promise<string | null> => {
    const businessId = business?.id;
    if (!businessId) {
      setCreateError('Business profile not loaded.');
      return null;
    }

    if (chatbots.length >= botLimit) {
      setCreateError(`Bot limit of ${botLimit} reached for your current plan.`);
      return null;
    }

    setCreateError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      let newBot: AssistChatbot | null = null;

      if (token) {
        try {
          const res = await fetch('/api/chatbot-create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ businessId }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json?.chatbot) {
              newBot = json.chatbot;
            }
          } else {
            const errJson = await res.json().catch(() => ({}));
            console.warn('Endpoint /api/chatbot-create error:', res.status, errJson);
            if (res.status === 403) {
              setCreateError(errJson?.error || 'Bot limit reached for your current plan.');
              return null;
            }
          }
        } catch (networkErr) {
          console.warn('Network error calling /api/chatbot-create, attempting client-side fallback:', networkErr);
        }
      }

      // Fallback to direct client-side insert if endpoint didn't succeed and canCreateBot is true
      if (!newBot) {
        if (chatbots.length >= botLimit) {
          setCreateError(`Bot limit of ${botLimit} reached for your current plan.`);
          return null;
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('chatbots')
          .insert({
            business_id: businessId,
            chatbot_name: 'New Chatbot',
            public_agent_name: 'Ceyra Assistant',
          })
          .select('id, chatbot_name, public_agent_name, primary_color, avatar_url, created_at')
          .single();

        if (fallbackError) {
          throw fallbackError;
        }
        newBot = fallbackData as AssistChatbot;
      }

      if (newBot) {
        setChatbots(prev => [...prev, newBot!]);
        setActiveChatbot(newBot.id);
        return newBot.id;
      }

      return null;
    } catch (err: any) {
      console.error('Failed to create chatbot:', err);
      setCreateError(err.message || 'Failed to create chatbot.');
      return null;
    }
  };

  return (
    <AssistContext.Provider
      value={{
        user,
        business,
        chatbotId,
        setChatbotId: setChatbotIdCompat,
        setActiveChatbot,
        plan,
        loading,
        chatbots,
        botLimit,
        canCreateBot,
        createChatbot,
        createError,
        updateLocalChatbot,
      }}
    >
      {children}
    </AssistContext.Provider>
  );
}
