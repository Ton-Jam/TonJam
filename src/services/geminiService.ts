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

    const model = "gemini-3.1-pro-preview";
    const prompt = `Analyze the sonic profile of artist "${artist.name}" based on these tracks: ${tracks.map(t => t.title).join(", ")}. 
    The artist's bio is: "${artist.bio}".
    Return a JSON object with:
    - signature: A short poetic description of their sound.
    - vibes: An array of 4-5 descriptive tags (e.g., "Atmospheric", "Cyberpunk").`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
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

    const model = "gemini-3.1-pro-preview";
    const prompt = `The user is searching for music with the query: "${query}".
    Here is a list of available tracks: ${JSON.stringify(allTracks.map(t => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist, mood: t.mood })))}.
    Return a JSON array of track IDs that best match the user's intent, ordered by relevance.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
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

export const globalAISearch = async (
  query: string, 
  context: { tracks: Track[]; artists: Artist[]; nfts: any[] }
) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-3.1-pro-preview";
    const prompt = `The user is using natural language to search for artists, tracks, or NFTs on a music platform.
    Query: "${query}"
    
    Database Context:
    - Tracks: ${JSON.stringify(context.tracks.slice(0, 50).map(t => ({ id: t.id, title: t.title, artist: t.artist, genre: t.genre, mood: t.mood })))}
    - Artists: ${JSON.stringify(context.artists.slice(0, 50).map(a => ({ id: a.uid, name: a.name, genre: a.genre })))}
    - NFTs: ${JSON.stringify(context.nfts.slice(0, 50).map(n => ({ id: n.id, name: n.title, artist: n.artist })))}

    Instructions:
    1. Identify relevant items from the context.
    2. If no exact matches, suggest similar ones or explain why.
    3. Return a JSON object with:
       - results: An array of objects: { type: 'track' | 'artist' | 'nft', id: string, name: string, sub: string (artist name for tracks/nfts, genre for artists), relevance: number (0-1) }
       - suggestion: A short, friendly AI message (e.g., "I found some deep techno vibes for you").
    Limit to top 10 results.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sub: { type: Type.STRING },
                  relevance: { type: Type.NUMBER }
                },
                required: ["type", "id", "name", "sub", "relevance"]
              }
            },
            suggestion: { type: Type.STRING }
          },
          required: ["results", "suggestion"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty AI response");
  } catch (error) {
    console.error("Global AI Search error:", error);
    // Basic fallback filtering
    const results: any[] = [];
    const q = query.toLowerCase();
    
    context.tracks.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)).forEach(t => 
      results.push({ type: 'track', id: t.id, name: t.title, sub: t.artist, relevance: 0.9 })
    );
    context.artists.filter(a => a.name.toLowerCase().includes(q)).forEach(a => 
      results.push({ type: 'artist', id: a.uid, name: a.name, sub: a.genre || '', relevance: 0.8 })
    );
    
    return { results: results.slice(0, 10), suggestion: `Searching for "${query}" across TonJam...` };
  }
};

export const generateNFTLore = async (title: string, genre: string, baseDescription: string) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-3.1-pro-preview";
    const prompt = `Generate a short, compelling lore or backstory for a music NFT titled "${title}". 
    The genre is ${genre}. 
    Base description: ${baseDescription}
    Make it sound futuristic, cyberpunk, or deeply artistic. Keep it under 3 sentences.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
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

    const model = "gemini-3.1-pro-preview";
    const prompt = `Given the artist "${artistName}", find 3 similar artists from this list: ${allArtists.map(a => a.name).join(", ")}.
    Return a JSON array of artist names.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
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

export const getKrupyRecommendations = async (currentTrack: Track, allTracks: Track[], allArtists: Artist[]) => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-3.1-pro-preview";
    const prompt = `Based on the current track "${currentTrack.title}" by ${currentTrack.artist} (Genre: ${currentTrack.genre}), 
    suggest 3 similar tracks and 2 similar artists from this available library:
    - Tracks: ${allTracks.map(t => t.title).join(", ")}
    - Artists: ${allArtists.map(a => a.name).join(", ")}
    
    Return a JSON object with:
    - tracks: array of track titles.
    - artists: array of artist names.
    - reasoning: a short DJ Krupy style explanation (1 sentence).`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tracks: { type: Type.ARRAY, items: { type: Type.STRING } },
            artists: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          },
          required: ["tracks", "artists", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.warn("Krupy recommendations fallback:", error);
    return { tracks: [], artists: [], reasoning: "Neural relay interrupted. Stay tuned for the next frequency." };
  }
};

export interface ChatAssistantResponse {
  text?: string;
  toolCalls?: any[];
}

export const chatWithKrupy = async (
  message: string, 
  history: { role: 'user' | 'ai', text: string }[],
  currentTrack: Track | null
): Promise<ChatAssistantResponse> => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("No API Key");

    const model = "gemini-3.1-pro-preview";
    
    let contextPrompt = "";
    if (currentTrack) {
      contextPrompt = `
      CURRENTLY PLAYING (Neural Data):
      - Title: ${currentTrack.title}
      - Artist: ${currentTrack.artist}
      - Genre: ${currentTrack.genre || 'Unknown'}
      - Mood: ${currentTrack.mood || 'Sonic Flux'}
      `;
    }

    const prompt = `You are DJ Krupy, a futuristic, high-energy AI music assistant on TonJam. 
    Your personality is cyberpunk, enthusiastic about the TON ecosystem, and deeply knowledgeable about music trends.
    ${contextPrompt}
    
    User says: "${message}"`;

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        tools: [{
          functionDeclarations: [
            {
              name: "play_song",
              description: "Plays a song based on a mood or keyword.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  mood_or_keyword: { type: Type.STRING, description: "The mood or keyword (e.g., 'energetic', 'calm', 'cyberpunk')." }
                },
                required: ["mood_or_keyword"]
              }
            },
            {
              name: "get_fun_fact",
              description: "Provides a fun fact about the current track.",
              parameters: { type: Type.OBJECT, properties: {}, required: [] }
            }
          ]
        }]
      }
    }) as any;

    if (response.toolCalls && response.toolCalls.length > 0) {
      return { toolCalls: response.toolCalls };
    }

    return { text: response.text || "Neural connection interrupted. Re-syncing the vibez..." };
  } catch (error) {
    console.error("DJ Krupy Chat error:", error);
    throw error;
  }
};

export const findRelatedArtists = async (artist: Artist, tracks: Track[], allArtists: Artist[]) => {
  return analyzeRelatedArtists(artist.name, allArtists).then(artists => artists.map(a => a.uid));
};