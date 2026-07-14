import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNFT, MintingStatus } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { Track, NFTItem, RoyaltySplitExtended } from '@/types';
import { uploadToPinata, uploadJSONToPinata } from '@/services/storageService';
import { mintTonJamNFT, getEstimatedGasFee, simulateTransaction } from '@/services/tonService';
import { toNano } from '@ton/ton';

export interface MintNFTParams {
  track: Track;
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

/**
 * Custom Hook that orchestrates the track minting process, 
 * integrating TON Blockchain interactions, IPFS asset hosting, and local/global state.
 * Fully utilizes the `NFTProvider` state.
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
    const walletAddress = tonConnectUI.wallet?.account.address;
    if (!walletAddress) {
      addNotification("Please connect your TON wallet first", "warning");
      tonConnectUI.openModal();
      return null;
    }

    setIsMinting(true);
    
    try {
      // Step A: Upload audio & image assets to IPFS via Pinata
      updateMintingStatus(trackId, {
        step: 'uploading',
        progress: 10,
        message: 'Broadcasting media assets to IPFS network...',
      });

      let finalAudioUrl = params.audioUrl || '';
      let finalCoverUrl = params.coverUrl || '';

      if (params.audioFile) {
        updateMintingStatus(trackId, {
          progress: 20,
          message: 'Transmitting audio waves to IPFS gateway...',
        });
        finalAudioUrl = await uploadToPinata(params.audioFile);
      }

      if (params.coverFile) {
        updateMintingStatus(trackId, {
          progress: 40,
          message: 'Pinning cover art to IPFS gateway...',
        });
        finalCoverUrl = await uploadToPinata(params.coverFile);
      }

      // Step B: Create and upload TEP-64 compliant JSON metadata to IPFS
      updateMintingStatus(trackId, {
        step: 'metadata',
        progress: 55,
        message: 'Formatting and compiling NFT metadata...',
      });

      const royaltySplitsDecimals = params.royaltySplits.map(s => ({
        address: s.address,
        percentage: s.percentage / 100, // Format royalty as decimals
        label: s.label || 'Collaborator'
      }));

      const metadata = {
        name: params.title,
        description: params.description,
        image: finalCoverUrl,
        animation_url: finalAudioUrl,
        attributes: [
          { trait_type: "Genre", value: params.genre },
          { trait_type: "RoyaltySplits", value: JSON.stringify(royaltySplitsDecimals) },
          { trait_type: "Editions", value: params.editions },
          ...(params.lyrics ? [{ trait_type: "Lyrics", value: params.lyrics }] : []),
          ...(params.hasExclusive ? [
            { trait_type: "ExclusiveTitle", value: params.exclusiveTitle || '' },
            { trait_type: "ExclusiveType", value: params.exclusiveType || 'document' },
            { trait_type: "ExclusiveUrl", value: params.exclusiveUrl || '' },
            { trait_type: "ExclusiveDescription", value: params.exclusiveDescription || '' }
          ] : [])
        ]
      };

      const ipfsMetadataUrl = await uploadJSONToPinata(metadata);

      // Step C: Trigger TON Smart Contract Interaction
      updateMintingStatus(trackId, {
        step: 'blockchain',
        progress: 75,
        message: 'Awaiting signature to mint on TON Blockchain...',
      });

      // Optional: Simulate and estimate Gas for the user's transparency
      try {
        const gasFee = await getEstimatedGasFee();
        console.log(`Estimated gas fee for minting on TON: ${gasFee.toFixed(4)} TON`);
      } catch (err) {
        console.warn("Gas estimation skipped", err);
      }

      // Call TON smart contract to mint the item in the collection
      await mintTonJamNFT(tonConnectUI, walletAddress, ipfsMetadataUrl);

      // Step D: Register the newly minted track/NFT in our database and local state
      updateMintingStatus(trackId, {
        step: 'registering',
        progress: 90,
        message: 'Synchronizing local database registries...',
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
        const days = parseInt(daysStr || '3') || 3;
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
        artist: userProfile.name,
        artistId: userProfile.uid,
        price: finalPrice,
        imageUrl: finalCoverUrl,
        coverUrl: finalCoverUrl,
        audioUrl: finalAudioUrl,
        edition: `${(params.track?.minted || 0) + 1} of ${params.editions}`,
        supply: parseInt(params.editions),
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
          from: 'NullAddress',
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
        message: 'NFT Minting failed. Check wallet or IPFS gateway connection.',
        error: error.message || String(error)
      });
      addNotification("Minting failed. Blockchain or IPFS sync error.", "error");
      setIsMinting(false);
      return null;
    }
  };

  return {
    mintTrackAsNFT
  };
}
