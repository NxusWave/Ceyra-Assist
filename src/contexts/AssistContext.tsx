import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from '../components/DemoModal';

export interface AssistChatbot {
  id: string;
  chatbot_name: string;
  public_agent_name: string;
  primary_color: string | null;
  avatar_url: string | null;
  created_at?: string;
  status?: string;
}

const BOT_LIMITS: Record<string, number> = { starter: 1, growth: 5, business: 10, enterprise: 10 };

interface AssistContextValue {
  user: any;
  business: any;
  loading: boolean;
  chatbots: AssistChatbot[];
  botLimit: number;
  canCreateBot: boolean;
  refreshChatbots: () => Promise<void>;
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
  const [chatbots, setChatbots] = useState<AssistChatbot[]>([]);
  const [botLimit, setBotLimit] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchChatbots = async (businessId: string) => {
    const { data } = await supabase
      .from('chatbots')
      .select('id, chatbot_name, public_agent_name, primary_color, avatar_url, created_at, status')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });
    setChatbots((data as AssistChatbot[]) || []);
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
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
              plan: 'starter',
              business_id: businessId,
            }]);
            await supabase.from('businesses').update({ trial_used: true }).eq('id', businessId);
          }

          const { data: packagesForLimit } = await supabase
            .from('packages')
            .select('plan, status')
            .eq('business_id', businessId)
            .in('status', ['trial', 'active']);

          const computedLimit = (packagesForLimit || []).reduce(
            (sum, pkg) => sum + (BOT_LIMITS[pkg.plan] || 0),
            0
          );
          if (isMounted) setBotLimit(computedLimit || 1);
        } catch (pkgErr) {
          console.warn('Packages check notice:', pkgErr);
        }

        if (businessId && isMounted) {
          await fetchChatbots(businessId);
        }
      } catch (err) {
        console.error('AssistContext load error:', err);
        navigate('/', { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [navigate]);

  const refreshChatbots = async () => {
    if (business?.id) await fetchChatbots(business.id);
  };

  const canCreateBot = chatbots.length < botLimit;

  return (
    <AssistContext.Provider value={{ user, business, loading, chatbots, botLimit, canCreateBot, refreshChatbots }}>
      {children}
    </AssistContext.Provider>
  );
}
