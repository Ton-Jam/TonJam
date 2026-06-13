import { Track, Artist } from "@/types";

export interface ChatAssistantResponse {
  text?: string;
  toolCalls?: any[];
}

export const getArtistSonicDNA = async (artist: Artist, tracks: Track[]) => {
  try {
    const response = await fetch("/api/gemini/sonic-dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist, tracks }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.json();
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
    const response = await fetch("/api/gemini/semantic-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, allTracks }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const data = await response.json();
    const matchedIds = data.matchedIds || [];
    return allTracks.filter(t => matchedIds.includes(t.id));
  } catch (error) {
    console.warn("Using fallback for semantic search due to:", error instanceof Error ? error.message : "Unknown error");
    return allTracks.filter(t => 
      (t.title || '').toLowerCase().includes((query || '').toLowerCase()) || 
      (t.genre || '').toLowerCase().includes((query || '').toLowerCase()) ||
      (t.artist || '').toLowerCase().includes((query || '').toLowerCase())
    );
  }
};

export const globalAISearch = async (
  query: string, 
  context: { tracks: Track[]; artists: Artist[]; nfts: any[] }
) => {
  try {
    const response = await fetch("/api/gemini/global-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, context }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Global AI Search error:", error);
    const results: any[] = [];
    const q = query.toLowerCase();
    
    context.tracks.filter(t => (t.title || '').toLowerCase().includes(q) || (t.artist || '').toLowerCase().includes(q)).forEach(t => 
      results.push({ type: 'track', id: t.id, name: t.title, sub: t.artist, relevance: 0.9 })
    );
    context.artists.filter(a => (a.name || '').toLowerCase().includes(q)).forEach(a => 
      results.push({ type: 'artist', id: a.uid, name: a.name, sub: a.genre || '', relevance: 0.8 })
    );
    
    return { results: results.slice(0, 10), suggestion: `Searching for "${query}" across TonJam...` };
  }
};

export const generateNFTLore = async (title: string, genre: string, baseDescription: string) => {
  try {
    const response = await fetch("/api/gemini/nft-lore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, baseDescription }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const data = await response.json();
    return data.text || baseDescription;
  } catch (error) {
    console.warn("Using fallback for NFT lore due to:", error instanceof Error ? error.message : "Unknown error");
    return baseDescription || "A legendary sonic artifact forged in the depths of the TON blockchain.";
  }
};

export const analyzeRelatedArtists = async (artistName: string, allArtists: Artist[]) => {
  try {
    const response = await fetch("/api/gemini/related-artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistName, allArtists }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const data = await response.json();
    const matchedNames = data.matchedNames || [];
    return allArtists.filter(a => matchedNames.includes(a.name));
  } catch (error) {
    console.warn("Using fallback for related artists due to:", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
};

export const getKrupyRecommendations = async (currentTrack: Track, allTracks: Track[], allArtists: Artist[]) => {
  try {
    const response = await fetch("/api/gemini/krupy-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentTrack, allTracks, allArtists }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.json();
  } catch (error) {
    console.warn("Krupy recommendations fallback:", error);
    return { tracks: [], artists: [], reasoning: "Neural relay interrupted. Stay tuned for the next frequency." };
  }
};

export const chatWithKrupy = async (
  message: string, 
  history: { role: 'user' | 'ai', text: string }[],
  currentTrack: Track | null
): Promise<ChatAssistantResponse> => {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, currentTrack }),
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.json();
  } catch (error) {
    console.warn("DJ Krupy Chat error, using localized telemetry fallback:", error);
    
    const msgLower = message.toLowerCase();
    let text = "Yo! DJ Krupy in the virtual deck! The mainframe is experiencing severe neural solar flares right now, but nothing stops the music! Let's pump up the volume!";
    
    if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
      text = "Yo yo yo, slam-friend! Welcome back to the virtual deck! I'm DJ Krupy, your holographic sonic master. My telemetry systems are currently running in emergency standby, but the energy is at 200%! What tracks are we dropping?";
    } else if (msgLower.includes("play") || msgLower.includes("track") || msgLower.includes("song")) {
      text = "I feel that rhythm! Even though my neural audio router is temporarily re-centering, I suggest hitting play on any track on your current dashboard. Let the sound-waves flow through the TON blockchain!";
    } else if (msgLower.includes("who") || msgLower.includes("you")) {
      text = "I am DJ Krupy—the next-gen, holographic AI beatmaster of TonJam! Forged in the fires of the TON smart contract network, I live to spin global frequencies!";
    } else if (msgLower.includes("vibe") || msgLower.includes("mood")) {
      text = "The current atmospheric readings look incredibly epic! Choose your favorite mood filter from the main dashboard and let's ride the sub-bass frequencies together!";
    } else {
      const genericFalls = [
        "That's absolute gold, buddy! My AI processors are currently refreshing their main index, but DJ Krupy never stops the rhythm! Keep the track list rolling!",
        "Whoa! High-velocity atmospheric data detected! My neural database is updating right now, but I am locked in with you! Spin another track!",
        "That's a major vibe! Feel free to explore our deep web of digital audio collectibles and find your next favorite artifact!"
      ];
      text = genericFalls[Math.floor(Math.random() * genericFalls.length)];
    }
    
    return { text };
  }
};

export const findRelatedArtists = async (artist: Artist, tracks: Track[], allArtists: Artist[]) => {
  return analyzeRelatedArtists(artist.name, allArtists).then(artists => artists.map(a => a.uid));
};
