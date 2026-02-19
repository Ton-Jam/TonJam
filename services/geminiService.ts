import { GoogleGenAI, Type } from "@google/genai";
import { Track, NFTItem, Artist } from "../types";

// Helper to categorize and format Gemini API errors for the UI
const handleAiError = (error: any): string => {
  console.error("Gemini API Error:", error);
  const message = error?.message || String(error);

  if (message.includes("403") || message.includes("permission")) {
    return "Neural Core access denied. Ensure your environment has valid API permissions.";
  }

  if (message.includes("429")) return "Free tier quota reached. Please wait before re-syncing frequencies.";
  if (message.includes("404") || message.includes("not found")) return "Requested AI protocol not available in this region.";
  if (message.includes("500") || message.includes("503")) return "The AI core is temporarily offline. Try again shortly.";
  if (message.includes("SAFETY")) return "The prompt triggered a safety filter. Try a different vibe.";
  
  return "An unexpected glitch occurred in the Neural Sync. Retrying recommended.";
};

export const getAIRecommendations = async (mood: string, existingTracks: Track[]): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are TonJam's AI music curator. 
      The user is feeling: "${mood}". 
      Analyze this mood and select the top 4 matching tracks from this catalog: ${JSON.stringify(existingTracks.map(t => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist })))}.
      Return ONLY a JSON array of track IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const textResult = response.text || "[]";
    const result = JSON.parse(textResult.trim());
    if (!Array.isArray(result)) throw new Error("Invalid format received from AI.");
    return result;
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const semanticSearchTracks = async (query: string, catalog: Track[]): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Neural Sync Engine for TonJam, a high-end Web3 music platform. 
      Query: "${query}"
      Catalog Data: ${JSON.stringify(catalog.map(t => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist })))}
      Return ONLY a JSON array of the top 5 track IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const textResult = response.text || "[]";
    return JSON.parse(textResult.trim());
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const generateNFTLore = async (nft: NFTItem): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, immersive, cyberpunk origin story for this music NFT.
      Title: "${nft.title}"
      Creator: "${nft.creator}"
      Traits: ${JSON.stringify(nft.traits)}
      Return ONLY the story text, 2 sentences max.`,
    });
    return response.text?.trim() || "Historical data for this asset is fragmented.";
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const getArtistSonicDNA = async (artist: Artist, tracks: Track[]): Promise<{ signature: string; vibes: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this artist's identity: ${JSON.stringify(tracks.map(t => ({ title: t.title, genre: t.genre })))}.
      Return as JSON with 'signature' (string) and 'vibes' (array of strings).`,
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
    const textResult = response.text || "{}";
    return JSON.parse(textResult.trim());
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const findRelatedArtists = async (targetArtist: Artist, targetTracks: Track[], catalog: Artist[]): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify 3 artists from the catalog whose "Sonic DNA" matches: ${targetArtist.name}. 
      Catalog: ${JSON.stringify(catalog.filter(a => a.id !== targetArtist.id).map(a => ({ id: a.id, name: a.name })))}.
      Return ONLY a JSON array of artist IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const textResult = response.text || "[]";
    return JSON.parse(textResult.trim());
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const generateAIPlaylist = async (prompt: string, catalog: Track[]): Promise<{ title: string; description: string; trackIds: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `DJ for TonJam. Request: "${prompt}". Catalog: ${JSON.stringify(catalog.map(t => ({ id: t.id, title: t.title, genre: t.genre })))}. 
      Return JSON with 'title', 'description', and 'trackIds'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            trackIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "trackIds"]
        }
      }
    });

    const textResult = response.text || "{}";
    return JSON.parse(textResult.trim());
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};

export const generateJamPost = async (topic: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Web3 social post for TonJam about: "${topic}". Short, hyped, emojis.`,
    });
    return response.text?.trim() || "Signal weak. Could not broadcast.";
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};