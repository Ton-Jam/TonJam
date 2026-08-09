import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Music, Image as ImageIcon, Sparkles, Zap, Cloud, 
  Percent, ChevronRight, ChevronLeft, Check, HelpCircle, 
  Sliders, ShieldCheck, Play, ArrowRight, Disc, Layers, Award,
  Sparkle
} from 'lucide-react';
import { TON_LOGO } from '@/constants';
import confetti from 'canvas-confetti';

interface HowToMintTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const HowToMintTutorial: React.FC<HowToMintTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  // Interactive step 2 rarity simulation state
  const [demoRarity, setDemoRarity] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'>('Legendary');
  
  // Interactive step 3 royalty slider simulation state
  const [demoRoyalty, setDemoRoyalty] = useState<number>(7.5);
  const [demoSalePrice, setDemoSalePrice] = useState<number>(10); // 10 TON

  // Interactive step 4 IPFS/TON simulation toggle
  const [simulatedIpfsStatus, setSimulatedIpfsStatus] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('tonjam_mint_tutorial_dismissed', 'true');
    }
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    if (onComplete) onComplete();
    onClose();
  };

  const steps = [
    {
      step: 1,
      badge: "Step 1 of 4",
      title: "Audio Master & Cover Artwork",
      subtitle: "High-Definition Media & AI Cover Synthesis",
      icon: Music,
      color: "from-blue-500 to-cyan-400",
      description: "Upload your audio master in 24-bit studio quality (WAV, FLAC, MP3 up to 50MB) and high-resolution cover artwork or generate art using Gemini AI."
    },
    {
      step: 2,
      badge: "Step 2 of 4",
      title: "Decentralized Metadata & Lore",
      subtitle: "TEP-64 Encoding & Rarity Customization",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      description: "Customize song titles, genres, lyrics, and set custom rarity tiers (Common to Mythic) with custom attributes stored permanently on IPFS."
    },
    {
      step: 3,
      badge: "Step 3 of 4",
      title: "Secondary Royalties & Revenue Splits",
      subtitle: "Smart Contract Revenue Automation",
      icon: Percent,
      color: "from-amber-400 to-orange-500",
      description: "Set secondary marketplace royalties (0% to 15%) and define multi-way collaborator splits that execute automatically on-chain."
    },
    {
      step: 4,
      badge: "Step 4 of 4",
      title: "TON Blockchain Minting & IPFS",
      subtitle: "Decentralized Pinning & Wallet Ownership",
      icon: Zap,
      color: "from-emerald-400 to-teal-500",
      description: "Pin metadata to Pinata IPFS nodes and send a smart contract transaction on TON Blockchain to claim 100% creator ownership."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#0D1527]/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white flex flex-col max-h-[90vh]"
        >
          {/* Top Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0052FF] via-purple-500 to-emerald-400" />

          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0052FF]/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight text-white uppercase">
                    Artist Guide: How to Mint
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono font-bold uppercase">
                    Interactive Tutorial
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Learn how to publish, monetize, and mint your music on TON Blockchain
                </p>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer border-none outline-none"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="px-6 py-3 bg-black/30 border-b border-white/5 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar">
            {steps.map((s) => {
              const isActive = s.step === currentStep;
              const isPassed = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none outline-none ${
                    isActive 
                      ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-500/25' 
                      : isPassed
                      ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                    isActive ? 'bg-white text-blue-600' : isPassed ? 'bg-blue-400 text-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.step}
                  </span>
                  <span className="hidden sm:inline truncate">{s.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Body */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <AnimatePresence mode="wait">
              {steps.map((s) => {
                if (s.step !== currentStep) return null;
                const IconComp = s.icon;

                return (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Step Title Header */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} p-0.5 shrink-0 shadow-lg`}>
                        <div className="w-full h-full bg-[#0D1527] rounded-[14px] flex items-center justify-center">
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          {s.badge}
                        </span>
                        <h4 className="text-lg font-black text-white tracking-tight mt-1">
                          {s.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-medium mt-1">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {/* INTERACTIVE PREVIEW SIMULATORS FOR EACH STEP */}
                    {s.step === 1 && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-blue-400" /> Interactive Media Dropzone Preview
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Simulated Audio Box */}
                          <div className="bg-white/5 border border-dashed border-blue-500/40 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                              <Music className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">Studio_Master_Track.wav</p>
                              <p className="text-[9px] text-emerald-400 font-mono font-bold">24-bit • Lossless 48kHz • 24.8 MB</p>
                            </div>
                          </div>

                          {/* Simulated Gemini AI Art Box */}
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">Gemini AI Cover Synthesizer</p>
                              <p className="text-[9px] text-purple-300 font-medium">Generate 3D album art in seconds</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-slate-300 flex items-start gap-2">
                          <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Pro Tip:</strong> High-definition audio and striking artwork double collector conversion rates on the TON Marketplace.
                          </span>
                        </div>
                      </div>
                    )}

                    {s.step === 2 && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Interactive Rarity Tier Simulator
                          </div>
                          <span className="text-[10px] font-mono font-bold text-purple-400">
                            Current: {demoRarity}
                          </span>
                        </div>

                        {/* Interactive Tier Buttons */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'] as const).map((tier) => (
                            <button
                              key={tier}
                              onClick={() => setDemoRarity(tier)}
                              className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none outline-none ${
                                demoRarity === tier
                                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>

                        {/* Metadata Tag Preview Box */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Disc className="w-4 h-4 text-purple-400" />
                            <div>
                              <p className="text-xs font-bold text-white">TEP-64 Metadata Attribute</p>
                              <p className="text-[10px] text-slate-400">Stored on IPFS & Indexed by TON Explorer</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest ${
                            demoRarity === 'Mythic' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            demoRarity === 'Legendary' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                            demoRarity === 'Epic' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                            demoRarity === 'Rare' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {demoRarity} Edition
                          </span>
                        </div>
                      </div>
                    )}

                    {s.step === 3 && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-amber-400" /> Interactive Secondary Royalty Calculator
                          </div>
                          <span className="text-xs font-mono font-black text-amber-400">
                            {demoRoyalty}% Royalty
                          </span>
                        </div>

                        {/* Slider Control */}
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="0.5"
                          value={demoRoyalty}
                          onChange={(e) => setDemoRoyalty(parseFloat(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />

                        {/* Calculated Earnings Breakdown */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">If resale price = 10 TON</span>
                            <span className="font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                              <img src={TON_LOGO} alt="TON" className="w-3 h-3 object-contain" />
                              10.0 TON
                            </span>
                          </div>
                          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <span className="text-[9px] text-amber-400 uppercase font-bold block">Your Automatic Royalty Payout</span>
                            <span className="font-mono font-black text-amber-300 flex items-center gap-1 mt-0.5">
                              <img src={TON_LOGO} alt="TON" className="w-3 h-3 object-contain" />
                              {((10 * demoRoyalty) / 100).toFixed(2)} TON
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {s.step === 4 && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Immutable Smart Contract Mint Flow
                        </div>

                        <div className="space-y-2">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Cloud className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs font-bold text-white">1. Pinata IPFS Gateway</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Ready
                            </span>
                          </div>

                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-white">2. TON Wallet Smart Contract Call</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                              Instant On-Chain
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-slate-300">
                          <strong>Ownership Guarantee:</strong> You retain 100% full rights to your music. Minting produces standard TEP-64 compliant tokens tradeable across all TON marketplaces.
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer Navigation Bar */}
          <div className="p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            {/* Don't Show Again Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 accent-[#0052FF] rounded border-white/20 bg-white/5 cursor-pointer"
              />
              <span className="text-[11px]">Don't show this guide automatically again</span>
            </label>

            {/* Back / Next / Finish Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer border-none outline-none"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                  className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/25 border-none outline-none"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 border-none outline-none"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Start Minting Now</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HowToMintTutorial;
