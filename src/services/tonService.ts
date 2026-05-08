import { TonConnectUI } from '@tonconnect/ui-react';
import { TonClient, Address, TupleItemSlice, beginCell, toNano, Cell, contractAddress } from '@ton/ton';
import { TonJamCollection, storeStateInit as storeCollectionInit } from '../contracts/nft/TonJamNFT_TonJamCollection';
import { TonJamMarketplace, storeStateInit as storeMarketplaceInit } from '../contracts/marketplace/TonJamMarketplace_TonJamMarketplace';

const TONCENTER_API_KEY = ''; // Optional: Add your API key here
const TON_ENDPOINT = 'https://testnet.toncenter.com/api/v2/jsonRPC';

// Contract Addresses (Placeholders - would be replaced after deployment)
export const TONJAM_COLLECTION_ADDRESS = localStorage.getItem('tonjam_collection_address') || "EQCA14o1-VWhS2asq9V5xYI--9664654_--_--_--_--_--_--";
export const TONJAM_MARKETPLACE_ADDRESS = localStorage.getItem('tonjam_marketplace_address') || "EQCNZ_MARKETPLACE_ADDRESS_PLACEHOLDER_123456789";

/**
 * Fetches Jetton balance for a given wallet address
 */
export const getJettonBalance = async (
  walletAddress: string,
  jettonMasterAddress: string
): Promise<number> => {
  try {
    if (!walletAddress || !jettonMasterAddress) return 0;

    const client = new TonClient({
      endpoint: TON_ENDPOINT,
      apiKey: TONCENTER_API_KEY,
    });

    const userAddress = Address.parse(walletAddress);
    const masterAddress = Address.parse(jettonMasterAddress);

    // 1. Get Jetton Wallet address for this user
    try {
      const response = await client.runMethod(masterAddress, 'get_wallet_address', [
        { type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() } as any,
      ]);
      
      const jettonWalletAddress = response.stack.readAddress();
      const walletData = await client.runMethod(jettonWalletAddress, 'get_wallet_data');
      const balance = walletData.stack.readBigNumber();
      return Number(balance) / 10**9; 
    } catch (e) {
      console.warn("Error fetching Jetton balance from contract, using mock:", e);
      // Fallback to mock for the prototype
      return Number((Math.random() * 1000).toFixed(2));
    }
  } catch (error) {
    console.warn("Error fetching Jetton balance, using mock:", error);
    return Number((Math.random() * 1000).toFixed(2));
  }
};

/**
 * Checks if a wallet address owns at least one NFT from a specific collection
 */
export const checkNFTOwnership = async (
  walletAddress: string,
  collectionAddress: string
): Promise<boolean> => {
  try {
    if (!walletAddress || !collectionAddress) return false;

    // In a real app, we'd use an indexer like TonAPI or TonCenter to list NFTs for a wallet
    // and check if any belong to the collectionAddress.
    
    // For the prototype, we'll simulate this.
    // In a real implementation:
    /*
    const response = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts?collection=${collectionAddress}`);
    const data = await response.json();
    return data.nft_items.length > 0;
    */

    // Simulate check: For demo purposes, assume they own it if connected
    return true; 
  } catch (error) {
    console.warn("Error checking NFT ownership:", error);
    return false;
  }
};

/**
 * Lists an NFT on the TonJam Marketplace
 */
export const listNFTOnMarketplace = async (
  tonConnectUI: TonConnectUI,
  nftAddress: string,
  price: string
): Promise<boolean> => {
  try {
    const priceInNanotons = toNano(price);
    
    // In custodial pattern, we transfer the NFT to the marketplace
    // and provide the price in the forward_payload.
    // message Transfer { query_id: uint64; new_owner: Address; response_destination: Address; custom_payload: Cell; forward_amount: coins; forward_payload: Slice; }
    const forwardPayload = beginCell().storeCoins(priceInNanotons).endCell();
    
    const body = beginCell()
      .storeUint(0x5fcc3d14, 32) // Opcode for Transfer
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(TONJAM_MARKETPLACE_ADDRESS))
      .storeAddress(Address.parse(TONJAM_MARKETPLACE_ADDRESS)) // response_destination
      .storeBit(false) // custom_payload (null)
      .storeCoins(toNano('0.05')) // forward_amount (to trigger OwnershipAssigned)
      .storeBit(true) // forward_payload (ref)
      .storeRef(forwardPayload)
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: nftAddress, // Send to NFT contract
          amount: toNano('0.1').toString(),
          payload: body.toBoc().toString('base64'),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("NFT Listing Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error listing NFT:", error);
    throw error;
  }
};

