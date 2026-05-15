import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "@/types";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Vibe search will fallback.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const krupyVibesSearch = async (
  moodQuery: string,
  allTracks: Track[]
) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-3.1-pro-preview";
    const prompt = `You are a DJ Krupy's "Neural Vibe Engine".
    The user is looking for music using this mood/vibe query: "${moodQuery}".
    Here is the list of available tracks: ${JSON.stringify(allTracks.map(t => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist })))}.
    
    Instructions:
    1. Analyze the query for mood, style, tempo, or atmospheric implications.
    2. Select the top 10 tracks from the list that best match these vibes based on title, genre, or implied musical characteristics.
    3. Return a JSON array of the track IDs, ordered by best match.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const matchedIds = JSON.parse(response.text || "[]");
    return allTracks.filter(t => matchedIds.includes(t.id));

  } catch (error) {
    console.warn("Krupy Vibes engine unavailable, falling back to basic search:", error);
    // Simple fallback
    return allTracks.filter(t => 
      t.title.toLowerCase().includes(moodQuery.toLowerCase()) || 
      t.genre.toLowerCase().includes(moodQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(moodQuery.toLowerCase())
    );
  }
};
