import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  X,
  Move,
  Crop,
} from 'lucide-react';
import { validateStorageFile } from '@/services/storageService';
import { PinnedAssetRecord, formatBytes, shortAddress } from './StudioCoverGenerator';
import { toast } from 'sonner';

export type BannerAspectPreset = '3:1' | '16:5' | '16:9';

interface AspectSpec {
  id: BannerAspectPreset;
  label: string;
  ratio: number;
  outputWidth: number;
  outputHeight: number;
}

export const BANNER_ASPECT_PRESETS: AspectSpec[] = [
  { id: '3:1', label: '3:1 Profile Standard', ratio: 3, outputWidth: 1500, outputHeight: 500 },
  { id: '16:5', label: '16:5 Ultra-Wide', ratio: 16 / 5, outputWidth: 1600, outputHeight: 500 },
  { id: '16:9', label: '16:9 Stage Header', ratio: 16 / 9, outputWidth: 1600, outputHeight: 900 },
];

export interface BannerSaveResult {
  record: PinnedAssetRecord;
  bannerUrl: string;
}

interface ProfileBannerCropperProps {
  currentBannerUrl?: string;
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveCroppedBanner: (
    file: File,
    onProgress?: (pct: number, stageLabel?: string) => void
  ) => Promise<BannerSaveResult>;
  droppedFile?: File | null;
  onConsumeDroppedFile?: () => void;
}

export const cropImageToBannerFile = async (params: {
  imageElement: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  rotationDeg: number;
  outputWidth: number;
  outputHeight: number;
  sourceFile: File;
}): Promise<File> => {
  const {
    imageElement,
    naturalWidth,
    naturalHeight,
    viewportWidth,
    viewportHeight,
    zoom,
    pan,
    rotationDeg,
    outputWidth,
    outputHeight,
    sourceFile,
  } = params;

  if (!naturalWidth || !naturalHeight || !viewportWidth || !viewportHeight) {
    return sourceFile;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return sourceFile;
  }

  const normalizedRot = ((rotationDeg % 360) + 360) % 360;
  const isQuarterTurn = normalizedRot === 90 || normalizedRot === 270;
  const effectiveW = isQuarterTurn ? naturalHeight : naturalWidth;
  const effectiveH = isQuarterTurn ? naturalWidth : naturalHeight;

  const baseCoverScale = Math.max(viewportWidth / effectiveW, viewportHeight / effectiveH);
  const k = outputWidth / viewportWidth;

  ctx.clearRect(0, 0, outputWidth, outputHeight);
  ctx.fillStyle = '#0B0F17';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  ctx.save();
  ctx.translate(outputWidth / 2 + pan.x * k, outputHeight / 2 + pan.y * k);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  const drawScale = baseCoverScale * zoom * k;
  ctx.scale(drawScale, drawScale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageElement, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight);
  ctx.restore();

  const tryToBlob = (mime: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => {
      if (typeof canvas.toBlob !== 'function') {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob), mime, quality);
    });

  let blob = await tryToBlob('image/webp', 0.92);
  let ext = 'webp';
  let finalMime = 'image/webp';

  if (!blob) {
    blob = await tryToBlob('image/png');
    ext = 'png';
    finalMime = 'image/png';
  }

  if (!blob) {
    return sourceFile;
  }

  const cleanBase = sourceFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'banner';
  return new File([blob], `${cleanBase}_cropped_${outputWidth}x${outputHeight}.${ext}`, {
    type: finalMime,
  });
};

