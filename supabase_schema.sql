
-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT UNIQUE,
  earnings_total DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks Table
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER, -- seconds
  genre TEXT,
  is_nft BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT Mints Table
CREATE TABLE nft_mints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id),
  owner_id UUID REFERENCES profiles(id),
  mint_price DECIMAL,
  edition_number INTEGER,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  image_url TEXT,
  track_id UUID REFERENCES tracks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists Table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes (Polymorphic-ish via separate tables or single table)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  target_id UUID NOT NULL, -- UUID of track, post, or nft
  target_type TEXT NOT NULL, -- 'track', 'post', 'nft'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  PRIMARY KEY (follower_id, following_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
