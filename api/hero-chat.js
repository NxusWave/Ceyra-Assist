import { GoogleGenAI } from "@google/genai";

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

    // NOTE: deliberately no `httpOptions.headers["User-Agent"]` override here.
    // The "aistudio-build" User-Agent is AI Studio boilerplate and causes the
    // Gemini call to fail when the function runs outside AI Studio (Vercel).
    // widget-chat.js builds its client the same way and works in production.
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = buildSystemInstruction({ businessName, chatbotName, tone, replyLanguage });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "Sorry, I could not generate a response.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("hero-chat error:", error);

    const message = error?.message || "";
    const status = error?.status;
    const isRateLimited =
      status === 429 ||
      /429|quota|resource.?exhausted|overloaded|high demand|rate limit/i.test(message);

    if (isRateLimited) {
      return res.status(429).json({
        reply: "The assistant is busy right now — please send your message again in a moment.",
      });
    }

    // TEMPORARY DIAGNOSTIC: surface the underlying cause to the caller so a
    // failure can be identified from the browser Network tab / Vercel logs.
    // Remove `errorDetail` once the endpoint is confirmed healthy.
    return res.status(500).json({
      error: "An error occurred while processing your request. Please try again later.",
      errorDetail: message || String(error),
    });
  }
}
