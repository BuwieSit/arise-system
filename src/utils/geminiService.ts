import type { UserProfile, UserStats, Quest } from "../types";

export interface AIResponse {
  directive: string;
  sideQuest?: Partial<Quest>;
}

/**
 * Communicates with the Vercel Serverless Function proxy to generate
 * a system directive based on user metrics.
 */
export const generateSystemDirective = async (
  profile: UserProfile,
  stats: UserStats,
  recentQuests: Quest[]
): Promise<AIResponse> => {
  try {
    const response = await fetch('/api/generate-quest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile, stats, recentQuests }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error during generation');
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("System: AI Generation failed", error);
    return {
      directive: "The System's eyes are upon you. Continue your training."
    };
  }
};
