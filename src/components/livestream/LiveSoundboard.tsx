import React from 'react';
import { Volume2, Sparkles, Flame, Radio, Music, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface LiveSoundboardProps {
  canTrigger: boolean;
  onTriggerSound?: (soundName: string) => void;
}

export const LiveSoundboard: React.FC<LiveSoundboardProps> = ({
  canTrigger,
  onTriggerSound
}) => {

  // Synthesize rich Web Audio effects directly in the browser
  const playSynthesizedSound = (type: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'airhorn') {
        const now = ctx.currentTime;
        const freqs = [466.16, 466.16, 466.16, 622.25];
        const times = [0, 0.12, 0.24, 0.36];
        const durs = [0.08, 0.08, 0.08, 0.3];

        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + times[i]);
          gain.gain.setValueAtTime(0.3, now + times[i]);
          gain.gain.exponentialRampToValueAtTime(0.01, now + times[i] + durs[i]);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + durs[i]);
        });
        toast.success('📢 Airhorn triggered on stream!');
      } else if (type === 'applause') {
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        toast.success('👏 Crowd applause sent!');
      } else if (type === 'bassdrop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        toast.success('💣 808 Sub Drop detonated!');
      } else if (type === 'scratch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        toast.success('💿 Vinyl scratch executed!');
      } else if (type === 'cheer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
        toast.success('✨ VIP Sonic Chime emitted!');
      }

      onTriggerSound?.(type);
    } catch (err) {
      console.warn('[LiveSoundboard] Audio synthesis error:', err);
    }
  };

  const soundButtons = [
    { id: 'airhorn', label: 'Airhorn', icon: '📢', color: 'from-amber-500/20 to-orange-500/20 text-amber-300' },
    { id: 'applause', label: 'Applause', icon: '👏', color: 'from-blue-500/20 to-cyan-500/20 text-blue-300' },
    { id: 'bassdrop', label: '808 Drop', icon: '💣', color: 'from-rose-500/20 to-red-500/20 text-rose-300' },
    { id: 'scratch', label: 'Scratch', icon: '💿', color: 'from-purple-500/20 to-violet-500/20 text-purple-300' },
    { id: 'cheer', label: 'VIP Chime', icon: '✨', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300' },
  ];

  return (
    <div className="bg-white/[0.03] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-[#00B4D8]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Live Soundboard</span>
        </div>
        {!canTrigger ? (
          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            👑 VIP NFT Perk
          </span>
        ) : (
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ⚡ Ready
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {soundButtons.map((btn) => (
          <button
            key={btn.id}
            disabled={!canTrigger}
            onClick={() => playSynthesizedSound(btn.id)}
            className={`py-2 px-1 rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-b ${btn.color} hover:scale-105 active:scale-95`}
            title={canTrigger ? `Play ${btn.label}` : 'Hold an NFT or host to unlock'}
          >
            <span className="text-base leading-none">{btn.icon}</span>
            <span className="text-[9px] font-bold truncate max-w-full">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
