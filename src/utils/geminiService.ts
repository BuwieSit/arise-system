import { GoogleGenerativeAI } from "@google/generative-ai";
import type { UserProfile, UserStats, Quest } from "../types";

export interface AIResponse {
  directive: string;
  sideQuest?: Partial<Quest>;
}

const LOCAL_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Communicates with the Vercel Serverless Function proxy in production,
 * or falls back to direct API calls in local development if a key is present.
 */
export const generateSystemDirective = async (
  profile: UserProfile,
  stats: UserStats,
  recentQuests: Quest[]
): Promise<AIResponse> => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Fallback to direct call for local development ONLY if the Vercel API is not reachable
  // or if the user is running via 'npm run dev' instead of 'vercel dev'.
  if (isLocal && LOCAL_API_KEY) {
    console.log("System: Local development detected. Using direct AI channel.");
    return generateDirectly(profile, stats, recentQuests);
  }

  try {
    const response = await fetch('/api/generate-quest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile, stats, recentQuests }),
    });

    if (!response.ok) {
      // If we get a 404 locally, it means the user isn't using 'vercel dev'
      if (response.status === 404 && isLocal && LOCAL_API_KEY) {
        console.warn("System: Vercel API not found locally. Falling back to direct channel.");
        return generateDirectly(profile, stats, recentQuests);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("System: AI Proxy failed", error);
    
    // Final fallback for local dev if the fetch itself fails (e.g. connection refused)
    if (isLocal && LOCAL_API_KEY) {
        return generateDirectly(profile, stats, recentQuests);
    }

    return {
      directive: "The System's eyes are upon you. Continue your training."
    };
  }
};

/**
 * Direct call to Google Generative AI (Local Dev Fallback)
 */
async function generateDirectly(profile: UserProfile, stats: UserStats, recentQuests: Quest[]): Promise<AIResponse> {
  try {
    const genAI = new GoogleGenerativeAI(LOCAL_API_KEY);
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1' }
    );

    const context = {
      level: profile.level,
      rank: profile.rank,
      title: profile.title,
      stats: stats,
      recent_activity: recentQuests.slice(0, 3).map(q => ({
        title: q.title,
        completed: !!q.completedAt
      }))
    };

    const prompt = `
      SYSTEM INSTRUCTION: You are 'The System' from Solo Leveling. Speak with absolute authority, cold computing efficiency, and subtle mythological grandeur. Never break character. Do not use conversational introductory filler.
      
      Analyze user telemetry: ${JSON.stringify(context)}
      
      Provide a brief 'System Directive' (max 2 sentences) in your signature cold style.
      Occasionally, suggest a specific 'Side Quest' if the user seems to be progressing well or lacking in a specific stat.
      
      Format your response as valid JSON:
      {
        "directive": "string",
        "sideQuest": { "title": "string", "task": "string", "target": number, "unit": "string", "rewardXp": number } | null
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("System: Direct AI fallback failed", e);
    return {
      directive: "The System connection is flickering. Focus on your current objectives."
    };
  }
}
