import React, { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Database,
  Sparkles,
  Rocket,
  Music,
  UploadCloud,
  FileJson,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { PinnedAssetRecord, formatAudioTime, shortAddress } from './StudioCoverGenerator';
import { TonNetwork, TonTxConfirmationUpdate, getTonViewerUrl } from '@/services/tonService';
import { NFTItem } from '@/types';
import { toast } from 'sonner';

export interface PipelineStage {
  id: 'audio_pin' | 'cover_pin' | 'metadata_pin' | 'ton_tx' | 'db_sync';
  label: string;
  status: 'idle' | 'active' | 'done' | 'error';
  detail?: string;
  progress?: number;
}

export type PillarStatus = 'idle' | 'active' | 'done' | 'submitted' | 'error';

export interface RealTimeMintTelemetry {
  ipfsUploadStatus: PillarStatus;
  ipfsUploadProgress: number;
  ipfsUploadLabel: string;
  metadataPinStatus: PillarStatus;
  metadataPinProgress: number;
  metadataPinLabel: string;
  tonConfirmStatus: PillarStatus;
  tonConfirmProgress: number;
  tonConfirmLabel: string;
  liveStatusMessage: string;
  elapsedSeconds: number;
  confirmationUpdate: TonTxConfirmationUpdate | null;
}

interface PinataMintPipelineProps {
  stages: PipelineStage[];
  progress: number;
  telemetry: RealTimeMintTelemetry;
  isExecuting: boolean;
  errorMessage: string | null;
  pinataConfigured: boolean | null;
  pinnedAudio: PinnedAssetRecord | null;
  pinnedCover: PinnedAssetRecord | null;
  pinnedMetadata: PinnedAssetRecord | null;
  mintTxHash: string;
  mintedNFT: NFTItem | null;
  targetContractAddress: string;
  network: TonNetwork;
  walletAddress: string;
  canMint: boolean;
  onExecuteMint: () => void;
  onPublishTrackOnly: () => void;
  onConnectWallet: () => void;
  onViewNFT: (nftId: string) => void;
  onResetForm: () => void;
}

const getPillarSurfaceClass = (status: PillarStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-[#0088CC]/20 text-white';
    case 'done':
      return 'bg-emerald-500/15 text-emerald-200';
    case 'submitted':
      return 'bg-sky-500/15 text-sky-200';
    case 'error':
      return 'bg-rose-500/15 text-rose-200';
    default:
      return 'bg-[#182032] text-slate-300';
  }
};

const getPillarBarClass = (status: PillarStatus): string => {
  switch (status) {
    case 'done':
      return 'bg-emerald-400';
    case 'submitted':
      return 'bg-sky-400';
    case 'error':
      return 'bg-rose-400';
    case 'active':
      return 'bg-[#38BDF8]';
    default:
      return 'bg-slate-600/40';
  }
};

export const PinataMintPipeline: React.FC<PinataMintPipelineProps> = ({
  stages,
  progress,
  telemetry,
  isExecuting,
  errorMessage,
  pinataConfigured,
  pinnedAudio,
  pinnedCover,
  pinnedMetadata,
  mintTxHash,
  mintedNFT,
  targetContractAddress,
  network,
  walletAddress,
  canMint,
  onExecuteMint,
  onPublishTrackOnly,
  onConnectWallet,
  onViewNFT,
  onResetForm,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const pillars = [
    {
      key: 'ipfs',
      title: 'IPFS Uploading',
      icon: UploadCloud,
      status: telemetry.ipfsUploadStatus,
      pct: telemetry.ipfsUploadProgress,
      label: telemetry.ipfsUploadLabel,
    },
    {
      key: 'metadata',
      title: 'Metadata Pinning',
      icon: FileJson,
      status: telemetry.metadataPinStatus,
      pct: telemetry.metadataPinProgress,
      label: telemetry.metadataPinLabel,
    },
    {
      key: 'ton',
      title: 'TON Confirmation',
      icon: ShieldCheck,
      status: telemetry.tonConfirmStatus,
      pct: telemetry.tonConfirmProgress,
      label: telemetry.tonConfirmLabel,
    },
  ];

  const hasBroadcastedTx = Boolean(mintTxHash);
  const clampedOverall = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/25"
      aria-live="polite"
      data-testid="mint-progress-tracker"
    >
      {/* Pipeline Header + Elapsed Timer & Overall Percentage */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Pinata IPFS & TON Minting Progress
          </h2>
          <p className="text-xs text-slate-400 truncate">
            {telemetry.liveStatusMessage}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {(isExecuting || telemetry.elapsedSeconds > 0) && (
            <span className="text-[11px] font-mono tabular-nums text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatAudioTime(telemetry.elapsedSeconds)}</span>
            </span>
          )}
          <span
            className="text-sm font-mono font-bold tabular-nums text-[#38BDF8]"
            data-testid="overall-progress-pct"
          >
            {clampedOverall}%
          </span>
        </div>
      </div>

      {/* Overall Compositor-Animated Progress Track */}
      <div className="w-full h-2 rounded-full bg-[#1C2538] overflow-hidden">
        <div
          className="w-full h-full rounded-full bg-gradient-to-r from-[#0088CC] to-[#38BDF8] origin-left transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${clampedOverall / 100})` }}
        />
      </div>

      {/* Real-Time 3-Pillar Status Strip: IPFS Uploading / Metadata Pinning / TON Confirmation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const clampedPct = Math.min(100, Math.max(0, pillar.pct));
          return (
            <div
              key={pillar.key}
              data-testid={`pillar-${pillar.key}`}
              className={`p-3 rounded-xl space-y-2 transition-colors duration-200 ${getPillarSurfaceClass(
                pillar.status
              )}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {pillar.status === 'active' ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#38BDF8] animate-spin shrink-0" />
                  ) : pillar.status === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : pillar.status === 'error' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold truncate">{pillar.title}</span>
                </div>
                <span className="text-[11px] font-mono font-semibold tabular-nums shrink-0 opacity-90">
                  {clampedPct}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`w-full h-full rounded-full origin-left transition-transform duration-200 ease-out ${getPillarBarClass(
                    pillar.status
                  )}`}
                  style={{ transform: `scaleX(${clampedPct / 100})` }}
                />
              </div>

              <p className="text-[11px] opacity-85 truncate" title={pillar.label}>
                {pillar.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live TON Blockchain Broadcast Banner (Visible Immediately During Confirmation Polling) */}
      {hasBroadcastedTx && !mintedNFT && (
        <div
          className="p-3.5 rounded-xl bg-[#0088CC]/15 space-y-2"
          data-testid="ton-live-confirmation-banner"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 font-semibold text-white">
              <Loader2 className="w-3.5 h-3.5 text-[#38BDF8] animate-spin shrink-0" />
              <span>
                {telemetry.confirmationUpdate?.phase === 'confirmed'
                  ? 'TON Block Confirmed'
                  : telemetry.confirmationUpdate
                  ? `Verifying on ${network === 'mainnet' ? 'TON Mainnet' : 'TON Testnet'} (${telemetry.confirmationUpdate.attempt}/${telemetry.confirmationUpdate.maxAttempts})`
                  : 'Transaction broadcast to TON network...'}
              </span>
            </span>
            <a
              href={getTonViewerUrl(mintTxHash, true, network)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono tabular-nums text-[11px] text-[#38BDF8] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{shortAddress(mintTxHash, 6, 4)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Detailed 5-Stage Execution Steps */}
      <div className="space-y-2">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
              stage.status === 'active'
                ? 'bg-[#0088CC]/15'
                : stage.status === 'done'
                ? 'bg-emerald-500/10'
                : stage.status === 'error'
                ? 'bg-rose-500/10'
                : 'bg-[#182032]/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {stage.status === 'done' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {stage.status === 'active' && (
                  <Loader2 className="w-4 h-4 text-[#38BDF8] animate-spin" />
                )}
                {stage.status === 'error' && (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                {stage.status === 'idle' && (
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    0{idx + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold truncate ${
                    stage.status === 'idle' ? 'text-slate-400' : 'text-white'
                  }`}
                >
                  {stage.label}
                </p>
                {stage.detail && (
                  <p className="text-[11px] text-slate-400 truncate">{stage.detail}</p>
                )}
              </div>
            </div>

            {typeof stage.progress === 'number' && stage.status === 'active' && (
              <span className="text-[11px] font-mono font-bold tabular-nums text-[#38BDF8] shrink-0">
                {stage.progress}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Pinned IPFS Receipts */}
      {(pinnedAudio || pinnedCover || pinnedMetadata) && (
        <div className="p-3.5 rounded-xl bg-[#0D131F] space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Pinned Pinata IPFS Assets</span>
          </div>

          {[
            { key: 'audio', label: 'Audio Master', asset: pinnedAudio },
            { key: 'cover', label: 'Cover Artwork', asset: pinnedCover },
            { key: 'meta', label: 'TEP-64 JSON', asset: pinnedMetadata },
          ].map(
            ({ key, label, asset }) =>
              asset && (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 text-xs py-1"
                >
                  <span className="text-slate-400 shrink-0">{label}</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono tabular-nums text-emerald-300 truncate max-w-[140px]">
                      {shortAddress(asset.cid, 8, 6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(key, asset.ipfsUri)}
                      className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 cursor-pointer border-0 outline-none"
                      title="Copy ipfs:// URI"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={asset.gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.12] text-slate-300"
                      title="Open on Pinata Gateway"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {/* Actionable Error Feedback */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-300">Pipeline Halted</p>
            <p className="text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Pinata Unconfigured Guidance */}
      {pinataConfigured === false && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Pinata credentials (`PINATA_JWT` or `PINATA_API_KEY` + `PINATA_API_SECRET`) are not
            detected on the server environment. Configure them to enable IPFS uploads.
          </p>
        </div>
      )}

      {/* Mint Success Receipt */}
      {mintedNFT && mintTxHash && (
        <div className="p-4 rounded-xl bg-emerald-500/15 space-y-3" data-testid="mint-success-receipt">
          <div className="flex items-center justify-between gap-2 text-emerald-300 text-xs font-bold">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {telemetry.confirmationUpdate?.phase === 'confirmed'
                  ? `Confirmed on ${network === 'mainnet' ? 'TON Mainnet' : 'TON Testnet'}`
                  : `Broadcast to ${network === 'mainnet' ? 'TON Mainnet' : 'TON Testnet'}`}
              </span>
            </span>
            {telemetry.elapsedSeconds > 0 && (
              <span className="font-mono tabular-nums text-[11px] text-emerald-200/80">
                {formatAudioTime(telemetry.elapsedSeconds)}
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Transaction Hash</span>
              <a
                href={getTonViewerUrl(mintTxHash, true, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>{shortAddress(mintTxHash, 8, 6)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Collection Contract</span>
              <a
                href={getTonViewerUrl(targetContractAddress, false, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-slate-200 hover:underline flex items-center gap-1"
              >
                <span>{shortAddress(targetContractAddress, 6, 4)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">Chain Confirmation</span>
              <span className="font-mono text-emerald-300">
                {telemetry.confirmationUpdate?.phase === 'confirmed'
                  ? `Verified (Poll #${telemetry.confirmationUpdate.attempt})`
                  : 'Submitted (Indexing on TON)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onViewNFT(mintedNFT.id)}
              className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#051B11] text-xs font-bold transition-colors cursor-pointer border-0 outline-none"
            >
              Inspect NFT Drop
            </button>
            <button
              type="button"
              onClick={onResetForm}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer border-0 outline-none"
            >
              Create Another Release
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Controls */}
      {!mintedNFT && (
        <div className="space-y-2.5">
          {!walletAddress ? (
            <button
              type="button"
              onClick={onConnectWallet}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
            >
              <span>Connect TON Wallet to Mint NFT</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canMint || isExecuting}
              onClick={onExecuteMint}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border-0 outline-none shadow-lg shadow-[#0088CC]/25"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{telemetry.liveStatusMessage}</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Pin to Pinata & Mint NFT on TON</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            disabled={isExecuting}
            onClick={onPublishTrackOnly}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
          >
            <Music className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Pin to Pinata & Publish Stream Track Only</span>
          </button>
        </div>
      )}
    </div>
  );
};
