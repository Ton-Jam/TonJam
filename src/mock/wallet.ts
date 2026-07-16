import { Transaction } from "../types";

export const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "nft_sale",
    amount: 125,
    platformFee: 3.125, // 2.5%
    artistShare: 121.875,
    recipientAddress: "UQAn_BurnaBoy_AfricanGiant_7777",
    senderAddress: "UQDa_SarahJ_Collector_x9y1_7384",
    userId: "u2",
    nftId: "n1",
    timestamp: "2026-07-12T10:15:00Z",
    status: "completed",
    txHash: "7b47da38290e21a48ff70c79d1a8e8e788eeab1122aef9120790119eabcdf02a"
  },
  {
    id: "tx-2",
    type: "nft_sale",
    amount: 45,
    platformFee: 1.125,
    artistShare: 43.875,
    recipientAddress: "UQA_Tems_Rebel_Vibes_9999",
    senderAddress: "UQDa_SarahJ_Collector_x9y1_7384",
    userId: "u2",
    nftId: "n2",
    timestamp: "2026-07-02T16:45:00Z",
    status: "completed",
    txHash: "46abf025e1a2f990cd7c1912ea4a13e680a912bbcca891efca891002acdf114d"
  },
  {
    id: "tx-3",
    type: "stake",
    amount: 5000,
    platformFee: 0,
    artistShare: 0,
    recipientAddress: "UQCc_Creator_Staking_Pool_Krupy",
    senderAddress: "UQCc_DJ_Krupy_Vibez_x9y1_8888",
    userId: "u1",
    timestamp: "2026-06-15T09:00:00Z",
    status: "completed",
    txHash: "88faefcb44e8812cfa2210a446ae1a78bb11bbffaa900efda99eefcd0012bcda"
  },
  {
    id: "tx-4",
    type: "claim_rewards",
    amount: 45.2,
    platformFee: 0,
    artistShare: 45.2,
    recipientAddress: "UQCc_DJ_Krupy_Vibez_x9y1_8888",
    userId: "u1",
    timestamp: "2026-07-14T08:30:00Z",
    status: "completed",
    txHash: "22091eaefcb418aa22c91ea681bbca8189eefca88177ffdcba8919eacbdf41d2"
  },
  {
    id: "tx-5",
    type: "stream",
    amount: 0.05,
    platformFee: 0.005,
    artistShare: 0.045,
    recipientAddress: "UQCc_DJ_Krupy_Vibez_x9y1_8888",
    senderAddress: "UQDa_SarahJ_Collector_x9y1_7384",
    userId: "u2",
    trackId: "tr-5",
    timestamp: "2026-07-16T11:45:00Z",
    status: "completed"
  }
];

export const mockTokenBalances = {
  TON: 1450.25,
  JAM: 12500,
  stakedJAM: 5000,
  pendingJAMRewards: 45.2
};
