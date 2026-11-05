export interface DiscoverCategory {
  id: string;
  title: string;
  query: string;
  gradient: string;
  imgUrl: string;
}

export const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  { 
    id: 'cat-1', 
    title: 'Pop & Chart Hits', 
    query: 'Pop', 
    gradient: 'bg-gradient-to-br from-fuchsia-600 to-pink-800', 
    imgUrl: 'https://i.postimg.cc/G4RgtKBm/placeholder.jpg' 
  },
  { 
    id: 'cat-2', 
    title: 'Top Charts', 
    query: 'Top', 
    gradient: 'bg-gradient-to-br from-yellow-600 to-amber-900', 
    imgUrl: 'https://i.postimg.cc/5Hxr7g1D/placeholder.jpg' 
  },
  { 
    id: 'cat-3', 
    title: 'Live Spaces', 
    query: 'Live', 
    gradient: 'bg-gradient-to-br from-orange-600 to-red-900', 
    imgUrl: 'https://i.postimg.cc/rDTZsjdK/placeholder.jpg' 
  },
  { 
    id: 'cat-4', 
    title: 'Music NFTs', 
    query: 'NFT', 
    gradient: 'bg-gradient-to-br from-purple-600 to-indigo-950', 
    imgUrl: 'https://i.postimg.cc/8jMnT9Cr/placeholder.jpg' 
  },
  { 
    id: 'cat-5', 
    title: 'New Drops', 
    query: 'New', 
    gradient: 'bg-gradient-to-br from-cyan-600 to-blue-900', 
    imgUrl: 'https://i.postimg.cc/PPw0PNSX/placeholder.jpg' 
  },
  { 
    id: 'cat-6', 
    title: 'Chill & LoFi', 
    query: 'Ambient', 
    gradient: 'bg-gradient-to-br from-teal-600 to-emerald-900', 
    imgUrl: 'https://i.postimg.cc/SJCtm3K2/placeholder.jpg' 
  },
  { 
    id: 'cat-7', 
    title: 'Rock & Metal', 
    query: 'Rock', 
    gradient: 'bg-gradient-to-br from-red-700 to-slate-900', 
    imgUrl: 'https://i.postimg.cc/21Y9yGqW/placeholder.jpg' 
  },
  { 
    id: 'cat-8', 
    title: 'Hip-Hop', 
    query: 'Hip Hop', 
    gradient: 'bg-gradient-to-br from-rose-600 to-pink-900', 
    imgUrl: 'https://i.postimg.cc/dhFN3670/placeholder.jpg' 
  },
  { 
    id: 'cat-9', 
    title: 'Electronic & House', 
    query: 'Electronic', 
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-900', 
    imgUrl: 'https://i.postimg.cc/QFDYCmBB/placeholder.jpg' 
  },
  { 
    id: 'cat-10', 
    title: 'Afrobeats', 
    query: 'Afro-TON', 
    gradient: 'bg-gradient-to-br from-amber-500 to-rose-800', 
    imgUrl: 'https://i.postimg.cc/K1bpjfKk/placeholder.jpg' 
  },
  { 
    id: 'cat-11', 
    title: 'Synthwave & Cyber', 
    query: 'Synthwave', 
    gradient: 'bg-gradient-to-br from-purple-600 to-indigo-900', 
    imgUrl: 'https://i.postimg.cc/0zvXjn6J/placeholder.jpg' 
  },
  { 
    id: 'cat-12', 
    title: 'Phonk & Drift', 
    query: 'Phonk', 
    gradient: 'bg-gradient-to-br from-emerald-600 to-teal-900', 
    imgUrl: 'https://i.postimg.cc/tsbvJk1x/placeholder.jpg' 
  },
  { 
    id: 'cat-13', 
    title: 'Drill & Grime', 
    query: 'Drill', 
    gradient: 'bg-gradient-to-br from-zinc-700 to-slate-900', 
    imgUrl: 'https://i.postimg.cc/fJ7yYWbp/placeholder.jpg' 
  },
  { 
    id: 'cat-14', 
    title: 'Country Music', 
    query: 'Country', 
    gradient: 'bg-gradient-to-br from-amber-700 to-stone-900', 
    imgUrl: 'https://i.postimg.cc/nMBhtVqJ/placeholder.jpg' 
  },
  { 
    id: 'cat-15', 
    title: 'Instrumentals', 
    query: 'Instrumental', 
    gradient: 'bg-gradient-to-br from-cyan-700 to-blue-950', 
    imgUrl: 'https://i.postimg.cc/gw1mf1Jt/placeholder.jpg' 
  },
  { 
    id: 'cat-16', 
    title: 'Trap Music', 
    query: 'Trap', 
    gradient: 'bg-gradient-to-br from-orange-700 to-stone-900', 
    imgUrl: 'https://i.postimg.cc/18tS4yVY/placeholder.jpg' 
  },
  { 
    id: 'cat-17', 
    title: 'Soul Music', 
    query: 'Soul', 
    gradient: 'bg-gradient-to-br from-rose-700 to-amber-950', 
    imgUrl: 'https://i.postimg.cc/0Md5DckD/placeholder.jpg' 
  },
  { 
    id: 'cat-18', 
    title: 'Reggaeton', 
    query: 'Reggaeton', 
    gradient: 'bg-gradient-to-br from-yellow-500 to-red-900', 
    imgUrl: 'https://i.postimg.cc/ZWBTVTYz/placeholder.jpg' 
  },
  { 
    id: 'cat-19', 
    title: 'Jazz Music', 
    query: 'Jazz', 
    gradient: 'bg-gradient-to-br from-amber-600 to-yellow-950', 
    imgUrl: 'https://i.postimg.cc/Czt0ZWG3/placeholder.jpg' 
  },
  { 
    id: 'cat-20', 
    title: 'Reggae Music', 
    query: 'Reggae', 
    gradient: 'bg-gradient-to-br from-emerald-700 to-yellow-900', 
    imgUrl: 'https://i.postimg.cc/tZ2Q9fRz/placeholder.jpg' 
  },
  { 
    id: 'cat-21', 
    title: 'Amapiano', 
    query: 'Amapiano', 
    gradient: 'bg-gradient-to-br from-amber-600 to-orange-950', 
    imgUrl: 'https://i.postimg.cc/2bjM9wdn/placeholder.jpg' 
  },
  { 
    id: 'cat-22', 
    title: 'Gospel Music', 
    query: 'Gospel', 
    gradient: 'bg-gradient-to-br from-sky-600 to-indigo-950', 
    imgUrl: 'https://i.postimg.cc/Th4FQnKy/placeholder.jpg' 
  },
  { 
    id: 'cat-23', 
    title: 'Islamic Music', 
    query: 'Islamic', 
    gradient: 'bg-gradient-to-br from-emerald-600 to-cyan-950', 
    imgUrl: 'https://i.postimg.cc/MMrPP8p2/placeholder.jpg' 
  }
];
