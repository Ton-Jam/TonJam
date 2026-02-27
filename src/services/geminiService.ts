import { GoogleGenAI, Type } from "@google/genai";
import { Track, Artist } from "@/types";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will use fallback data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getArtistSonicDNA = async (artist: Artist, tracks: Track[]) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-2.5-flash";
    const prompt = `Analyze the sonic profile of artist "${artist.name}" based on these tracks: ${tracks.map(t => t.title).join(", ")}. 
    The artist's bio is: "${artist.bio}".
    Return a JSON object with:
    - signature: A short poetic description of their sound.
    - vibes: An array of 4-5 descriptive tags (e.g., "Atmospheric", "Cyberpunk").`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signature: { type: Type.STRING },
            vibes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["signature", "vibes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.warn("Using fallback for Sonic DNA due to:", error instanceof Error ? error.message : "Unknown error");
    return {
      signature: "Neural resonance patterns detected. Primary frequencies align with deep electronic textures.",
      vibes: ["Atmospheric", "Neural", "Electronic", "Experimental"]
    };
  }
};

export const semanticSearchTracks = async (query: string, allTracks: Track[]) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-2.5-flash";
    const prompt = `The user is searching for music with the query: "${query}".
    Here is a list of available tracks: ${JSON.stringify(allTracks.map(t => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist })))}.
    Return a JSON array of track IDs that best match the user's intent, ordered by relevance.`;

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
    console.warn("Using fallback for semantic search due to:", error instanceof Error ? error.message : "Unknown error");
    return allTracks.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      t.genre.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export const generateNFTLore = async (title: string, genre: string, baseDescription: string) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-2.5-flash";
    const prompt = `Generate a short, compelling lore or backstory for a music NFT titled "${title}". 
    The genre is ${genre}. 
    Base description: ${baseDescription}
    Make it sound futuristic, cyberpunk, or deeply artistic. Keep it under 3 sentences.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });

    return response.text || baseDescription;
  } catch (error) {
    console.warn("Using fallback for NFT lore due to:", error instanceof Error ? error.message : "Unknown error");
    return baseDescription || "A legendary sonic artifact forged in the depths of the TON blockchain.";
  }
};

export const analyzeRelatedArtists = async (artistName: string, allArtists: Artist[]) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-2.5-flash";
    const prompt = `Given the artist "${artistName}", find 3 similar artists from this list: ${allArtists.map(a => a.name).join(", ")}.
    Return a JSON array of artist names.`;

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

    const matchedNames = JSON.parse(response.text || "[]");
    return allArtists.filter(a => matchedNames.includes(a.name));
  } catch (error) {
    console.warn("Using fallback for related artists due to:", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
};

export const findRelatedArtists = async (artist: Artist, tracks: Track[], allArtists: Artist[]) => {
  return analyzeRelatedArtists(artist.name, allArtists).then(artists => artists.map(a => a.id));
};