export const ProfileBannerCropper: React.FC<ProfileBannerCropperProps> = ({
  currentBannerUrl,
  artistName,
  isOpen,
  onClose,
  onSaveCroppedBanner,
  droppedFile,
  onConsumeDroppedFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>({ w: 660, h: 220 });

  const [aspectPreset, setAspectPreset] = useState<BannerAspectPreset>('3:1');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotationDeg, setRotationDeg] = useState<number>(0);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const dragOriginRef = useRef<{ clientX: number; clientY: number; startPanX: number; startPanY: number } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedReceipt, setSavedReceipt] = useState<BannerSaveResult | null>(null);
  const [copiedCid, setCopiedCid] = useState(false);

  const activeSpec =
    BANNER_ASPECT_PRESETS.find((p) => p.id === aspectPreset) || BANNER_ASPECT_PRESETS[0];

  const computeClampedPan = useCallback(
    (
      nextPan: { x: number; y: number },
      nextZoom: number,
      nextRot: number,
      nat = naturalSize,
      vp = viewportSize
    ) => {
      if (!nat.w || !nat.h || !vp.w || !vp.h) return nextPan;
      const normalized = ((nextRot % 360) + 360) % 360;
      const quarter = normalized === 90 || normalized === 270;
      const effW = quarter ? nat.h : nat.w;
      const effH = quarter ? nat.w : nat.h;
      const baseScale = Math.max(vp.w / effW, vp.h / effH);
      const maxX = Math.max(0, (effW * baseScale * nextZoom - vp.w) / 2);
      const maxY = Math.max(0, (effH * baseScale * nextZoom - vp.h) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
        y: Math.max(-maxY, Math.min(maxY, nextPan.y)),
      };
    },
    [naturalSize, viewportSize]
  );

  // Measure viewport dimensions cleanly on mount, resize, or aspect change
  useEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ w: rect.width, h: rect.height });
      } else {
        setViewportSize({ w: 660, h: Math.round(660 / activeSpec.ratio) });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen, activeSpec.ratio, imageObjectUrl]);

  // Re-clamp pan when zoom, rotation, or preset changes
  useEffect(() => {
    setPan((prev) => computeClampedPan(prev, zoom, rotationDeg));
  }, [zoom, rotationDeg, aspectPreset, computeClampedPan]);

  const handleLoadImageFile = useCallback((file: File) => {
    const check = validateStorageFile(file, 'image');
    if (!check.isValid) {
      setErrorMessage(check.error || 'Unsupported banner image format.');
      toast.error(check.error || 'Unsupported banner image format.');
      return;
    }

    setErrorMessage(null);
    setSavedReceipt(null);
    setSourceFile(file);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotationDeg(0);

    setImageObjectUrl((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  useEffect(() => {
    if (droppedFile && isOpen) {
      handleLoadImageFile(droppedFile);
      onConsumeDroppedFile?.();
    }
  }, [droppedFile, isOpen, handleLoadImageFile, onConsumeDroppedFile]);

  useEffect(() => {
    return () => {
      if (imageObjectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageObjectUrl);
      }
    };
  }, [imageObjectUrl]);

  if (!isOpen) return null;

  const normalizedRot = ((rotationDeg % 360) + 360) % 360;
  const isQuarterTurn = normalizedRot === 90 || normalizedRot === 270;
  const effectiveNatW = isQuarterTurn ? naturalSize.h : naturalSize.w;
  const effectiveNatH = isQuarterTurn ? naturalSize.w : naturalSize.h;
  const baseCoverScale =
    effectiveNatW > 0 && effectiveNatH > 0
      ? Math.max(viewportSize.w / effectiveNatW, viewportSize.h / effectiveNatH)
      : 1;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageObjectUrl || isSaving) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsPanning(true);
    dragOriginRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.clientX;
    const dy = e.clientY - dragOriginRef.current.clientY;
    setPan(
      computeClampedPan(
        {
          x: dragOriginRef.current.startPanX + dx,
          y: dragOriginRef.current.startPanY + dy,
        },
        zoom,
        rotationDeg
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setIsPanning(false);
      dragOriginRef.current = null;
    }
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!imageObjectUrl || isSaving) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Number(Math.max(1, Math.min(3, prev + delta)).toFixed(2)));
  };

  const handleResetCrop = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotationDeg(0);
  };

  const handleSave = async () => {
    if (!sourceFile) {
      setErrorMessage('Select or drop an image first to crop and upload.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setUploadProgress(5);
    setStageMessage('Rendering cropped banner...');

    try {
      const imgEl = imgRef.current;
      let croppedFile = sourceFile;

      if (imgEl && naturalSize.w > 0 && naturalSize.h > 0) {
        croppedFile = await cropImageToBannerFile({
          imageElement: imgEl,
          naturalWidth: naturalSize.w,
          naturalHeight: naturalSize.h,
          viewportWidth: viewportSize.w,
          viewportHeight: viewportSize.h,
          zoom,
          pan,
          rotationDeg,
          outputWidth: activeSpec.outputWidth,
          outputHeight: activeSpec.outputHeight,
          sourceFile,
        });
      }

      setUploadProgress(15);
      setStageMessage('Pinning cropped banner to Pinata IPFS...');

      const result = await onSaveCroppedBanner(croppedFile, (pct, label) => {
        setUploadProgress(pct);
        if (label) setStageMessage(label);
      });

      setUploadProgress(100);
      setStageMessage('Banner updated on Pinata IPFS & Firestore');
      setSavedReceipt(result);
      toast.success('Artist profile banner pinned to Pinata & saved to Firestore!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to crop, pin, or save artist profile banner.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCid = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCid(true);
    toast.success('Copied IPFS URI to clipboard');
    setTimeout(() => setCopiedCid(false), 1500);
  };

  return (
    <section
      className="bg-[#121824] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl shadow-black/30"
      data-testid="banner-cropper-panel"
    >
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Artist Profile Banner Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Upload, frame, and pin a high-resolution profile banner to Pinata IPFS and sync to Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {activeSpec.outputWidth} × {activeSpec.outputHeight} px
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close banner studio"
            className="w-8 h-8 rounded-lg bg-[#182032] hover:bg-[#1F2A40] text-slate-300 flex items-center justify-center cursor-pointer border-0 outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0D131F] p-1 rounded-xl">
          {BANNER_ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isSaving}
              onClick={() => setAspectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border-0 outline-none ${
                aspectPreset === preset.id
                  ? 'bg-[#0088CC] text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          data-testid="banner-file-input"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleLoadImageFile(f);
            e.target.value = '';
          }}
        />

        <button
          type="button"
          disabled={isSaving}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-[#182032] hover:bg-[#1F2A40] text-xs font-bold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-0 outline-none"
        >
          <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{imageObjectUrl ? 'Replace Banner Image' : 'Select Banner Image'}</span>
        </button>
      </div>

      {/* Interactive Crop Viewport */}
      <div
        ref={viewportRef}
        data-testid="banner-crop-viewport"
        style={{ aspectRatio: String(activeSpec.ratio) }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheelZoom}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleLoadImageFile(f);
        }}
        className={`relative w-full max-h-[340px] rounded-2xl overflow-hidden select-none flex items-center justify-center transition-colors ${
          isDraggingFile
            ? 'bg-[#0088CC]/20'
            : 'bg-[#0B0F17]'
        } ${imageObjectUrl ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'}`}
        onClick={() => {
          if (!imageObjectUrl) fileInputRef.current?.click();
        }}
      >
        {imageObjectUrl ? (
          <>
            <img
              ref={imgRef}
              src={imageObjectUrl}
              alt={`${artistName} banner crop preview`}
              referrerPolicy="no-referrer"
              draggable={false}
              onLoad={(e) => {
                const target = e.currentTarget;
                const w = target.naturalWidth || 1500;
                const h = target.naturalHeight || 500;
                setNaturalSize({ w, h });
                const el = viewportRef.current;
                if (el) {
                  const rect = el.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0) {
                    setViewportSize({ w: rect.width, h: rect.height });
                  }
                }
              }}
              style={{
                width: naturalSize.w > 0 ? `${naturalSize.w * baseCoverScale}px` : '100%',
                height: naturalSize.h > 0 ? `${naturalSize.h * baseCoverScale}px` : '100%',
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotationDeg}deg)`,
                transformOrigin: 'center center',
              }}
              className="pointer-events-none select-none will-change-transform"
            />

            {/* Subtle Safe-Zone Guide Scrim (Zero Border Lines) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-medium text-white/90 bg-black/55 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Move className="w-3 h-3 text-[#38BDF8]" />
              <span>Drag to reposition · Scroll to zoom</span>
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] font-mono tabular-nums text-white/90 bg-black/55 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {zoom.toFixed(2)}x · {rotationDeg}°
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2.5">
            {currentBannerUrl && (
              <img
                src={currentBannerUrl}
                alt="Current profile banner"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
              />
            )}
            <div className="relative z-10 w-11 h-11 rounded-xl bg-[#182032]/90 flex items-center justify-center text-[#38BDF8]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-xs font-bold text-white">
                Drop a wide banner image or click to browse
              </p>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP up to 10 MB · Recommended {activeSpec.outputWidth} × {activeSpec.outputHeight} px
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Crop Precision Controls (Zoom, Rotate, Reset) */}
      {imageObjectUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#0D131F] p-3.5 rounded-xl">
          <div className="sm:col-span-6 flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Number(Math.max(1, z - 0.15).toFixed(2)))}
              className="w-8 h-8 rounded-lg bg-[#182032] hover:bg-[#1F2A40] text-slate-200 flex items-center justify-center shrink-0 cursor-pointer border-0 outline-none"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              aria-label="Banner zoom"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              disabled={isSaving}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#38BDF8] cursor-pointer"
            />
            <button
              type="button"
              disabled={isSaving}
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Number(Math.min(3, z + 0.15).toFixed(2)))}
              className="w-8 h-8 rounded-lg bg-[#182032] hover:bg-[#1F2A40] text-slate-200 flex items-center justify-center shrink-0 cursor-pointer border-0 outline-none"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-slate-300 w-10 text-right shrink-0">
              {zoom.toFixed(2)}x
            </span>
          </div>

          <div className="sm:col-span-6 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setRotationDeg((r) => (r - 90 + 360) % 360)}
              className="px-3 py-1.5 rounded-lg bg-[#182032] hover:bg-[#1F2A40] text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer border-0 outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>-90°</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setRotationDeg((r) => (r + 90) % 360)}
              className="px-3 py-1.5 rounded-lg bg-[#182032] hover:bg-[#1F2A40] text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer border-0 outline-none"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>+90°</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleResetCrop}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-300 cursor-pointer border-0 outline-none"
            >
              Reset Frame
            </button>
          </div>
        </div>
      )}

      {/* Upload & Sync Progress Indicator */}
      {(isSaving || uploadProgress > 0) && !savedReceipt && (
        <div className="p-3.5 rounded-xl bg-[#0D131F] space-y-2" data-testid="banner-upload-progress">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200 font-semibold flex items-center gap-2">
              {isSaving && <Loader2 className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" />}
              <span>{stageMessage || 'Processing banner...'}</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-[#38BDF8]">
              {Math.min(100, Math.max(0, uploadProgress))}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#1C2538] overflow-hidden">
            <div
              className="w-full h-full rounded-full bg-gradient-to-r from-[#0088CC] to-[#38BDF8] origin-left transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${Math.min(100, Math.max(0, uploadProgress)) / 100})` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Success Receipt */}
      {savedReceipt && (
        <div
          className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3"
          data-testid="banner-save-receipt"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">
              Banner pinned ({shortAddress(savedReceipt.record.cid, 8, 6)}) & saved to Firestore
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyCid(savedReceipt.record.ipfsUri)}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-emerald-200 cursor-pointer border-0 outline-none"
              title="Copy ipfs:// URI"
            >
              {copiedCid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={savedReceipt.bannerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-emerald-200"
              title="Open pinned banner on Pinata Gateway"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
          {sourceFile ? `${sourceFile.name} · ${formatBytes(sourceFile.size)}` : 'No file selected'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-200 cursor-pointer border-0 outline-none"
          >
            Done
          </button>
          <button
            type="button"
            disabled={!sourceFile || isSaving}
            onClick={handleSave}
            data-testid="save-cropped-banner-btn"
            className="px-5 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer border-0 outline-none shadow-lg shadow-[#0088CC]/25"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Pinning & Syncing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Crop, Pin to Pinata & Save Banner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
