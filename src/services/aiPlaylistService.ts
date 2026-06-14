import { MOCK_TRACKS } from "../constants";
import { Playlist } from "../types";

export interface GenerateAIPlaylistResult {
  playlist: Playlist;
  explanation: string;
}

export interface UserContext {
  likedTracks: string[];
  recentlyPlayed: any[];
  followedArtistIds: string[];
  userDescription?: string;
}

export async function generateAIPlaylist(userContext: UserContext): Promise<GenerateAIPlaylistResult> {
  const availableTracks = MOCK_TRACKS.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    mood: t.mood
  }));

  try {
    const response = await fetch('/api/gemini/generate-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userContext, availableTracks })
    });

    if (!response.ok) throw new Error('Server returned error for AI playlist generation');
    
    return await response.json();
  } catch (error) {
    console.error("AI Playlist generation failed:", error);
    const fallbackIds = [...MOCK_TRACKS].sort(() => 0.5 - Math.random()).slice(0, 5).map(t => t.id);
    return {
      playlist: {
        id: `ai-fallback-${Date.now()}`,
        title: "AI Quick Picks",
        coverUrl: "https://image.pollinations.ai/prompt/abstract%20digital%20sound%20waves?width=600&height=600&nologo=true",
        trackCount: fallbackIds.length,
        creator: "TonJam AI",
        description: "A quick selection based on your general profile.",
        trackIds: fallbackIds
      },
      explanation: "We hit a snag connecting to our neural core, but here are some tracks you might like!"
    };
  }
}
