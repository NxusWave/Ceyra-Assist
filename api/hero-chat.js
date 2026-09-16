import { generateReply, isRateLimitError } from "../lib/geminiChat.js";

// Give the serverless function room for cold starts + Gemini latency.
export const maxDuration = 60;

function buildSystemInstruction({ businessName, chatbotName, tone, replyLanguage }) {
  if (!businessName) {
    return "You are a helpful, friendly AI customer support assistant for a small business. Reply in the same language and script the customer used — Sinhala, Tamil, English, or a Singlish/Tanglish mix — matching their tone naturally. Keep answers short, friendly, and directly useful. If asked something specific you don't have details about, politely say you'd connect them with the team for that, without inventing details.";
  }

  let langInstruction =
    "Always reply in the same language and script the customer used — Sinhala, Tamil, English, or a Singlish/Tanglish mix — matching their tone naturally.";
  if (replyLanguage && replyLanguage !== "Auto-detect") {
    langInstruction = `Always reply in ${replyLanguage}, regardless of what language the customer writes in.`;
  }

  return `You are "${chatbotName || "the assistant"}", the AI customer support assistant for "${businessName}". Speak in a ${(tone || "friendly").toLowerCase()} tone. ${langInstruction} Keep answers short and directly useful. If asked something specific you don't have details about, politely say you'd connect them with the team for that, without inventing details.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message, businessName, chatbotName, tone, replyLanguage } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "An internal error occurred. Please try again later." });
    }

    const systemInstruction = buildSystemInstruction({ businessName, chatbotName, tone, replyLanguage });

    // Shared helper: per-model retry + model fallback (see lib/geminiChat.js).
    const { reply, model } = await generateReply({ apiKey, message, systemInstruction });
    return res.status(200).json({ reply, model });
  } catch (error) {
    console.error("hero-chat error:", {
      message: error?.message || String(error),
      attempts: error?.attempts,
    });

    if (isRateLimitError(error)) {
      // Google-side quota/overload — friendly, retryable response.
      return res.status(429).json({
        reply: "The assistant is busy right now — please send your message again in a moment.",
        // TEMPORARY DIAGNOSTIC: exposes the exact Gemini reason per attempt
        // (quota exceeded vs model overloaded). Remove once quota is resolved.
        errorDetail: error?.attempts?.length
          ? error.attempts
          : String(error?.message || error),
      });
    }

    // TEMPORARY DIAGNOSTIC: remove `errorDetail` once the endpoint is healthy.
    return res.status(500).json({
      error: "An error occurred while processing your request. Please try again later.",
      errorDetail: error?.message || String(error),
    });
  }
}
