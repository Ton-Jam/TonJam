import { Playlist, Track } from "../types";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

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

export async function generateAIPlaylist(
  userContext: UserContext,
  tracksInput?: Track[]
): Promise<GenerateAIPlaylistResult> {
  let sourceTracks: Track[] = tracksInput || [];

  if (sourceTracks.length === 0) {
    try {
      const snap = await getDocs(query(collection(db, "tracks"), limit(60)));
      sourceTracks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "tracks");
    }
  }

  const availableTracks = sourceTracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    mood: t.mood,
  }));

  try {
    const response = await fetch("/api/gemini/generate-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userContext, availableTracks }),
    });

    if (!response.ok) throw new Error("Server returned error for AI playlist generation");

    return await response.json();
  } catch (error) {
    console.error("AI Playlist generation failed:", error);
    const fallbackIds = [...sourceTracks].slice(0, 5).map((t) => t.id);
    return {
      playlist: {
        id: `ai-fallback-${Date.now()}`,
        title: "Quick Picks",
        coverUrl: "/placeholders/playlist-placeholder.webp",
        trackCount: fallbackIds.length,
        creator: "TonJam",
        description:
          fallbackIds.length > 0
            ? "Selection curated from available tracks."
            : "No tracks available in catalog yet.",
        trackIds: fallbackIds,
      },
      explanation:
        fallbackIds.length > 0
          ? "Created from currently available Firestore tracks."
          : "No tracks uploaded yet.",
    };
  }
}
