import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AnimatedSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onQrScan: () => void;
  isFocused: boolean;
}

const PLACEHOLDERS = [
  'Search songs...',
  'Search artists...',
  'Search NFTs...',
  'Search albums...',
  'Search playlists...',
  'Search users...',
  'Search collections...',
  'Search genres...',
  'Search auctions...'
];

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
  value,
  onChange,
  onClear,
  onFocus,
  onBlur,
  onQrScan,
  isFocused
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (value) return; // Stop rotation if typing
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [value]);

  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported on this browser context.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        toast.info('Listening for your voice signal...');
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onChange(text);
        toast.success(`Recognized: "${text}"`);
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="relative w-full flex items-center bg-[#07102e] rounded-full p-0.5 border border-white/5 shadow-inner">
      <div className="pl-4 text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <div className="flex-1 relative h-10">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full h-full bg-transparent border-none outline-none focus:ring-0 text-white text-xs font-bold uppercase tracking-widest pl-3 pr-10 placeholder-transparent"
          aria-label="Search TonJam"
        />

        <AnimatePresence mode="wait">
          {!value && !isFocused && (
            <motion.div
              key={placeholderIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.5 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold uppercase tracking-widest"
            >
              {PLACEHOLDERS[placeholderIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 pr-2">
        {value && (
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-white/10 active:scale-90 rounded-full transition-all text-slate-400 hover:text-white"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={toggleVoiceSearch}
          className={`p-1.5 hover:bg-white/10 active:scale-90 rounded-full transition-all ${
            isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'
          }`}
          title="Voice Search"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={onQrScan}
          className="p-1.5 hover:bg-white/10 active:scale-90 rounded-full transition-all text-slate-400 hover:text-white"
          title="Scan QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
