import { Collection, NFTItem } from "@/types";

export interface DetailedCollection extends Collection {
  volume: string;
  floorPrice: string;
  ownersCount: number;
  totalSupply: number;
  creatorName: string;
  verified: boolean;
  contractAddress: string;
  royaltyFee: string;
  bannerUrl: string;
  items: NFTItem[];
}

export const PRIMARY_COLLECTIONS: DetailedCollection[] = [
  {
    id: 'genesis-pass',
    artistId: 'dj-krupy',
    name: 'TonJam Genesis Audio Pass',
    description: 'Exclusive founding audio pass granting lifetime access to high-fidelity master stems, VIP staking multipliers, governance voting weight, and private backstage jam rooms on the TON Blockchain.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
    nftIds: ['n1', 'n4', 'n3'],
    createdAt: '2026-01-15T00:00:00Z',
    volume: '42,500',
    floorPrice: '12.0',
    ownersCount: 142,
    totalSupply: 250,
    creatorName: 'DJ Krupy',
    verified: true,
    contractAddress: 'EQBvW_3k7_TonJamGenesisPassMainnet',
    royaltyFee: '5.0%',
    items: [
      {
        id: 'n1',
        trackId: '1',
        title: 'Solar Pulse: Genesis Edition #001',
        owner: 'UQCc_NeonVoyager_x9y1_v8s2_m5n6_z2w3',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '12.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        edition: '#001 of 250',
        supply: 250,
        minted: 1,
        artistVerified: true,
        listingType: 'auction',
        description: 'The first ever unique edition of Solar Pulse with lossless stem rights on TON.',
        traits: [
          { trait_type: 'Rarity', value: 'Mythic' },
          { trait_type: 'BPM', value: 128 },
          { trait_type: 'Access', value: 'VIP Stems' }
        ]
      },
      {
        id: 'n4',
        trackId: '6',
        title: 'Prism Shift: Monolith #001',
        owner: 'UQPrismCore_d5f6_g7h8_x9y1_v8s2',
        creator: 'Prism Core',
        artist: 'Prism Core',
        price: '25.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Prism%20Shift%20Monolith%20Unique%20Digital?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        edition: '#001 of 100',
        supply: 100,
        minted: 1,
        artistVerified: true,
        listingType: 'auction',
        description: 'The genesis unique edition of Prism Shift. A masterpiece of experimental techno.',
        traits: [
          { trait_type: 'Genre', value: 'Techno' },
          { trait_type: 'Energy', value: 'High' }
        ]
      },
      {
        id: 'n3',
        trackId: '5',
        title: 'Neon Nights: Club Pass #007',
        owner: 'UQCc_DJ_Krupy_Vibez_x9y1_8888',
        creator: 'City Ghost',
        artist: 'City Ghost',
        price: '8.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Neon%20Nights%20Club%20Pass%20Rare?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        edition: '#007 of 500',
        supply: 500,
        minted: 7,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Electric energy captured in a digital audio artifact from City Ghost.',
        traits: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Instrument', value: 'Moog Synth' }
        ]
      }
    ]
  },
  {
    id: 'cybernetic-melodies',
    artistId: 'echo-phase',
    name: 'Cybernetic Melodies Vol. 1',
    description: 'A futuristic collection of generative electronic music NFTs created by AI synthesis and live modular jams on the TON Blockchain network.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600',
    nftIds: ['n2', 'n5'],
    createdAt: '2026-02-01T00:00:00Z',
    volume: '18,200',
    floorPrice: '25.0',
    ownersCount: 88,
    totalSupply: 100,
    creatorName: 'Echo Phase',
    verified: true,
    contractAddress: 'EQC9vX_7m8_kQ2_CyberneticMelodiesV1',
    royaltyFee: '7.5%',
    items: [
      {
        id: 'n2',
        trackId: '3',
        title: 'Deep Horizon: Twilight Series #042',
        owner: '0xTon...A12B',
        creator: 'Echo Phase',
        artist: 'Echo Phase',
        price: '45.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Deep%20Horizon%20Twilight%20Legendary?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        edition: '#042 of 100',
        supply: 100,
        minted: 42,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Part of the Deep Horizon limited series. Capturing the essence of digital twilight.',
        traits: [
          { trait_type: 'Bitrate', value: '320kbps' },
          { trait_type: 'Vibe', value: 'Chilled' },
          { trait_type: 'Rarity', value: 'Legendary' }
        ]
      },
      {
        id: 'n5',
        trackId: '12',
        title: 'Midnight Bourbon: Vintage Cask #001',
        owner: 'UQJazzMan_j1a2_z3z4_m5a6_n7n8',
        creator: 'Smooth Operator',
        artist: 'Smooth Operator',
        price: '25.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Midnight%20Bourbon%20Vintage%20Cask%20Jazz?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        edition: '#001 of 50',
        supply: 50,
        minted: 1,
        artistVerified: true,
        listingType: 'fixed',
        description: 'A smooth, vintage jazz NFT. Granting access to live improv sessions.',
        traits: [
          { trait_type: 'Genre', value: 'Jazz' },
          { trait_type: 'Rarity', value: 'Exotic' }
        ]
      }
    ]
  },
  {
    id: 'tiwa-genesis',
    artistId: 'tiwa-savage',
    name: 'Tiwa Savage Queens Series',
    description: 'Exclusive Genesis NFT collection by Tiwa Savage featuring master stem cuts and VIP concert passes on TON.',
    coverUrl: 'https://image.pollinations.ai/prompt/music%20nft%20tiwa%20savage%20gold%20african%20queen%20crown%20mythic?width=600&height=600&nologo=true',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
    nftIds: ['nft-tiwa-1', 'nft-tiwa-2'],
    createdAt: '2026-03-10T00:00:00Z',
    volume: '31,400',
    floorPrice: '8.0',
    ownersCount: 75,
    totalSupply: 75,
    creatorName: 'Tiwa Savage',
    verified: true,
    contractAddress: 'EQTiwa_Queens_Series_TON_Mainnet',
    royaltyFee: '6.0%',
    items: [
      {
        id: 'nft-tiwa-1',
        trackId: 'track-tiwa-1',
        title: "Somebody's Son: Queen Genesis #001",
        owner: 'UQTiwaSavage_x8y2_9999',
        creator: 'Tiwa Savage',
        artist: 'Tiwa Savage',
        price: '15.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20tiwa%20savage%20gold%20african%20queen%20crown%20mythic?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        edition: '#001 of 25',
        supply: 25,
        minted: 1,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Exclusive Genesis NFT release by Tiwa Savage with VIP backstage pass.',
        traits: [
          { trait_type: 'Bitrate', value: 'FLAC' },
          { trait_type: 'Genre', value: 'Afrobeats' },
          { trait_type: 'Rarity', value: 'Mythic' }
        ]
      },
      {
        id: 'nft-tiwa-2',
        trackId: 'track-tiwa-2',
        title: 'Koroba: Rhythm Monolith #012',
        owner: 'UQTiwaSavage_x8y2_9999',
        creator: 'Tiwa Savage',
        artist: 'Tiwa Savage',
        price: '8.0',
        imageUrl: 'https://image.pollinations.ai/prompt/music%20nft%20koroba%20tiwa%20savage%20neon%20african%20patterns?width=600&height=600&nologo=true',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        edition: '#012 of 50',
        supply: 50,
        minted: 12,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Exclusive music collectible for Koroba on TonJam.',
        traits: [
          { trait_type: 'Bitrate', value: '320kbps' },
          { trait_type: 'Genre', value: 'Afrobeats' },
          { trait_type: 'Rarity', value: 'Rare' }
        ]
      }
    ]
  },
  {
    id: 'col-1',
    artistId: 'burna-boy',
    name: 'African Giant Series',
    description: 'The primary high-fidelity on-chain collectibles line for Burna Boy chart topping anthems with perpetual creator royalty distribution.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600',
    nftIds: ['n1'],
    createdAt: '2026-07-10T12:00:00Z',
    volume: '34,100',
    floorPrice: '20.0',
    ownersCount: 210,
    totalSupply: 300,
    creatorName: 'Burna Boy',
    verified: true,
    contractAddress: 'EQBurna_AfricanGiantOfficialTON',
    royaltyFee: '6.0%',
    items: [
      {
        id: 'n1',
        trackId: '1',
        title: 'Solar Pulse: Genesis Edition #001',
        owner: 'UQAfrican_Giant...',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '20.0',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        edition: '#001 of 300',
        supply: 300,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Original lossless audio master with exclusive streaming stems.'
      }
    ]
  },
  {
    id: 'col-2',
    artistId: 'tems',
    name: 'Rebel Soul Editions',
    description: 'Exclusive vocal and lyric NFT cuts highlighting Tems incredible soul and afrobeats performance catalog on the TON Blockchain.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600',
    nftIds: ['n2'],
    createdAt: '2026-07-01T08:00:00Z',
    volume: '28,900',
    floorPrice: '18.0',
    ownersCount: 165,
    totalSupply: 200,
    creatorName: 'Tems',
    verified: true,
    contractAddress: 'EQTems_RebelSoulEditionsTON',
    royaltyFee: '5.5%',
    items: [
      {
        id: 'n2',
        trackId: '3',
        title: 'Deep Horizon: Twilight Series #042',
        owner: 'UQTems_Holder...',
        creator: 'Echo Phase',
        artist: 'Echo Phase',
        price: '18.0',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        edition: '#001 of 200',
        supply: 200,
        artistVerified: true,
        listingType: 'fixed',
        description: 'Acoustic studio live session master.'
      }
    ]
  },
  {
    id: 'col-3',
    artistId: 'dj-krupy',
    name: 'Solar Pulse LP Series',
    description: 'The official cyber-visual digital music asset releases by independent legend DJ Krupy on TON.',
    coverUrl: 'https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
    nftIds: ['n4'],
    createdAt: '2023-10-01T00:00:00Z',
    volume: '15,600',
    floorPrice: '14.0',
    ownersCount: 95,
    totalSupply: 150,
    creatorName: 'DJ Krupy',
    verified: true,
    contractAddress: 'EQSolarPulse_DJKrupyOfficialTON',
    royaltyFee: '5.0%',
    items: [
      {
        id: 'n4',
        trackId: '6',
        title: 'Prism Shift: Monolith #001',
        owner: 'krusherkrupy@gmail.com',
        creator: 'Prism Core',
        artist: 'Prism Core',
        price: '14.0',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        edition: '#001 of 150',
        supply: 150,
        artistVerified: true,
        listingType: 'auction',
        description: 'Atmospheric sonic landscape with live analog modular synths.'
      }
    ]
  }
];
