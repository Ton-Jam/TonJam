export interface MockTrack {
  id: string;
  title: string;
  artist: string;
  coverArtUrl: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  album?: string;
  genre?: string;
}

export const MOCK_TESTING_TRACKS: MockTrack[] = [];
