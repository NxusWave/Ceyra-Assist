import { GoogleGenAI } from "@google/genai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function sanitizeEnvValue(val, keyPrefixes = []) {
  if (!val || typeof val !== "string") return "";
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  for (const prefix of keyPrefixes) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase() + "=")) {
      cleaned = cleaned.slice(prefix.length + 1).trim();
      break;
    }
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function getUpstashCredentials() {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

  let url = sanitizeEnvValue(rawUrl, ["UPSTASH_REDIS_REST_URL", "KV_REST_API_URL"]);
  const token = sanitizeEnvValue(rawToken, ["UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN"]);

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes("=")) {
      const idx = url.indexOf("=");
      url = url.slice(idx + 1).trim();
    }
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
  }

  return { url, token };
}

let ratelimitInstance = null;

function getRatelimit() {
  if (ratelimitInstance) return ratelimitInstance;

  const { url, token } = getUpstashCredentials();
  if (!url || !token) {
    return null;
  }

  try {
    const redis = new Redis({ url, token });
    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
    });
    return ratelimitInstance;
  } catch (err) {
    console.error("Failed to initialize Upstash Ratelimit:", err);
    return null;
  }
}

const SYSTEM_INSTRUCTION = "You are the AI customer support assistant for 'Colombo Boutique Bakery', a fictional small bakery and cafe in Colombo, Sri Lanka, used here only as a demo. Business facts: delivery is islandwide within 2-3 business days; orders placed before 11:00 AM ship same-day; Cash on Delivery, Mintpay 3-month installments, Koko, and all major Visa/Mastercard are accepted; custom cake orders need 48 hours notice; the shop is open 8am-8pm daily. Always reply in the same language and script the customer used — Sinhala, Tamil, English, or a Singlish/Tanglish mix — matching their tone naturally. Keep answers short, friendly, and directly useful. If asked something outside these business facts, politely say you'd connect them with the team for that, without inventing details.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : Array.isArray(forwarded) ? forwarded[0] : null) || req.socket?.remoteAddress || "127.0.0.1";
  const clientIp = typeof ip === "string" ? ip.trim() : "127.0.0.1";

  const ratelimit = getRatelimit();
  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(clientIp);
      if (!success) {
        return res.status(429).json({
          error: "You've reached the demo limit for now — try again in a bit, or sign up to get your own chatbot.",
        });
      }
    } catch (err) {
      console.error("Rate limit check error:", err);
    }
  }

  const { message } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing in this environment');
      return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    });

    const reply = response.text || "Sorry, I could not generate a response.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('hero-chat error:', error);
    return res.status(500).json({ 
      error: "An error occurred while processing your request.", 
      debug: error.message,
      stack: error.stack 
    });
  }
}
