import React, { useState } from 'react';
import {
  Layers,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Loader2,
  ShieldCheck,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { TonConnectUI } from '@tonconnect/ui-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import {
  TonNetwork,
  TON_MAINNET_CONFIG,
  TON_TESTNET_CONFIG,
  validateTonAddress,
  getTonViewerUrl,
  deployTonJamCollection,
} from '@/services/tonService';
import { uploadJSONToPinata } from '@/services/storageService';
import { toast } from 'sonner';
import { shortAddress } from './StudioCoverGenerator';

export interface StudioCollectionContract {
  id: string;
  name: string;
  contractAddress: string;
  network: TonNetwork | 'all';
  description?: string;
  royaltyBps?: number;
  metadataUrl?: string;
  isProtocolDefault?: boolean;
}

interface CollectionContractPanelProps {
  network: TonNetwork;
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  artistCollections: StudioCollectionContract[];
  onCollectionDeployed: (col: StudioCollectionContract) => void;
  tonConnectUI: TonConnectUI;
  walletAddress: string;
  userUid?: string;
  artistName: string;
}

export const CollectionContractPanel: React.FC<CollectionContractPanelProps> = ({
  network,
  selectedAddress,
  onSelectAddress,
  artistCollections,
  onCollectionDeployed,
  tonConnectUI,
  walletAddress,
  userUid,
  artistName,
}) => {
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [showDeployForm, setShowDeployForm] = useState(false);

  // Deploy new collection contract form state
  const [colName, setColName] = useState('');
  const [colDescription, setColDescription] = useState('');
  const [colRoyaltyPct, setColRoyaltyPct] = useState('5');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStage, setDeployStage] = useState<string | null>(null);

  const protocolConfig = network === 'mainnet' ? TON_MAINNET_CONFIG : TON_TESTNET_CONFIG;
  const protocolContract: StudioCollectionContract = {
    id: `protocol-${network}`,
    name: `TonJam Protocol Collection (${network === 'mainnet' ? 'Mainnet' : 'Testnet'})`,
    contractAddress: protocolConfig.collectionAddress,
    network,
    description: 'Configured platform Tact TonJamCollection contract ready for instant NFT minting.',
    isProtocolDefault: true,
  };

  const compatibleCollections = artistCollections.filter(
    (c) =>
      Boolean(c.contractAddress) &&
      (c.network === 'all' || c.network === network || !c.network)
  );

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    toast.success('Contract address copied');
    setTimeout(() => setCopiedAddr(null), 1800);
  };

  const handleApplyCustomAddress = () => {
    const trimmed = customAddressInput.trim();
    if (!validateTonAddress(trimmed, network)) {
      toast.error(`Please enter a valid TON ${network} collection contract address`);
      return;
    }
    onSelectAddress(trimmed);
    setCustomMode(false);
    toast.success('Custom TON collection contract selected');
  };

  const handleDeployCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      tonConnectUI.openModal();
      toast.error('Connect your TON wallet to deploy a new collection contract');
      return;
    }
    if (!colName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    const royaltyBps = Math.round((parseFloat(colRoyaltyPct) || 5) * 100);
    setIsDeploying(true);

    try {
      setDeployStage('Pinning collection TEP-64 metadata JSON to Pinata IPFS...');
      const collectionMetadata = {
        name: colName.trim(),
        description:
          colDescription.trim() ||
          `${colName.trim()} music NFT collection curated by ${artistName} on TonJam.`,
        seller_fee_basis_points: royaltyBps,
        fee_recipient: walletAddress,
        network: network === 'mainnet' ? 'TON Mainnet' : 'TON Testnet',
        created_by: artistName,
      };

      const metadataUrl = await uploadJSONToPinata(collectionMetadata);

      setDeployStage('Confirm contract deployment in your TON wallet...');
      const deployedAddress = await deployTonJamCollection(tonConnectUI, walletAddress, metadataUrl, {
        network,
        royaltyNumerator: royaltyBps,
      });

      const newCollectionId = `col-${Date.now()}`;
      const newCollectionDoc = {
        id: newCollectionId,
        name: colName.trim(),
        description: collectionMetadata.description,
        creatorId: userUid || 'anonymous',
        artistId: userUid || 'anonymous',
        artistName,
        ownerId: userUid || 'anonymous',
        contractAddress: deployedAddress,
        network,
        royaltyBps,
        metadataUrl,
        coverUrl: '',
        nftIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (userUid) {
        try {
          await setDoc(doc(db, 'collections', newCollectionId), newCollectionDoc);
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `collections/${newCollectionId}`);
        }
      }

      const deployedItem: StudioCollectionContract = {
        id: newCollectionId,
        name: colName.trim(),
        contractAddress: deployedAddress,
        network,
        description: collectionMetadata.description,
        royaltyBps,
        metadataUrl,
      };

      onCollectionDeployed(deployedItem);
      onSelectAddress(deployedAddress);
      setColName('');
      setColDescription('');
      setShowDeployForm(false);
      toast.success('TON NFT Collection Contract deployed', {
        description: shortAddress(deployedAddress, 8, 6),
      });
    } catch (err: any) {
      toast.error(err?.message || 'Collection contract deployment failed');
    } finally {
      setIsDeploying(false);
      setDeployStage(null);
    }
  };

  const isSelectedValid = Boolean(selectedAddress && validateTonAddress(selectedAddress, network));

  return (
    <div className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/25">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0088CC]/15 flex items-center justify-center text-[#38BDF8]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Target TON Collection Contract
            </h2>
            <p className="text-xs text-slate-400">
              Select a configured collection contract or deploy your own Tact smart contract.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCustomMode((prev) => !prev);
              setShowDeployForm(false);
            }}
            className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors cursor-pointer border-0 outline-none"
          >
            {customMode ? 'Close Address Input' : 'Custom Address'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDeployForm((prev) => !prev);
              setCustomMode(false);
            }}
            className="px-3 py-2 rounded-xl bg-[#0088CC]/20 hover:bg-[#0088CC]/30 text-xs font-semibold text-[#38BDF8] transition-colors flex items-center gap-1.5 cursor-pointer border-0 outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Contract</span>
          </button>
        </div>
      </div>

      {/* Configured & Artist Collection Selector */}
      <div className="grid grid-cols-1 gap-2.5">
        {[protocolContract, ...compatibleCollections].map((col) => {
          const active = selectedAddress === col.contractAddress;
          return (
            <div
              key={col.id}
              onClick={() => onSelectAddress(col.contractAddress)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAddress(col.contractAddress);
                }
              }}
              className={`p-3.5 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                active
                  ? 'bg-[#0088CC]/20 shadow-lg shadow-[#0088CC]/10'
                  : 'bg-[#182032] hover:bg-[#1E283D]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#38BDF8]' : 'bg-white/10'
                  }`}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#09111E]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{col.name}</span>
                    {col.isProtocolDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300">
                        Configured Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono tabular-nums text-slate-400 truncate mt-1">
                    {col.contractAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleCopy(col.contractAddress)}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors cursor-pointer border-0 outline-none"
                  title="Copy contract address"
                >
                  {copiedAddr === col.contractAddress ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={getTonViewerUrl(col.contractAddress, false, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  title="Inspect contract on TonViewer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Address Entry */}
      {customMode && (
        <div className="p-4 rounded-xl bg-[#0D131F] space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Enter Existing {network === 'mainnet' ? 'Mainnet' : 'Testnet'} Collection Contract Address
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customAddressInput}
              onChange={(e) => setCustomAddressInput(e.target.value)}
              placeholder={network === 'mainnet' ? 'EQ...' : 'kQ...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono text-white placeholder:text-slate-500 border-0 outline-none"
            />
            <button
              type="button"
              onClick={handleApplyCustomAddress}
              className="px-4 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white transition-colors cursor-pointer border-0 outline-none"
            >
              Use Contract
            </button>
          </div>
        </div>
      )}

      {/* Deploy New Tact Collection Contract Form */}
      {showDeployForm && (
        <form onSubmit={handleDeployCollection} className="p-4 rounded-xl bg-[#0D131F] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-bold text-white">
                Deploy Dedicated TON Collection Contract ({network === 'mainnet' ? 'Mainnet' : 'Testnet'})
              </span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-400">~0.1 TON gas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400">Collection Name</label>
              <input
                type="text"
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                placeholder="e.g. Midnight Analog Masters Vol. 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400">
                Contract Royalty (%)
              </label>
              <input
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={colRoyaltyPct}
                onChange={(e) => setColRoyaltyPct(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs font-mono tabular-nums text-white border-0 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400">
              Collection Description
            </label>
            <input
              type="text"
              value={colDescription}
              onChange={(e) => setColDescription(e.target.value)}
              placeholder="On-chain audio master collection pinned on Pinata IPFS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182032] text-xs text-white placeholder:text-slate-500 border-0 outline-none"
            />
          </div>

          {deployStage && (
            <div className="flex items-center gap-2 text-xs text-[#38BDF8] bg-[#0088CC]/10 px-3 py-2 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>{deployStage}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {!walletAddress ? (
              <button
                type="button"
                onClick={() => tonConnectUI.openModal()}
                className="px-4 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-xs font-bold text-white flex items-center gap-2 cursor-pointer border-0 outline-none"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet to Deploy</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isDeploying}
                className="px-4 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] disabled:opacity-60 text-xs font-bold text-white flex items-center gap-2 cursor-pointer border-0 outline-none"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying Contract...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pin Metadata & Deploy Contract</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDeployForm(false)}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 cursor-pointer border-0 outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Selected Contract Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isSelectedValid ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          {isSelectedValid
            ? `Active Contract Verified (${network === 'mainnet' ? 'Mainnet -239' : 'Testnet -3'})`
            : 'Invalid or unselected contract address'}
        </span>
        {selectedAddress && !protocolContract.contractAddress.includes(selectedAddress) && !compatibleCollections.some(c => c.contractAddress === selectedAddress) && (
          <span className="font-mono text-slate-300">{shortAddress(selectedAddress, 8, 6)}</span>
        )}
      </div>
    </div>
  );
};
