import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { SIGNUP_PRODUCT } from '../components/DemoModal';

interface AssistContextValue {
  user: any;
  business: any;
  chatbotId: string | null;
  setChatbotId: (id: string | null) => void;
  plan: string;
  loading: boolean;
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
              plan: 'starter',
              business_id: businessId,
            }]);
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
        if (isMounted) setPlan((resolvedPlan || 'starter').toLowerCase());

        // ensure chatbot row exists
        if (businessId) {
          const { data: chatbotData } = await supabase
            .from('chatbots')
            .select('id')
            .eq('business_id', businessId)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (chatbotData) {
            if (isMounted) setChatbotId(chatbotData.id);
          } else {
            const { data: createdChatbot } = await supabase
              .from('chatbots')
              .insert([{
                business_id: businessId,
                chatbot_name: `${currentBusiness?.name || 'My Business'} Support`,
                public_agent_name: 'Ceyra Assistant',
              }])
              .select()
              .single();
            if (createdChatbot && isMounted) setChatbotId(createdChatbot.id);
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

  return (
    <AssistContext.Provider value={{ user, business, chatbotId, setChatbotId, plan, loading }}>
      {children}
    </AssistContext.Provider>
  );
}
