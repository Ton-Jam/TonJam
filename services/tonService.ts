import { TonConnectUI } from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

/**
 * TON Blockchain Service (Testnet Protocol)
 * Users MUST switch their wallet (Tonkeeper/MyTonWallet) to Testnet mode to sign these.
 */

export const sendTonPayment = async (tonConnectUI: TonConnectUI, toAddress: string, amount: string, comment: string = "TonJam Transaction") => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 120, // 2 minutes
      messages: [
        {
          address: toAddress,
          amount: toNano(amount).toString(), 
          payload: beginCell()
            .storeUint(0, 32) // opcode for simple comment
            .storeStringTail(comment)
            .endCell()
            .toBoc()
            .toString('base64'),
        },
      ],
    };

    return await tonConnectUI.sendTransaction(transaction);
  } catch (error: any) {
    console.error("TON Payment Error:", error);
    // Re-throw to allow component-level handling
    throw error;
  }
};

export const sendTonTip = async (tonConnectUI: TonConnectUI, toAddress: string, amount: string) => {
  return sendTonPayment(tonConnectUI, toAddress, amount, "TonJam Testnet Tip");
};

export const buyNFT = async (tonConnectUI: TonConnectUI, ownerAddress: string, amount: string, nftTitle: string) => {
  return sendTonPayment(tonConnectUI, ownerAddress, amount, `Purchase: ${nftTitle}`);
};

export const payMintFee = async (tonConnectUI: TonConnectUI, contractAddress: string | null, amount: string = "0.05") => {
  // Use user-provided contract or fallback to a generic treasury address
  const TARGET_ADDRESS = contractAddress || "kQDNv_tD_N0R6K6u5-pXy8M4QnO-vD_N0R6K6u5-pXy8M88"; 
  return sendTonPayment(tonConnectUI, TARGET_ADDRESS, amount, "TonJam Mint Fee");
};