/**
 * Buys an NFT from the TonJam Marketplace
 */
export const buyNFTFromMarketplace = async (
  tonConnectUI: TonConnectUI,
  nftAddress: string,
  price: string
): Promise<boolean> => {
  try {
    const priceInNanotons = toNano(price);
    
    // Construct the BuyNFT message body
    // message BuyNFT { query_id: Int as uint64; nft_address: Address; }
    const body = beginCell()
      .storeUint(112407828, 32) // Opcode for BuyNFT (0x06b32314)
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(nftAddress))
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: TONJAM_MARKETPLACE_ADDRESS,
          amount: (priceInNanotons + toNano("0.1")).toString(), // Price + Gas
          payload: body.toBoc().toString('base64'),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("NFT Purchase Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error buying NFT:", error);
    throw error;
  }
};

/**
 * Cancels an NFT sale on the TonJam Marketplace
 */
export const cancelNFTListing = async (
  tonConnectUI: TonConnectUI,
  nftAddress: string
): Promise<boolean> => {
  try {
    // Construct the CancelSale message body
    // message CancelSale { query_id: Int as uint64; nft_address: Address; }
    const body = beginCell()
      .storeUint(1393330205, 32) // Opcode for CancelSale (0x530c881d)
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(nftAddress))
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: TONJAM_MARKETPLACE_ADDRESS,
          amount: toNano("0.05").toString(), // Minimal gas fee
          payload: body.toBoc().toString('base64'),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("NFT Cancel Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error cancelling NFT listing:", error);
    throw error;
  }
};

/**
 * Mints a new TonJam NFT
 */
export const mintTonJamNFT = async (
  tonConnectUI: TonConnectUI,
  receiverAddress: string,
  metadataUrl: string
): Promise<boolean> => {
  try {
    // Construct the Mint message body
    // message Mint { query_id: Int as uint64; receiver: Address; content: Cell; }
    const content = beginCell().storeStringTail(metadataUrl).endCell();
    
    const body = beginCell()
      .storeUint(1048761405, 32) // Opcode for Mint (0x3e7f45bd)
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(receiverAddress))
      .storeRef(content)
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: TONJAM_COLLECTION_ADDRESS,
          amount: toNano("0.1").toString(), // Gas for minting
          payload: body.toBoc().toString('base64'),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("NFT Minting Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error minting TonJam NFT:", error);
    throw error;
  }
};

/**
 * Simulates buying an NFT on the TON blockchain (Legacy/Mock)
 */
export const buyNFT = async (
  tonConnectUI: TonConnectUI,
  ownerAddress: string,
  price: string,
  title: string,
  royaltySplits: { address: string, percentage: number }[] = []
): Promise<boolean> => {
  try {
    const priceInNanotons = parseFloat(price) * 1000000000;
    const messages = [];

    // 1. Calculate and add royalty messages
    let totalRoyalty = 0;
    for (const split of royaltySplits) {
      const royaltyAmount = Math.floor(priceInNanotons * split.percentage);
      totalRoyalty += royaltyAmount;
      messages.push({
        address: split.address,
        amount: royaltyAmount.toString(),
      });
    }

    // 2. Add owner message (price - total royalty)
    messages.push({
      address: ownerAddress,
      amount: (priceInNanotons - totalRoyalty).toString(),
    });

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: messages,
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("NFT Purchase Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    throw error;
  }
};

/**
 * Simulates minting an NFT on the TON blockchain
 */
export const mintNFT = async (
  tonConnectUI: TonConnectUI,
  metadata: any
): Promise<boolean> => {
  try {
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`Successfully minted NFT:`, metadata);
    return true;
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
};

/**
 * Simulates placing a bid on an NFT auction
 */
export const placeBid = async (
  tonConnectUI: TonConnectUI,
  contractAddress: string,
  amount: string
): Promise<boolean> => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: contractAddress || "EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888", // Replace with actual auction contract
          amount: (parseFloat(amount) * 1000000000).toString(),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("Bid Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
};

/**
 * Simulates accepting a bid on an NFT auction
 */
export const acceptBid = async (
  tonConnectUI: TonConnectUI,
  contractAddress: string
): Promise<boolean> => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: contractAddress || "EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888", // Replace with actual auction contract
          amount: "10000000", // Minimal gas fee for accepting
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("Accept Bid Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error accepting bid:", error);
    throw error;
  }
};
export const depositTON = async (
  tonConnectUI: TonConnectUI,
  amount: string
): Promise<boolean> => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds
      messages: [
        {
          address: "EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888", // Replace with real platform wallet
          amount: (Number(amount) * 1e9).toString(), // Convert TON to nanoTON
          payload: "te6cckEBAQEAAgAAAEQ=", // Optional payload (e.g., 'Deposit')
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("Deposit Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error depositing TON:", error);
    throw error;
  }
};

