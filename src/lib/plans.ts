// Canonical plan ids + normalization for signup CTAs.
// CTAs may pass display names ('Growth'), legacy marketing labels
// ('Ceyra Fast Setup', 'free-starter') or nothing at all — resolvePlanId
// maps everything to a valid plan id so the packages row always matches
// what the user actually selected.
export const DEFAULT_PLAN = 'starter';

export const PLAN_IDS = ['starter', 'growth', 'business', 'enterprise'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

const LEGACY_ALIASES: Record<string, PlanId> = {
  'custom enterprise': 'enterprise',
  'enterprise-walkthrough': 'enterprise',
  'free-starter': 'starter',
  'ceyra assist': 'starter',
  'ceyra fast setup': 'starter',
  'ceyra support ai': 'starter',
};

export function resolvePlanId(value?: string | null): PlanId {
  if (!value) return DEFAULT_PLAN;
  const key = value.trim().toLowerCase();
  if ((PLAN_IDS as readonly string[]).includes(key)) return key as PlanId;
  return LEGACY_ALIASES[key] || DEFAULT_PLAN;
}

export function planLabel(id?: string | null): string {
  switch ((id || '').toLowerCase()) {
    case 'growth':
      return 'Growth';
    case 'business':
      return 'Business';
    case 'enterprise':
      return 'Enterprise';
    default:
      return 'Starter';
  }
}