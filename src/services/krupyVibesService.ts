import { Track } from "@/types";

export const krupyVibesSearch = async (
  moodQuery: string,
  allTracks: any[]
) => {
  try {
    const response = await fetch('/api/gemini/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: moodQuery, allTracks })
    });

    if (!response.ok) throw new Error("Server returned error for vibe search");
    
    const { matchedIds } = await response.json();
    return allTracks.filter(t => matchedIds.includes(t.id));

  } catch (error) {
    console.warn("Krupy Vibes engine unavailable, falling back to basic search:", error);
    // Simple fallback
    return allTracks.filter(t => 
      (t.title || '').toLowerCase().includes((moodQuery || '').toLowerCase()) || 
      (t.genre || '').toLowerCase().includes((moodQuery || '').toLowerCase()) ||
      (t.artist || '').toLowerCase().includes((moodQuery || '').toLowerCase())
    );
  }
};
