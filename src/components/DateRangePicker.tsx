import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Clock, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export type DateRangePreset = '24h' | '7d' | '30d' | '90d' | 'ytd' | 'all' | 'custom';

export interface DateRangeState {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

interface DateRangePickerProps {
  value: DateRangeState;
  onChange: (newValue: DateRangeState) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(value.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(value.endDate || '');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Default date helpers
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    setTempStartDate(value.startDate || '');
    setTempEndDate(value.endDate || '');
  }, [value.startDate, value.endDate]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const presets: { id: DateRangePreset; label: string; subtext: string }[] = [
    { id: '24h', label: '24 Hours', subtext: 'Real-time hourly tick' },
    { id: '7d', label: 'Last 7 Days', subtext: 'Past week activity' },
    { id: '30d', label: 'Last 30 Days', subtext: 'Monthly performance' },
    { id: '90d', label: 'Last 90 Days', subtext: 'Quarterly review' },
    { id: 'ytd', label: 'Year To Date', subtext: 'Since Jan 1, 2026' },
    { id: 'all', label: 'All Time', subtext: 'Full lifetime stats' },
    { id: 'custom', label: 'Custom Range', subtext: 'Pick exact dates' },
  ];

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      const start = tempStartDate || sevenDaysAgo;
      const end = tempEndDate || today;
      setTempStartDate(start);
      setTempEndDate(end);
      onChange({
        preset: 'custom',
        startDate: start,
        endDate: end,
      });
    } else {
      onChange({
        preset,
        startDate: undefined,
        endDate: undefined,
      });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (!tempStartDate || !tempEndDate) return;
    onChange({
      preset: 'custom',
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    setIsOpen(false);
  };

  // Get formatted human-readable display string
  const getDisplayLabel = () => {
    if (value.preset === 'custom' && value.startDate && value.endDate) {
      return `${value.startDate} to ${value.endDate}`;
    }
    const match = presets.find((p) => p.id === value.preset);
    return match ? match.label : 'Select Date Range';
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 text-white rounded-2xl transition-all cursor-pointer border-none outline-none text-xs font-bold shadow-md hover:shadow-blue-500/10"
      >
        <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
        <span className="font-mono text-[11px] uppercase tracking-wider">{getDisplayLabel()}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-[#0D1527] rounded-3xl p-4 shadow-2xl z-50 text-white border-none outline-none"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0052FF]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Date Filter</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors border-none outline-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {presets.map((p) => {
                const isSelected = value.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={cn(
                      "p-2 rounded-xl text-left transition-all border-none outline-none cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "bg-[#0052FF] text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 hover:bg-white/10 text-zinc-300"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black uppercase tracking-wide">{p.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className={cn("text-[9px] font-medium mt-0.5 truncate", isSelected ? "text-blue-100" : "text-zinc-400")}>
                      {p.subtext}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Range Input Form if 'custom' is active */}
            {value.preset === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-3 border-t border-white/10 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      max={tempEndDate || today}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full bg-white/5 border-none outline-none p-2 rounded-xl text-[11px] font-mono text-white focus:bg-white/10 transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      min={tempStartDate}
                      max={today}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full bg-white/5 border-none outline-none p-2 rounded-xl text-[11px] font-mono text-white focus:bg-white/10 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full py-2 bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none outline-none shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Custom Filter
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;
