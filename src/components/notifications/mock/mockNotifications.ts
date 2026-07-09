import { TonJamNotification, NotificationCategory } from '../types';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&fit=crop&q=80',
];

const THUMBNAILS = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&fit=crop&q=80',
];

const USERNAMES = [
  'ton_whale', 'cyber_jam', 'luna_ray', 'beat_lord', 'dust_bunny', 'dmitry_ton', 'nadia_synth',
  'sol_master', 'wave_rider', 'vibe_architect', 'cryptokid', 'sound_shaper', 'apex_dj', 'marvin_g'
];

const TRACK_TITLES = [
  'Solar Pulse', 'Digital Horizon', 'Neon Nights', 'Cyber Cruise', 'Ethereal Flow', 'Vapor Echo',
  'Acoustic Wave', 'Hyper Sonic', 'Bass Overdrive', 'Midnight Drift', 'Liquid Synapse', 'Void Resonance'
];

const NFT_TITLES = [
  'Cosmic Vinyl #001', 'Frequency Artifact #042', 'Audio Genesis Key', 'Sound Sphere Premium',
  'Infinite Groove Gold', 'Sonic Prism Red', 'Subwoofer Elite #102', 'Audio Genesis Key Silver'
];

export const generateMockNotifications = (userId: string): TonJamNotification[] => {
  const list: TonJamNotification[] = [];
  const now = new Date();

  // Helper to generate custom dates
  const getDateNDaysAgo = (days: number, hoursOffset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hoursOffset);
    return d.toISOString();
  };

  const categories: NotificationCategory[] = [
    'music', 'artist_release', 'follower', 'like', 'comment', 'mention',
    'playlist_share', 'track_share', 'nft_sale', 'nft_purchase', 'auction',
    'marketplace', 'wallet_transaction', 'royalty', 'tj_reward', 'mission', 'system'
  ];

  // We want to generate exactly 500 notifications with balanced distribution.
  for (let i = 0; i < 500; i++) {
    const category = categories[i % categories.length];
    
    // Distribute across periods: Today (0-1 days), Yesterday (1-2 days), This Week (2-7 days), Earlier (7-30 days)
    let daysAgo = 0;
    let hoursOffset = i % 24;
    
    if (i < 50) {
      // Today
      daysAgo = 0;
      hoursOffset = Math.floor(Math.random() * 12);
    } else if (i < 120) {
      // Yesterday
      daysAgo = 1;
      hoursOffset = Math.floor(Math.random() * 24);
    } else if (i < 250) {
      // This Week
      daysAgo = 2 + (i % 5);
      hoursOffset = Math.floor(Math.random() * 24);
    } else {
      // Earlier
      daysAgo = 7 + Math.floor((i - 250) / 10);
      hoursOffset = Math.floor(Math.random() * 24);
    }

    const timestamp = getDateNDaysAgo(daysAgo, hoursOffset);
    const read = i >= 8; // Keep the first 8 notifications unread for excellent testing space
    
    const user = USERNAMES[i % USERNAMES.length];
    const avatar = AVATARS[i % AVATARS.length];
    const thumbnail = THUMBNAILS[i % THUMBNAILS.length];
    const track = TRACK_TITLES[i % TRACK_TITLES.length];
    const nft = NFT_TITLES[i % NFT_TITLES.length];

    let title = '';
    let description = '';
    let quickAction: any = undefined;
    let metadata: any = {};

    switch (category) {
      case 'music':
        title = 'VIBE STREAMING ALIGNMENT';
        description = `@${user} is playing your original track "${track}" right now on TonJam!`;
        quickAction = { label: 'Play Along', type: 'play', payload: { trackId: `track-${i}` } };
        metadata = { trackId: `track-${i}` };
        break;

      case 'artist_release':
        title = 'NEW CREATION RELEASED';
        description = `Artist @${user} just uploaded a new digital release: "${track}"! Sync up.`;
        quickAction = { label: 'Listen Now', type: 'play', payload: { trackId: `track-${i}` } };
        metadata = { trackId: `track-${i}`, artistId: `artist-${i}` };
        break;

      case 'follower':
        title = 'NEW SIGNAL ESTABLISHED';
        description = `@${user} is now tracking your telemetry and musical updates!`;
        quickAction = { label: 'Track Back', type: 'follow', payload: { userId: `user-${i}` } };
        metadata = { userId: `user-${i}` };
        break;

      case 'like':
        title = 'RESONANCE COMPATIBILITY';
        description = `@${user} liked your latest digital transmission: "${track}"!`;
        quickAction = { label: 'View Freq', type: 'view', payload: { trackId: `track-${i}` } };
        metadata = { trackId: `track-${i}` };
        break;

      case 'comment':
        title = 'COMMENTS PORTAL SIGNAL';
        description = `@${user} commented: "This synthesizer pattern is absolutely breathtaking!"`;
        quickAction = { label: 'Reply', type: 'reply', payload: { commentId: `comment-${i}` } };
        metadata = { trackId: `track-${i}` };
        break;

      case 'mention':
        title = 'TELEMETRY MENTION SIGNAL';
        description = `@${user} tagged you in a discussion about upcoming NFT auction ${nft}!`;
        quickAction = { label: 'Join Talk', type: 'reply', payload: { mentionId: `mention-${i}` } };
        metadata = { nftId: `nft-${i}` };
        break;

      case 'playlist_share':
        title = 'PLAYLIST SIGNAL DISPATCH';
        description = `@${user} shared their curations "Cyber Synth Lounge" with your inbox.`;
        quickAction = { label: 'Import Playlist', type: 'view', payload: { playlistId: `playlist-${i}` } };
        break;

      case 'track_share':
        title = 'TRACK INCOMING BEAM';
        description = `@${user} broadcasted a private track recommendation: "${track}" to your channel.`;
        quickAction = { label: 'Listen', type: 'play', payload: { trackId: `track-${i}` } };
        metadata = { trackId: `track-${i}` };
        break;

      case 'nft_sale':
        title = 'NFT TRANSACTION COMPLETED';
        description = `Resonance NFT "${nft}" was sold to @${user} for 24.5 TON! Royalties allocated.`;
        quickAction = { label: 'View Ledger', type: 'view', payload: { txHash: `tx-${i}` } };
        metadata = { nftId: `nft-${i}`, txHash: `tx-${i}` };
        break;

      case 'nft_purchase':
        title = 'NFT SECURED IN VAULT';
        description = `Successfully acquired "${nft}" from the marketplace for 18.0 TON!`;
        quickAction = { label: 'Open Vault', type: 'view', payload: { nftId: `nft-${i}` } };
        metadata = { nftId: `nft-${i}` };
        break;

      case 'auction':
        const bidPrice = 12 + (i % 20);
        title = 'CYBER AUCTION BID OUT';
        description = `Alert: Your active auction placement on "${nft}" was outbid. Current top: ${bidPrice} TON.`;
        quickAction = { label: 'Place Counter Bid', type: 'bid', payload: { nftId: `nft-${i}`, currentBid: bidPrice } };
        metadata = { nftId: `nft-${i}`, bidAmount: bidPrice };
        break;

      case 'marketplace':
        title = 'MARKET TREND DEPLOYMENT';
        description = `Exclusive launch: 10 new legendary music NFTs from @${user} are now open for public minting!`;
        quickAction = { label: 'Mint Direct', type: 'mint', payload: { collectionId: `coll-${i}` } };
        break;

      case 'wallet_transaction':
        title = 'TON BLOCKCHAIN DEPOSIT';
        description = `Received +15.50 TON from address EQDx...a9sJ. Wallet balance updated.`;
        quickAction = { label: 'Ledger Details', type: 'view', payload: { txHash: `tx-${i}` } };
        metadata = { txHash: `tx-${i}` };
        break;

      case 'royalty':
        const amount = (2.5 + (i % 5)).toFixed(2);
        title = 'CREATOR ROYALTY RESOLVED';
        description = `Disbursed +${amount} TON from continuous secondary marketplace streams of your catalog!`;
        quickAction = { label: 'Claim Revenue', type: 'claim', payload: { amount: Number(amount) } };
        metadata = { rewardAmount: Number(amount) };
        break;

      case 'tj_reward':
        title = 'PROTOCOL REWARD ALLOCATED';
        description = `Received +500 TJ COINS for maintaining a 7-day streak on JamSpace broadcasting!`;
        quickAction = { label: 'Claim Coins', type: 'claim', payload: { amount: 500 } };
        metadata = { rewardAmount: 500 };
        break;

      case 'mission':
        title = 'DAILY MISSION SIGNAL';
        description = `Unlock premium status! Complete today's mission: Listen to 3 upcoming NFT previews.`;
        quickAction = { label: 'Start Mission', type: 'join', payload: { missionId: `mission-${i}` } };
        break;

      case 'system':
      default:
        title = 'NODE TELEMETRY SYNCHRONIZED';
        description = 'TonJam network upgrade complete: Node v2.1.0-alpha is now fully live with zero-gas NFT transfers.';
        quickAction = { label: 'Read Patch Notes', type: 'view', payload: { version: '2.1.0' } };
        break;
    }

    list.push({
      id: `notice-${i}`,
      userId,
      category,
      title,
      description,
      timestamp,
      read,
      avatarUrl: ['follower', 'like', 'comment', 'mention', 'playlist_share', 'track_share', 'music', 'artist_release'].includes(category) ? avatar : undefined,
      thumbnailUrl: ['nft_sale', 'nft_purchase', 'auction', 'marketplace', 'like', 'music', 'artist_release'].includes(category) ? thumbnail : undefined,
      quickAction,
      metadata
    });
  }

  return list;
};
