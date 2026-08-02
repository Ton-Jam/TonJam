import { NFTItem } from '@/types';

export type RarityLevel = 'Legendary' | 'Epic' | 'Rare' | 'Common';

export interface NFTRarityMetadata {
  rarity: RarityLevel;
  badgeClass: string;
  glowClass: string;
  iconName: 'Flame' | 'Sparkles' | 'Disc' | 'Music';
  ownershipText: string;
  supplyText: string;
}

/**
 * Calculates or retrieves metadata and rarity level for music NFTs
 * based on traits, edition supply, and ownership distribution.
 */
export function getMusicNftRarity(item: Partial<NFTItem>): NFTRarityMetadata {
  // 1. Check explicit traits or attributes first
  let foundRarity: string | undefined = undefined;

  if (item.traits && item.traits.length > 0) {
    const t = item.traits.find(tr => tr.trait_type?.toLowerCase() === 'rarity');
    if (t) foundRarity = String(t.value);
  }

  if (!foundRarity && item.attributes && item.attributes.length > 0) {
    const a = item.attributes.find(tr => tr.trait_type?.toLowerCase() === 'rarity');
    if (a) foundRarity = String(a.value);
  }

  // 2. Derive rarity level
  let rarity: RarityLevel = 'Common';

  if (foundRarity) {
    const norm = foundRarity.toLowerCase();
    if (norm.includes('legend') || norm.includes('myth') || norm.includes('1 of 1') || norm.includes('unique')) {
      rarity = 'Legendary';
    } else if (norm.includes('epic')) {
      rarity = 'Epic';
    } else if (norm.includes('rare')) {
      rarity = 'Rare';
    } else {
      rarity = 'Common';
    }
  } else {
    // Derive based on supply and ownership edition ratio
    const supply = item.supply ?? 100;
    const edition = item.edition || '';

    if (supply === 1 || edition.includes('1 of 1') || edition.includes('1/1') || (edition.includes('#001 / 250') && (item.minted || 1) <= 1)) {
      rarity = 'Legendary';
    } else if (supply <= 50) {
      rarity = 'Legendary';
    } else if (supply <= 250) {
      rarity = 'Epic';
    } else if (supply <= 1000) {
      rarity = 'Rare';
    } else {
      rarity = 'Common';
    }
  }

  // 3. Format ownership and supply info
  const minted = item.minted || 1;
  const supply = item.supply || (rarity === 'Legendary' ? 25 : rarity === 'Epic' ? 250 : rarity === 'Rare' ? 1000 : 5000);
  const supplyText = `${minted}/${supply} Minted`;

  const owner = item.owner || 'Creator Wallet';
  const ownerShort = owner.length > 12 ? `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}` : owner;
  const ownershipText = `Owner: ${ownerShort}`;

  // 4. Return formatted styling and badges
  switch (rarity) {
    case 'Legendary':
      return {
        rarity: 'Legendary',
        badgeClass: 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20',
        glowClass: 'border-amber-500/40 shadow-amber-500/10',
        iconName: 'Flame',
        ownershipText,
        supplyText
      };
    case 'Epic':
      return {
        rarity: 'Epic',
        badgeClass: 'bg-gradient-to-r from-purple-500/25 via-fuchsia-500/20 to-purple-600/25 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20',
        glowClass: 'border-purple-500/40 shadow-purple-500/10',
        iconName: 'Sparkles',
        ownershipText,
        supplyText
      };
    case 'Rare':
      return {
        rarity: 'Rare',
        badgeClass: 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-600/25 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20',
        glowClass: 'border-cyan-500/40 shadow-cyan-500/10',
        iconName: 'Disc',
        ownershipText,
        supplyText
      };
    case 'Common':
    default:
      return {
        rarity: 'Common',
        badgeClass: 'bg-gradient-to-r from-slate-500/25 via-slate-600/20 to-slate-700/25 text-slate-300 border-slate-500/40',
        glowClass: 'border-slate-500/30',
        iconName: 'Music',
        ownershipText,
        supplyText
      };
  }
}
