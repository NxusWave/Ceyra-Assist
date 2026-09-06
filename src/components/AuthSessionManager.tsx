import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// How long a session may stay idle before it is ended automatically.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// localStorage key for the last recorded user activity.
const LAST_ACTIVITY_KEY = 'ceyra:last-activity';

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

/**
 * Global session lifecycle manager.
 *
 * The user's session persists across visits (Supabase stores it in
 * localStorage and refreshes tokens while the user is active). It is ended
 * ONLY in two cases:
 *   1. The user explicitly signs out (dashboard sign-out buttons).
 *   2. The user is inactive for INACTIVITY_TIMEOUT_MS — measured both while
 *      the app is open (activity listeners + idle timer) and while the tab is
 *      closed (persisted last-activity timestamp checked on load).
 *
 * When a session ends while the user is inside a dashboard route, they are
 * redirected back to the landing page.
 */
export default function AuthSessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    let authenticated = false;
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
    let lastPersisted = 0;

    const signOutForInactivity = async () => {
      inactivityTimer = null;
      if (!authenticated) return;
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Inactivity sign-out failed:', err);
      }
    };

    const startTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(signOutForInactivity, INACTIVITY_TIMEOUT_MS);
    };

    const recordActivity = () => {
      if (!authenticated) return;
      const now = Date.now();
      // Persist a coarse last-activity marker (at most every 30s) so that
      // inactivity while the tab is closed is also detected on next load.
      if (now - lastPersisted > 30_000) {
        lastPersisted = now;
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        } catch {
          /* storage unavailable — closed-tab inactivity simply won't persist */
        }
      }
      startTimer();
    };

    // 1. Detect inactivity that happened while the app was closed.
    supabase.auth.getSession().then(({ data }) => {
      authenticated = Boolean(data.session);
      if (authenticated) {
        let lastActivity = 0;
        try {
          lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
        } catch {
          lastActivity = 0;
        }
        if (lastActivity > 0 && Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
          // Stale session: user was inactive beyond the limit — end it.
          supabase.auth.signOut().catch(() => {});
          return;
        }
        recordActivity();
      }
    });

    // 2. React to live auth changes (sign-in, manual sign-out, timeout).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      authenticated = Boolean(session);

      if (authenticated) {
        recordActivity();
      } else if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }

      if (
        event === 'SIGNED_OUT' &&
        window.location.pathname.startsWith('/dashboard')
      ) {
        navigate('/', { replace: true });
      }
    });

    // 3. Track user activity while the app is open.
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, recordActivity, { passive: true })
    );

    return () => {
      subscription.unsubscribe();
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, recordActivity)
      );
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [navigate]);

  return null;
}