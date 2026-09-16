// 7-day free trial window, computed from the packages row's created_at.
// Deliberately derived (no schema change): the packages row is created at
// signup (or first dashboard provisioning), which is the trial start.
export const TRIAL_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrialInfo {
  state: 'active' | 'ending' | 'expired';
  daysLeft: number;
  endsAt: Date;
}

/** Trial info from a packages row's created_at; null when unknown. */
export function computeTrial(createdAt?: string | null): TrialInfo | null {
  if (!createdAt) return null;
  const startedAt = new Date(createdAt).getTime();
  if (Number.isNaN(startedAt)) return null;

  const endsAt = new Date(startedAt + TRIAL_DAYS * DAY_MS);
  const msLeft = endsAt.getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / DAY_MS));

  const state: TrialInfo['state'] =
    msLeft <= 0 ? 'expired' : daysLeft <= 2 ? 'ending' : 'active';

  return { state, daysLeft, endsAt };
}