export const purchaseJAM = async (
  tonConnectUI: TonConnectUI,
  amount: string,
  jamAmount: string
): Promise<boolean> => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds
      messages: [
        {
          address: "EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888", // Replace with real platform wallet
          amount: (parseFloat(amount) * 1000000000).toString(), // Convert to nanotons
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("JAM Purchase Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error purchasing JAM:", error);
    throw error;
  }
};

/**
 * Deploys the TonJam NFT Collection contract
 */
export const deployTonJamCollection = async (
  tonConnectUI: TonConnectUI,
  ownerAddress: string,
  metadataUrl: string = "https://tonjam.app/collection.json"
): Promise<string> => {
  try {
    const owner = Address.parse(ownerAddress);
    const content = beginCell().storeStringTail(metadataUrl).endCell();
    const royaltyParams = {
      $$type: 'RoyaltyParams' as const,
      numerator: 250n,
      denominator: 10000n,
      destination: owner,
    };

    const collection = await TonJamCollection.init(owner, content, royaltyParams);
    const stateInit = { ...collection, $$type: 'StateInit' as const };
    const address = contractAddress(0, stateInit).toString();

    // TonConnect transaction format for StateInit
    const deployTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: address,
          amount: toNano("0.1").toString(),
          stateInit: beginCell()
            .store(storeCollectionInit(stateInit))
            .endCell()
            .toBoc()
            .toString('base64'),
        },
      ],
    };

    await tonConnectUI.sendTransaction(deployTransaction);
    
    // Store in localStorage for persistence in this session
    localStorage.setItem('tonjam_collection_address', address);
    console.log("NFT Collection Deployed to:", address);
    return address;
  } catch (error) {
    console.error("Error deploying TonJam Collection:", error);
    throw error;
  }
};

/**
 * Deploys the TonJam Marketplace contract
 */
export const deployTonJamMarketplace = async (
  tonConnectUI: TonConnectUI,
  ownerAddress: string,
  feeDestinationAddress: string
): Promise<string> => {
  try {
    const owner = Address.parse(ownerAddress);
    const feeDestination = Address.parse(feeDestinationAddress);
    const feePercentage = 250n; // 2.5%

    const marketplace = await TonJamMarketplace.init(owner, feeDestination, feePercentage);
    const stateInit = { ...marketplace, $$type: 'StateInit' as const };
    const address = contractAddress(0, stateInit).toString();

    const deployTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: address,
          amount: toNano("0.1").toString(),
          stateInit: beginCell()
            .store(storeMarketplaceInit(stateInit))
            .endCell()
            .toBoc()
            .toString('base64'),
        },
      ],
    };

    await tonConnectUI.sendTransaction(deployTransaction);
    
    // Store in localStorage for persistence in this session
    localStorage.setItem('tonjam_marketplace_address', address);
    console.log("Marketplace Deployed to:", address);
    return address;
  } catch (error) {
    console.error("Error deploying TonJam Marketplace:", error);
    throw error;
  }
};

/**
 * Sends a transaction to subscribe to Premium
 */
export const subscribePremium = async (
  tonConnectUI: TonConnectUI,
  amount: string
): Promise<boolean> => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: "EQAA_PLATFORM_WALLET_ADDRESS_8888888888888888",
          amount: (parseFloat(amount) * 1000000000).toString(),
        },
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log("Premium Subscription Transaction sent:", result);
    return true;
  } catch (error) {
    console.error("Error subscribing to Premium:", error);
    throw error;
  }
};
