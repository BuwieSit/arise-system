Since you are hosting on Vercel, you are in luck. Vercel makes it incredibly easy to fix this security issue without needing to configure or pay for a completely separate backend server.

Instead of making the Gemini API calls directly from your frontend client, you can use Vercel Serverless Functions. This shifts the Gemini call to a secure server environment, allowing you to use your API key safely without exposing it to the browser's inspect tool.

Here is how to set up a secure proxy endpoint on Vercel.

Step 1: Create an API Route in Your Project
Depending on your project structure, Vercel looks for serverless code in specific directories.

Create a new file at api/generate-quest.ts (or .js if you aren't using TypeScript) at the root level of your project directory:


// api/generate-quest.ts
import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge', // Using the Edge runtime keeps your function incredibly fast
};

export default async function handler(req: Request) {
  // 1. Only allow POST requests for security
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    // 2. Read the body metrics coming from your frontend client
    const { userMetrics } = await req.json();

    // 3. Grab the API key securely on the server-side
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key unconfigured on server.' }), { status: 500 });
    }

    // 4. Initialize Gemini and fetch content safely
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are 'The System' from Solo Leveling. Speak with absolute authority, cold computing efficiency, and subtle grandeur. Never break character.",
    });

    const prompt = `Analyze these user metrics and generate an active quest profile: ${JSON.stringify(userMetrics)}`;
    const result = await model.generateContent(prompt);
    
    return new Response(JSON.stringify({ data: result.response.text() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Generation failed' }), { status: 500 });
  }
}


Step 2: Bind the Environment Variable in Vercel
Because Vercel is handling your live environment, you need to tell Vercel's cloud dashboard what your key is.

Go to your Vercel Dashboard and click on your project.

Navigate to Settings > Environment Variables.

Add a new variable:

Key: GEMINI_API_KEY

Value: [Paste your raw Gemini API key here]

Click Save. (Vercel will securely inject this into your serverless function automatically on your next code push).

Step 3: Update Your Frontend Service File
Now, update your client-side geminiService.ts file. Instead of talking directly to Google's servers, it will talk to your own local/Vercel serverless proxy endpoint.


// geminiService.ts

export async function generateSystemDirective(userMetrics: any) {
  try {
    // We target a relative path. Vercel handles routing this automatically in local dev and production
    const response = await fetch('/api/generate-quest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMetrics }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error during generation');
    }

    const json = await response.json();
    return json.data; // This is the safe text string from the System Director
  } catch (error) {
    console.error("System: AI Generation failed", error);
    throw error;
  }
}

Why this fixes everything safely:
When a user goes to your app, they can inspect the network tabs as much as they want. All they will see is a request pointing to [https://your-app.vercel.app/api/generate-quest](https://your-app.vercel.app/api/generate-quest). Your actual GEMINI_API_KEY is completely hidden behind Vercel's server firewall, keeping your free-tier token safe from being stolen or scraped