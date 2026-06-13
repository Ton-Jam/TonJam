import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Flame, 
  Wind, 
  Coffee, 
  Waves, 
  Headphones, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Sliders,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Define the shape of each Soundscape Layer
interface SoundscapeLayer {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGlow: string;
  volume: number; // 0 to 100
  isActive: boolean;
}

// Pre-defined set of ambient layers
const DEFAULT_LAYERS: SoundscapeLayer[] = [
  { id: 'rain', name: 'Rainfall', icon: CloudRain, color: 'text-blue-400', bgGlow: 'bg-blue-500/10', volume: 50, isActive: false },
  { id: 'campfire', name: 'Campfire', icon: Flame, color: 'text-orange-500', bgGlow: 'bg-orange-500/10', volume: 40, isActive: false },
  { id: 'wind', name: 'Forest Wind', icon: Wind, color: 'text-emerald-400', bgGlow: 'bg-emerald-500/10', volume: 30, isActive: false },
  { id: 'cafe', name: 'Cozy Cafe', icon: Coffee, color: 'text-amber-500', bgGlow: 'bg-amber-500/10', volume: 30, isActive: false },
  { id: 'waves', name: 'Ocean Waves', icon: Waves, color: 'text-cyan-400', bgGlow: 'bg-cyan-500/10', volume: 40, isActive: false },
  { id: 'drone', name: 'Analog Drone', icon: Headphones, color: 'text-indigo-400', bgGlow: 'bg-indigo-500/10', volume: 30, isActive: false },
];

// Presets that combine layers at specific volume targets
interface MixerPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  layers: Record<string, number>; // layerId: volume percentage
}

const PRESETS: MixerPreset[] = [
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    description: 'Rainy window panes and a warm cafe focus',
    icon: '🌧️',
    layers: {
      rain: 75,
      cafe: 25,
      wind: 15,
      campfire: 0,
      waves: 0,
      drone: 0
    }
  },
  {
    id: 'late-night-lofi',
    name: 'Late Night Lo-Fi',
    description: 'Subby synth drone nested under a warm rainfall',
    icon: '🌙',
    layers: {
      drone: 65,
      rain: 45,
      cafe: 20,
      campfire: 0,
      wind: 0,
      waves: 0
    }
  },
  {
    id: 'forest-ambience',
    name: 'Forest Ambience',
    description: 'Sweeping forest wind, crackling fire, and sea mist',
    icon: '🌲',
    layers: {
      wind: 70,
      campfire: 50,
      waves: 15,
      rain: 0,
      cafe: 0,
      drone: 0
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Slow ocean breakers drifting over a meditative hum',
    icon: '🌊',
    layers: {
      waves: 80,
      wind: 35,
      drone: 25,
      rain: 0,
      campfire: 0,
      cafe: 0
    }
  }
];

