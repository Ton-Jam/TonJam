import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_TRACKS, MOCK_USER } from "../constants";
import { Track, Playlist } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GenerateAIPlaylistResult {
  playlist: Playlist;
  explanation: string;
}

export interface UserContext {
  likedTracks: string[];
  recentlyPlayed: Track[];
  followedArtistIds: string[];
  userDescription?: string;
}

export async function generateAIPlaylist(userContext: UserContext): Promise<GenerateAIPlaylistResult> {
  const { likedTracks, recentlyPlayed, followedArtistIds, userDescription } = userContext;

  const availableTracks = MOCK_TRACKS.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    mood: t.mood
  }));

  const prompt = `
    You are TonJam's "Dj Krupy" AI curator. 
    Your goal is to create a highly personalized 5-track playlist for a user based on their profile, listening history, and available tracks in our library.

    USER CONTEXT:
    - Liked Tracks (IDs): ${likedTracks.join(', ')}
    - Recently Played Tracks (Titles): ${recentlyPlayed.slice(0, 5).map(t => t.title).join(', ')}
    - Followed Artists (IDs): ${followedArtistIds.join(', ')}
    ${userDescription ? `- User's custom vibe request: "${userDescription}"` : ''}

    AVAILABLE TRACKS LIBRARY:
    ${JSON.stringify(availableTracks, null, 2)}

    TASK:
    1. Select EXACTLY 5 tracks from the library that best match this user's profile and request.
    2. Create a cool, evocative title for the playlist.
    3. Write a brief (1-2 sentence) explanation of why this selection was made.
    4. Provide a creative prompt for an AI image generator to create a cover for this playlist.

    OUTPUT FORMAT:
    You must return a JSON object that matches this schema:
    {
      "title": "Evocative Playlist Title",
      "trackIds": ["id1", "id2", "id3", "id4", "id5"],
      "explanation": "Why this matches you...",
      "coverPrompt": "A highly descriptive prompt for an image generator"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            trackIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            explanation: { type: Type.STRING },
            coverPrompt: { type: Type.STRING }
          },
          required: ["title", "trackIds", "explanation", "coverPrompt"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Enrich with actual track objects for immediate use if needed, 
    // but the component will likely just use the trackIds and MOCK_TRACKS.
    
    // Generate an image URL using the coverPrompt
    const coverUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(data.coverPrompt)}?width=600&height=600&nologo=true`;

    const playlist: Playlist = {
      id: `ai-${Date.now()}`,
      title: data.title,
      coverUrl: coverUrl,
      trackCount: data.trackIds.length,
      creator: "TonJam AI",
      description: data.explanation,
      trackIds: data.trackIds
    };

    return {
      playlist,
      explanation: data.explanation
    };
  } catch (error) {
    console.error("AI Playlist generation failed:", error);
    // Fallback to a random selection if AI fails
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
