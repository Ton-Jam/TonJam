import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { Track, NFTItem, RoyaltySplitExtended } from '@/types';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { mintTonJamNFT, getEstimatedGasFee, simulateTransaction } from '@/services/tonService';
import { compressImageForNFT } from '@/lib/utils';

export interface MintNFTParams {
  track?: Track | null;
  title: string;
  genre: string;
  description: string;
  coverFile: File | null;
  audioFile: File | null;
  coverUrl: string;
  audioUrl: string;
  price: string;
  editions: string;
  lyrics?: string;
  royaltySplits: RoyaltySplitExtended[];
  hasExclusive?: boolean;
  exclusiveTitle?: string;
  exclusiveType?: 'video' | 'track' | 'image' | 'document';
  exclusiveUrl?: string;
  exclusiveDescription?: string;
  listingType?: 'fixed' | 'auction';
  startingBid?: string;
  auctionDuration?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates NFT metadata & params before initiating IPFS pinning & TON transaction
 */
export function validateNFTMetadata(params: MintNFTParams): ValidationResult {
  const errors: string[] = [];

  if (!params.title || !params.title.trim()) {
    errors.push("Track title is required");
  }

  if (!params.coverUrl && !params.coverFile) {
    errors.push("Cover artwork is required");
  }

  if (!params.audioUrl && !params.audioFile) {
    errors.push("Audio master file is required");
  }

  const priceNum = parseFloat(params.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    errors.push("Price must be greater than 0 TON");
  }

  const editionsNum = parseInt(params.editions, 10);
  if (isNaN(editionsNum) || editionsNum < 1) {
    errors.push("Editions supply must be at least 1");
  }

  // Royalty splits check (percentages must total 100%)
  if (params.royaltySplits && params.royaltySplits.length > 0) {
    const totalPercentage = params.royaltySplits.reduce(
      (sum, s) => sum + (Number(s.percentage) || 0),
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Collaborator royalty splits must total 100% (currently ${totalPercentage}%)`);
    }

    for (let i = 0; i < params.royaltySplits.length; i++) {
      if (!params.royaltySplits[i].address.trim()) {
        errors.push(`Collaborator ${i + 1} requires a valid wallet address`);
      }
    }
  } else {
    errors.push("At least one royalty recipient is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper with exponential backoff retries for IPFS uploading
 */
async function uploadWithRetry<T>(
  uploadFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await uploadFn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Upload failed after max retries");
}

/**
 * Custom Hook that orchestrates the track minting process, 
 * integrating TON Blockchain interactions, IPFS asset hosting, and local/global state.
 */
export function useTrackMinting() {
  const [tonConnectUI] = useTonConnectUI();
  const { updateMintingStatus, addNFT, setIsMinting } = useNFT();
  const { userProfile, addUserTrack, addUserNFT, addNotification } = useAudio();

  /**
   * Mints a track as a TEP-64 compliant NFT on the TON Blockchain
   */
  const mintTrackAsNFT = async (params: MintNFTParams): Promise<NFTItem | null> => {
    const trackId = params.track?.id || `track-temp-${Date.now()}`;
    
    // 1. Verify Wallet Connection
    const walletAddress = tonConnectUI.wallet?.account.address || userProfile?.walletAddress;
    if (!walletAddress) {
      addNotification("Please connect your TON wallet first", "warning");
      tonConnectUI.openModal();
      return null;
    }

    // 2. Validate Parameters
    const validation = validateNFTMetadata(params);
    if (!validation.isValid) {
      const errorMsg = validation.errors.join("; ");
      addNotification(`Validation failed: ${errorMsg}`, "error");
      return null;
    }

    setIsMinting(true);
    
    try {
      // Step A: Upload audio & image assets to IPFS via Pinata with retries
      updateMintingStatus(trackId, {
        step: 'uploading',
        progress: 10,
        message: 'Broadcasting media assets to IPFS network...',
      });

      let finalAudioUrl = params.audioUrl || '';
      let finalCoverUrl = params.coverUrl || '';

      if (params.audioFile) {
        updateMintingStatus(trackId, {
          progress: 25,
          message: 'Transmitting audio waves to Pinata IPFS gateway...',
        });
        finalAudioUrl = await uploadWithRetry(() => uploadToPinata(params.audioFile!));
      }

      if (params.coverFile) {
        updateMintingStatus(trackId, {
          progress: 35,
          message: 'Optimizing & compressing artwork canvas for Web3 mobile performance...',
        });
        const compressedCover = await compressImageForNFT(params.coverFile);

        updateMintingStatus(trackId, {
          progress: 45,
          message: 'Pinning cover art image to Pinata IPFS gateway...',
        });
        finalCoverUrl = await uploadWithRetry(() => uploadToPinata(compressedCover));
      }

      // Step B: Create and upload TEP-64 compliant JSON metadata to IPFS
      updateMintingStatus(trackId, {
        step: 'metadata',
        progress: 60,
        message: 'Formatting and compiling TEP-64 compliant NFT metadata...',
      });

      const royaltySplitsDecimals = params.royaltySplits.map(s => ({
        address: s.address,
        percentage: (Number(s.percentage) || 0) / 100, // Format royalty as decimals (e.g. 0.05 for 5%)
        label: s.label || 'Collaborator'
      }));

      const metadata = {
        name: params.title,
        description: params.description || `${params.title} by ${userProfile.name || 'Artist'} on TonJam`,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: [
          { trait_type: "Artist", value: userProfile.name || 'Artist' },
          { trait_type: "Genre", value: params.genre },
          { trait_type: "RoyaltySplits", value: JSON.stringify(royaltySplitsDecimals) },
          { trait_type: "Editions", value: params.editions },
          ...(params.lyrics ? [{ trait_type: "Lyrics", value: params.lyrics }] : []),
          ...(params.hasExclusive ? [
            { trait_type: "ExclusiveTitle", value: params.exclusiveTitle || 'Exclusive Pack' },
            { trait_type: "ExclusiveType", value: params.exclusiveType || 'document' },
            { trait_type: "ExclusiveUrl", value: params.exclusiveUrl || '' },
            { trait_type: "ExclusiveDescription", value: params.exclusiveDescription || '' }
          ] : [])
        ]
      };

      const ipfsMetadataUrl = await uploadWithRetry(() => uploadJSONToPinata(metadata));

      // Step C: Simulation & Gas Check
      updateMintingStatus(trackId, {
        step: 'blockchain',
        progress: 75,
        message: 'Awaiting wallet signature to mint on TON Blockchain...',
      });

      try {
        const gasFee = await getEstimatedGasFee();
        const sim = await simulateTransaction({ address: walletAddress, metadataUrl: ipfsMetadataUrl });
        console.log(`Estimated gas fee on TON: ${gasFee.toFixed(4)} TON. Simulation result:`, sim.message);
      } catch (err) {
        console.warn("Pre-flight gas estimation skipped:", err);
      }

      // Call TON smart contract to mint the item
      const txResult = await mintTonJamNFT(tonConnectUI, walletAddress, ipfsMetadataUrl);
      if (!txResult) {
        throw new Error("Transaction cancelled or rejected by user wallet.");
      }

      // Step D: Register the newly minted track/NFT in database & local state
      updateMintingStatus(trackId, {
        step: 'registering',
        progress: 90,
        message: 'Synchronizing local database & marketplace registries...',
      });

      const finalTrackId = params.track?.id || `track-nft-${Date.now()}`;
      const finalPrice = params.listingType === 'auction' ? params.startingBid || '1.0' : params.price;

      const updatedTrack: Track = {
        ...(params.track || {}),
        id: finalTrackId,
        songId: `song-${finalTrackId}`,
        title: params.title,
        artist: userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        duration: params.track?.duration || 180,
        genre: params.genre,
        isNFT: true,
        artistVerified: true,
        price: finalPrice,
        editions: params.editions,
        royaltySplits: royaltySplitsDecimals,
        minted: (params.track?.minted || 0) + 1,
        metadataUrl: ipfsMetadataUrl,
        updatedAt: new Date().toISOString(),
        lyrics: params.lyrics,
        isExclusive: params.hasExclusive,
        listingType: params.listingType,
        auctionDuration: params.listingType === 'auction' ? params.auctionDuration : undefined
      } as Track;

      await addUserTrack(updatedTrack);

      const getAuctionEndTime = (daysStr?: string) => {
        const days = parseInt(daysStr || '3', 10) || 3;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        return targetDate.toISOString();
      };

      const newNFT: NFTItem = {
        id: `nft-${Date.now()}`,
        trackId: finalTrackId,
        title: params.title,
        owner: walletAddress,
        creator: userProfile.name || 'Unknown Artist',
        artist: userProfile.name || 'Unknown Artist',
        artistId: userProfile.uid,
        price: finalPrice,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `1 of ${params.editions}`,
        supply: parseInt(params.editions, 10),
        minted: 1,
        royaltySplits: royaltySplitsDecimals,
        description: params.description,
        listingType: params.listingType,
        isAuction: params.listingType === 'auction',
        startingBid: params.listingType === 'auction' ? params.startingBid : undefined,
        auctionStartTime: params.listingType === 'auction' ? new Date().toISOString() : undefined,
        auctionEndTime: params.listingType === 'auction' ? getAuctionEndTime(params.auctionDuration) : undefined,
        exclusiveContent: params.hasExclusive ? [{
          id: `ex-${Date.now()}`,
          title: params.exclusiveTitle || '',
          type: params.exclusiveType || 'document',
          url: params.exclusiveUrl || '',
          description: params.exclusiveDescription || ''
        }] : [],
        ipfsUrl: ipfsMetadataUrl,
        history: [{
          event: 'Minted',
          from: '0x0000000000000000000000000000000000000000',
          to: userProfile.name || 'Unknown',
          date: new Date().toISOString(),
          price: finalPrice
        }]
      };

      await addUserNFT(newNFT);
      addNFT(newNFT);

      // Step E: Completed!
      updateMintingStatus(trackId, {
        step: 'completed',
        progress: 100,
        message: 'Successfully minted as TonJam NFT on TON Blockchain!',
      });

      addNotification(`"${params.title}" successfully minted as an NFT!`, "success");
      setIsMinting(false);
      return newNFT;

    } catch (error: any) {
      console.error("NFT Minting failed:", error);
      updateMintingStatus(trackId, {
        step: 'error',
        message: error.message || 'NFT Minting failed. Check wallet or IPFS gateway connection.',
        error: error.message || String(error)
      });
      addNotification(error.message || "Minting failed. Blockchain or IPFS sync error.", "error");
      setIsMinting(false);
      return null;
    }
  };

  return {
    mintTrackAsNFT,
    validateNFTMetadata
  };
}
