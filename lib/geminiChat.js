import { GoogleGenAI } from "@google/genai";

// Gemini call wrapper shared by api/hero-chat.js and api/widget-chat.js so
// both endpoints behave identically (they diverged once and caused a 500).
//
// Model chain, overridable without code changes via env:
//   GEMINI_MODEL           — primary model (default: gemini-3.7-flash)
//   GEMINI_FALLBACK_MODELS — comma-separated models tried in order when the
//                            primary is rate-limited/overloaded. Different
//                            models have separate Google quota buckets, so a
//                            fallback often succeeds when the primary 429s.
const DEFAULT_PRIMARY_MODEL = "gemini-3.7-flash";
const DEFAULT_FALLBACK_MODELS = ["gemini-flash-latest"];

const MAX_ATTEMPTS_PER_MODEL = 2; // 1 immediate try + 1 retry
const RETRY_BACKOFF_MS = 1200; // pause before a retry (scales with attempt no.)

function parseModelList(value) {
  return (value || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export function getModelChain() {
  const primary = process.env.GEMINI_MODEL || DEFAULT_PRIMARY_MODEL;
  const fallbacks = process.env.GEMINI_FALLBACK_MODELS
    ? parseModelList(process.env.GEMINI_FALLBACK_MODELS)
    : DEFAULT_FALLBACK_MODELS;
  return [...new Set([primary, ...fallbacks])];
}

export function isRateLimitError(error) {
  if (!error) return false;
  if (error.status === 429 || error.isRateLimited === true) return true;
  const message = String(error.message || error);
  return /429|quota|resource.?exhausted|overloaded|high demand|rate.?limit/i.test(message);
}

// A fallback model that this key/project simply doesn't have access to
// (404 / not supported) should be skipped, not treated as a hard failure.
function isModelUnavailable(error) {
  const message = String(error?.message || error);
  return (
    error?.status === 404 ||
    /not found|not supported|does not exist|is not available/i.test(message)
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a reply with per-model retries and an ordered model fallback chain.
 *
 * @param {object} opts
 * @param {string} opts.apiKey              Gemini API key
 * @param {string} opts.message             User message
 * @param {string} opts.systemInstruction   System prompt
 * @param {Function} [opts.clientFactory]   DI hook for tests:
 *        (apiKey) => client with .models.generateContent()
 * @returns {Promise<{reply: string, model: string, attempts: Array}>}
 * @throws Error with .isRateLimited = true and .attempts when every
 *         model/attempt was rate-limited; rethrows other errors as-is.
 */
export async function generateReply({
  apiKey,
  message,
  systemInstruction,
  clientFactory,
}) {
  const makeClient = clientFactory || ((key) => new GoogleGenAI({ key }));
  const ai = makeClient(apiKey);
  const models = getModelChain();
  const attempts = [];

  for (let m = 0; m < models.length; m++) {
    const model = models[m];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: { systemInstruction },
        });
        const reply = response.text || "Sorry, I could not generate a response.";
        return { reply, model, attempts };
      } catch (error) {
        const rateLimited = isRateLimitError(error);
        attempts.push({
          model,
          attempt,
          rateLimited,
          detail: String(error?.message || error).slice(0, 300),
        });

        // Non-rate-limit failures on the primary model (bad request, invalid
        // key, etc.) are not fixable by retrying — bubble up immediately.
        if (!rateLimited && m === 0) {
          error.attempts = attempts; // keep the trail for diagnostics
          throw error;
        }

        // Non-rate-limit failures on a fallback model are only tolerated when
        // the model itself is unavailable; anything else is a real error.
        if (!rateLimited && m > 0 && !isModelUnavailable(error)) {
          error.attempts = attempts;
          throw error;
        }

        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(RETRY_BACKOFF_MS * attempt);
        }
        // otherwise: fall through to the next model in the chain
      }
    }
  }

  const exhausted = new Error(
    `All Gemini models rate-limited or unavailable (${models.join(", ")}).`
  );
  exhausted.isRateLimited = true;
  exhausted.attempts = attempts;
  throw exhausted;
}