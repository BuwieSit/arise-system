import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { profile, stats, recentQuests } = await req.json();

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key unconfigured on server.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1' }
    );

    const context = {
      level: profile.level,
      rank: profile.rank,
      title: profile.title,
      stats: stats,
      recent_activity: recentQuests.slice(0, 3).map((q: any) => ({
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
    
    // Clean JSON if Gemini adds markdown blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return new Response(JSON.stringify({ data: JSON.parse(cleanJson) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Serverless: AI Generation failed", error);
    return new Response(JSON.stringify({ error: error.message || 'Generation failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