export const SoundscapeMixer: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [layers, setLayers] = useState<SoundscapeLayer[]>(DEFAULT_LAYERS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(80); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);

  // Audio nodes and engine references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<Record<string, {
    gainNode: GainNode;
    nodes: AudioNode[];
    intervals: any[];
    angles: Record<string, number>;
  }>>({});

  // Clean values helper
  const getOutputVolume = (layerVol: number) => {
    if (isMuted || !isPlaying) return 0;
    return (layerVol / 100) * (masterVolume / 100);
  };

  // Build audio noise buffers (White, Pink, Brown)
  const getNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' | 'brown') => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11; // normalise
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // normalise
      }
    }
    return buffer;
  };

  // Inside layout effect: initialize AudioContext on-demand (interactivity rule)
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume / 100, ctx.currentTime);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    } catch (e) {
      console.error("Failed to initialize Web Audio context", e);
      toast.error("Audio Synthesis not fully supported in this environment.");
    }
  };

  // Start synthesizing a single layer
  const startLayerNode = (layerId: string, customVolume?: number) => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    // Stop if already active
    stopLayerNode(layerId);

    const targetLayer = layers.find(l => l.id === layerId);
    if (!targetLayer) return;

    const layerVol = customVolume !== undefined ? customVolume : targetLayer.volume;
    const layerVolumeScale = getOutputVolume(layerVol);

    const layerGain = ctx.createGain();
    layerGain.gain.setValueAtTime(layerVolumeScale, ctx.currentTime);
    layerGain.connect(masterGain);

    const nodes: AudioNode[] = [];
    const intervals: any[] = [];
    const angles: Record<string, number> = {};

    switch (layerId) {
      case 'rain': {
        // Rain is brown noise + pink noise with lowpass filter
        const brownBuffer = getNoiseBuffer(ctx, 'brown');
        const pinkBuffer = getNoiseBuffer(ctx, 'pink');

        if (brownBuffer) {
          const brownSource = ctx.createBufferSource();
          brownSource.buffer = brownBuffer;
          brownSource.loop = true;

          const lpLow = ctx.createBiquadFilter();
          lpLow.type = 'lowpass';
          lpLow.frequency.setValueAtTime(650, ctx.currentTime);

          brownSource.connect(lpLow);
          lpLow.connect(layerGain);
          brownSource.start();
          nodes.push(brownSource, lpLow);
        }

        if (pinkBuffer) {
          const pinkSource = ctx.createBufferSource();
          pinkSource.buffer = pinkBuffer;
          pinkSource.loop = true;

          const lpHigh = ctx.createBiquadFilter();
          lpHigh.type = 'lowpass';
          lpHigh.frequency.setValueAtTime(2500, ctx.currentTime);

          const hpFilter = ctx.createBiquadFilter();
          hpFilter.type = 'highpass';
          hpFilter.frequency.setValueAtTime(600, ctx.currentTime);

          const splitterGain = ctx.createGain();
          splitterGain.gain.setValueAtTime(0.18, ctx.currentTime);

          pinkSource.connect(lpHigh);
          lpHigh.connect(hpFilter);
          hpFilter.connect(splitterGain);
          splitterGain.connect(layerGain);

          pinkSource.start();
          nodes.push(pinkSource, lpHigh, hpFilter, splitterGain);
        }
        break;
      }

      case 'campfire': {
        // Campfire is low rumble brown noise + random generator fire crackling spikes
        const brownBuffer = getNoiseBuffer(ctx, 'brown');
        if (brownBuffer) {
          const rumbleSource = ctx.createBufferSource();
          rumbleSource.buffer = brownBuffer;
          rumbleSource.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, ctx.currentTime);

          const rumbleGain = ctx.createGain();
          rumbleGain.gain.setValueAtTime(0.3, ctx.currentTime);

          rumbleSource.connect(filter);
          filter.connect(rumbleGain);
          rumbleGain.connect(layerGain);

          rumbleSource.start();
          nodes.push(rumbleSource, filter, rumbleGain);
        }

        // Fire crackling pops scheduler (procedural clicks every 150ms-600ms)
        let scheduleNextPop = () => {
          if (!activeSourcesRef.current[layerId]) return;
          const popTime = ctx.currentTime + Math.random() * 0.1;
          
          try {
            const osc = ctx.createOscillator();
            const clickGain = ctx.createGain();
            
            // Random pop quality
            const isCrack = Math.random() > 0.45;
            osc.type = isCrack ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(250 + Math.random() * 800, popTime);
            
            clickGain.gain.setValueAtTime(0, ctx.currentTime);
            clickGain.gain.setValueAtTime((isCrack ? 0.09 : 0.02) * Math.random(), popTime);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.015 + Math.random() * 0.03);
            
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = isCrack ? 4000 : 1500;
            bp.Q.value = 2.0;

            osc.connect(bp);
            bp.connect(clickGain);
            clickGain.connect(layerGain);
            
            osc.start(popTime);
            osc.stop(popTime + 0.1);
          } catch (e) {
            // fail-safe
          }

          // Queue next crackle
          const delay = 180 + Math.random() * 520;
          const crackleTimeout = setTimeout(scheduleNextPop, delay);
          intervals.push(crackleTimeout);
        };
        scheduleNextPop();
        break;
      }

      case 'wind': {
        // Wind is sweeping pink noise passing through modulated bandpass filter
        const pinkBuffer = getNoiseBuffer(ctx, 'pink');
        if (pinkBuffer) {
          const windSource = ctx.createBufferSource();
          windSource.buffer = pinkBuffer;
          windSource.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.value = 1.6;
          filter.frequency.setValueAtTime(350, ctx.currentTime);

          windSource.connect(filter);
          filter.connect(layerGain);
          windSource.start();

          nodes.push(windSource, filter);

          // Animate filter freq manually with sine waves to mimic breeze puffs
          let angle = 0;
          const windInterval = setInterval(() => {
            angle += 0.02 + Math.random() * 0.01;
            const wander = 320 + Math.sin(angle) * 160 + (Math.sin(angle * 3.3) * 50);
            try {
              filter.frequency.setValueAtTime(wander, ctx.currentTime);
            } catch (err) {}
          }, 80);
          intervals.push(windInterval);
        }
        break;
      }

      case 'cafe': {
        // Cafe chatter is a compound generator simulating coffee cup clinks and cozy vocal frequencies
        // Cup clinks (high metal bursts) scheduler
        const scheduleCafeClink = () => {
          if (!activeSourcesRef.current[layerId]) return;
          const clinkTime = ctx.currentTime;
          
          try {
            const osc = ctx.createOscillator();
            const clinkGain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1800 + Math.random() * 1200, clinkTime);
            clinkGain.gain.setValueAtTime(0, clinkTime);
            clinkGain.gain.setValueAtTime(0.012 * Math.random(), clinkTime);
            clinkGain.gain.exponentialRampToValueAtTime(0.0001, clinkTime + 0.08 + Math.random() * 0.15);

            osc.connect(clinkGain);
            clinkGain.connect(layerGain);
            osc.start(clinkTime);
            osc.stop(clinkTime + 0.3);
          } catch(err) {}

          const delay = 1200 + Math.random() * 4500;
          const clinkTimeout = setTimeout(scheduleCafeClink, delay);
          intervals.push(clinkTimeout);
        };
        scheduleCafeClink();

        // Cozy room murmur - three soft sub oscillators with gentle frequency sweeps
        const frequencies = [110, 160, 220];
        frequencies.forEach((freq, idx) => {
          try {
            const osc = ctx.createOscillator();
            const oGain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), ctx.currentTime);
            oGain.gain.value = 0.15 / frequencies.length;

            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.setValueAtTime(250, ctx.currentTime);

            osc.connect(lp);
            lp.connect(oGain);
            oGain.connect(layerGain);
            osc.start();
            nodes.push(osc, lp, oGain);

            // subtle pitch modulatation
            let angle = 0;
            const detuneInterval = setInterval(() => {
              angle += 0.05;
              try {
                osc.frequency.setValueAtTime(freq + Math.sin(angle) * 2, ctx.currentTime);
              } catch(e) {}
            }, 100);
            intervals.push(detuneInterval);
          } catch(err) {}
        });
        break;
      }

      case 'waves': {
        // Ocean waves: pink noise with rhythmic sine volume sweeps (swell speed)
        const pinkBuffer = getNoiseBuffer(ctx, 'pink');
        if (pinkBuffer) {
          const waveSource = ctx.createBufferSource();
          waveSource.buffer = pinkBuffer;
          waveSource.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;

          const swellGain = ctx.createGain();
          swellGain.gain.value = layerVolumeScale;

          waveSource.connect(filter);
          filter.connect(swellGain);
          swellGain.connect(layerGain);
          waveSource.start();

          nodes.push(waveSource, filter, swellGain);

          angles['waves'] = 0;
          // Waves rise and fall every 11 seconds
          const swellInterval = setInterval(() => {
            if (!activeSourcesRef.current[layerId]) return;
            try {
              angles['waves'] += 0.05; // speed of swell
              const targetScale = getOutputVolume(layerVol);
              // Waves reach a base wash (25%) and peak to 100%
              const washScale = 0.25 + (Math.sin(angles['waves']) * 0.5 + 0.5) * 0.75;
              swellGain.gain.setValueAtTime(targetScale * washScale, ctx.currentTime);
              
              // Modulate waves filter as well (waves crash is brighter, retreat is darker)
              const dynamicFilterFreq = 220 + (Math.sin(angles['waves'] + 0.5) * 0.5 + 0.5) * 280;
              filter.frequency.setValueAtTime(dynamicFilterFreq, ctx.currentTime);
            } catch(e) {}
          }, 100);
          intervals.push(swellInterval);
        }
        break;
      }

      case 'drone': {
        // Analog sub drone - detuned tri/saw combination for warm analog texture
        try {
          const osc1 = ctx.createOscillator();
          const oscdet = ctx.createOscillator();
          const og1 = ctx.createGain();
          const ogd = ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
          og1.gain.value = 0.5;

          oscdet.type = 'sine';
          oscdet.frequency.setValueAtTime(110.3, ctx.currentTime); // detuned A2 harmonic
          ogd.gain.value = 0.15;

          const lpFilter = ctx.createBiquadFilter();
          lpFilter.type = 'lowpass';
          lpFilter.frequency.setValueAtTime(140, ctx.currentTime);
          lpFilter.Q.setValueAtTime(2.0, ctx.currentTime);

          osc1.connect(lpFilter);
          oscdet.connect(lpFilter);
          
          lpFilter.connect(layerGain);
          
          osc1.start();
          oscdet.start();
          
          nodes.push(osc1, oscdet, og1, ogd, lpFilter);
        } catch(err) {}
        break;
      }
    }

    activeSourcesRef.current[layerId] = {
      gainNode: layerGain,
      nodes,
      intervals,
      angles
    };
  };

  // Stop synthesizing a single layer
  const stopLayerNode = (layerId: string) => {
    const existing = activeSourcesRef.current[layerId];
    if (existing) {
      // Clear timers
      existing.intervals.forEach((timer) => {
        clearInterval(timer);
        clearTimeout(timer);
      });
      // Stop and disconnect nodes
      existing.nodes.forEach((node: any) => {
        try {
          if (node.stop) node.stop();
        } catch (e) {}
        try {
          node.disconnect();
        } catch (e) {}
      });
      try {
        existing.gainNode.disconnect();
      } catch (e) {}
      delete activeSourcesRef.current[layerId];
    }
  };

  // Sync volume of an active layer node on slide adjustments
  const syncLayerVolume = (layerId: string, customVol?: number) => {
    const targetLayer = layers.find(l => l.id === layerId);
    if (!targetLayer) return;

    const vol = customVol !== undefined ? customVol : targetLayer.volume;
    const outputVol = getOutputVolume(vol);
    
    const activeData = activeSourcesRef.current[layerId];
    if (activeData) {
      try {
        const ctx = audioCtxRef.current;
        if (ctx) {
          activeData.gainNode.gain.setValueAtTime(outputVol, ctx.currentTime);
        }
      } catch (err) {}
    }
  };

  // Global triggers
  const playAllActiveLayers = () => {
    if (!audioCtxRef.current) initAudio();
    layers.forEach(layer => {
      if (layer.isActive) {
        startLayerNode(layer.id);
      }
    });
  };

  const stopAllLayers = () => {
    Object.keys(activeSourcesRef.current).forEach(layerId => {
      stopLayerNode(layerId);
    });
  };

  // React to play/pause state
  useEffect(() => {
    if (isPlaying) {
      playAllActiveLayers();
    } else {
      stopAllLayers();
    }
    return () => {};
  }, [isPlaying]);

  // Master volume change handler
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        const nextGain = isMuted ? 0 : masterVolume / 100;
        masterGainRef.current.gain.setValueAtTime(nextGain, audioCtxRef.current.currentTime);
        
        // Sync active swell nodes
        layers.forEach(layer => {
          if (layer.isActive) {
            syncLayerVolume(layer.id);
          }
        });
      } catch (err) {}
    }
  }, [masterVolume, isMuted]);

  // Clean shutdown on component unmount
  useEffect(() => {
    return () => {
      Object.keys(activeSourcesRef.current).forEach(lid => {
        const existing = activeSourcesRef.current[lid];
        if (existing) {
          existing.intervals.forEach(timer => {
            clearInterval(timer);
            clearTimeout(timer);
          });
          existing.nodes.forEach((node: any) => {
            try { if (node.stop) node.stop(); } catch(e) {}
            try { node.disconnect(); } catch(e) {}
          });
          try { existing.gainNode.disconnect(); } catch(e) {}
        }
      });
      activeSourcesRef.current = {};
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch(e) {}
      }
    };
  }, []);

  // Individual toggler
  const handleToggleLayer = (layerId: string) => {
    initAudio();
    setActivePresetId(null); // break preset chain on manual interaction

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const nextActive = !layer.isActive;
        if (nextActive) {
          if (isPlaying) {
            // Start synthesizing immediately
            setTimeout(() => {
              startLayerNode(layerId, layer.volume);
            }, 10);
          } else {
            setIsPlaying(true);
          }
        } else {
          stopLayerNode(layerId);
          // Check if any other layers are active, if not keep playing but silent or pause?
          // We can let the user decide. Pause if all became inactive is cleaner
        }
        return { ...layer, isActive: nextActive };
      }
      return layer;
    }));
  };

  // Adjust volume
  const handleVolumeChange = (layerId: string, val: number) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const updated = { ...layer, volume: val };
        // Sync if active
        if (layer.isActive && isPlaying) {
          syncLayerVolume(layerId, val);
        }
        return updated;
      }
      return layer;
    }));
  };

  // Run Preset triggering (THE ENHANCEMENT TASK)
  const applyPreset = (preset: MixerPreset) => {
    initAudio();
    setActivePresetId(preset.id);
    setIsPlaying(true);

    const nextLayers = layers.map(layer => {
      const presetVolume = preset.layers[layer.id];
      const isPresetActive = presetVolume !== undefined && presetVolume > 0;
      
      if (isPresetActive) {
        // Toggled ON
        setTimeout(() => {
          startLayerNode(layer.id, presetVolume);
        }, 30);
        return {
          ...layer,
          isActive: true,
          volume: presetVolume
        };
      } else {
        // Toggled OFF
        stopLayerNode(layer.id);
        return {
          ...layer,
          isActive: false
        };
      }
    });

    setLayers(nextLayers);
    toast.success(`Activated: ${preset.name} environment`);
  };

  // Quiet all layers
  const handleReset = () => {
    stopAllLayers();
    setLayers(DEFAULT_LAYERS);
    setIsPlaying(false);
    setActivePresetId(null);
    toast.info("Soundscape reset. Silence restored.");
  };

  return (
    <Card className="border-0 bg-zinc-950/40 backdrop-blur-3xl overflow-hidden shadow-2xl relative select-none">
      
      {/* Visual backglow gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0">
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-purple-500 rounded-full blur-[80px]" />
      </div>

      <CardContent className="p-6 md:p-8 space-y-6 relative z-10 text-white">
        
        {/* Header Block */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">Atmosphere Node</h3>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100">Soundscape Cabinet</h2>
            <p className="text-[10px] font-semibold text-neutral-400/90 leading-relaxed uppercase tracking-widest">
              Synthesize ambient layers over your sonic frequencies
            </p>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="rounded-full hover:bg-white/10 h-8 w-8 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Preset Shell */}
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Curated Presets</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const matchesPreset = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`
                    group relative px-4 py-3.5 rounded-xl text-left transition-all duration-300 cursor-pointer overflow-hidden
                    ${matchesPreset 
                      ? 'bg-blue-600 border border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-neutral-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg select-none">{p.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate">
                        {p.name}
                      </p>
                      <p className="text-[8px] opacity-70 truncate text-neutral-400 group-hover:text-neutral-200 transition-colors">
                        {p.description}
                      </p>
                    </div>
                  </div>
                  {matchesPreset && (
                    <div className="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-xl animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Output Control Shelf */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`
                h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 active:scale-95
                ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
              `}
              title={isPlaying ? "Silence Cabinets" : "Wake Atmospheric Synthesizer"}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>
            
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Mixer Status</span>
              <p className="text-xs font-black uppercase tracking-widest">
                {isPlaying ? (
                  <span className="text-green-400 flex items-center gap-1.5 animate-pulse">
                    ● Streaming Resonance
                  </span>
                ) : (
                  <span className="text-neutral-500">○ Cabinet Sleep Mode</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xs justify-end">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-blue-400" />}
            </button>
            
            <div className="w-full flex items-center gap-3">
              <span className="text-[9px] font-black text-neutral-400 tracking-wider">MASTER</span>
              <Slider
                value={[masterVolume]}
                onValueChange={(val) => setMasterVolume(val[0])}
                max={100}
                step={2}
                className="flex-1 cursor-pointer bg-neutral-800"
              />
              <span className="text-[10px] font-mono text-neutral-400 w-8 text-right font-black">
                {masterVolume}%
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-[9px] font-black uppercase tracking-widest hover:text-red-400"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Ambient Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div 
                key={layer.id}
                className={`
                  p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-36
                  ${layer.isActive 
                    ? 'border-blue-500 bg-zinc-900/90 shadow-lg shadow-blue-500/5' 
                    : 'border-zinc-800/80 bg-zinc-900/30'
                  }
                `}
              >
                {/* Glow aura */}
                {layer.isActive && (
                  <div className={`absolute inset-0 pointer-events-none ${layer.bgGlow} filter blur-sm transition-opacity opacity-100`} />
                )}

                {/* Layer toggle action area */}
                <div className="flex justify-between items-start z-10">
                  <div className={`p-2 rounded-xl transition-all ${layer.isActive ? 'bg-blue-600/25' : 'bg-zinc-800/40'}`}>
                    <Icon className={`w-4 h-4 ${layer.isActive ? layer.color : 'text-neutral-400'}`} />
                  </div>
                  
                  <button
                    onClick={() => handleToggleLayer(layer.id)}
                    className={`
                      px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border transition-all cursor-pointer
                      ${layer.isActive 
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                        : 'border-zinc-700 bg-transparent text-neutral-400 hover:text-white hover:border-zinc-500'
                      }
                    `}
                  >
                    {layer.isActive ? 'ACTIVE' : 'TOGGLE'}
                  </button>
                </div>

                {/* Info Text */}
                <div className="z-10 space-y-2 mt-auto">
                  <p className={`text-[11px] font-black tracking-tight ${layer.isActive ? 'text-neutral-100' : 'text-neutral-400'}`}>
                    {layer.name}
                  </p>

                  {/* Individual slider */}
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[layer.volume]}
                      onValueChange={(val) => handleVolumeChange(layer.id, val[0])}
                      max={100}
                      step={5}
                      className={`flex-1 ${layer.isActive ? 'cursor-pointer' : 'opacity-30 pointer-events-none'}`}
                    />
                    <span className="text-[8px] font-bold font-mono text-neutral-400 w-6 text-right">
                      {layer.isActive ? `${layer.volume}%` : 'off'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
};
