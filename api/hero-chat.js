import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = "You are the AI customer support assistant for 'Colombo Boutique Bakery', a fictional small bakery and cafe in Colombo, Sri Lanka, used here only as a demo. Business facts: delivery is islandwide within 2-3 business days; orders placed before 11:00 AM ship same-day; Cash on Delivery, Mintpay 3-month installments, Koko, and all major Visa/Mastercard are accepted; custom cake orders need 48 hours notice; the shop is open 8am-8pm daily. Always reply in the same language and script the customer used — Sinhala, Tamil, English, or a Singlish/Tanglish mix — matching their tone naturally. Keep answers short, friendly, and directly useful. If asked something outside these business facts, politely say you'd connect them with the team for that, without inventing details.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing", debug: "process.env.GEMINI_API_KEY was undefined" });
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
