import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
  auth: {
    // The session must survive page visits: it is persisted in localStorage
    // and access tokens are refreshed automatically while the user is active.
    // The session is ended ONLY by an explicit sign-out or by the inactivity
    // timeout enforced in AuthSessionManager (see src/components).
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
);
