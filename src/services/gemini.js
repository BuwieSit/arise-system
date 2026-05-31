import { GoogleGenAI } from "@google/generative-ai";

// Read the secure environment token safely from Vite's configuration layer
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ SYSTEM WARNING: VITE_GEMINI_API_KEY is missing from your environment setup.");
}

// Initialize the core Google Gen AI client library
const ai = new GoogleGenAI({ apiKey });

export async function generateSystemQuest(userMetrics) {
  // We use gemini-2.5-flash as specified in your blueprint for optimal free-tier usage
  const model = ai.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // Injected system instructions tell Gemini exactly how to behave
    systemInstruction: "You are 'The System' from Solo Leveling. Speak with absolute authority, cold computing efficiency, and subtle mythological grandeur. Never break character.",
  });

  const prompt = `Analyze these user metrics and generate a balanced quest: ${JSON.stringify(userMetrics)}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}