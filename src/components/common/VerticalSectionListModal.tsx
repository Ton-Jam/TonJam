import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface VerticalSectionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

export const VerticalSectionListModal: React.FC<VerticalSectionListModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  renderItem,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, y: 300, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 300, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full sm:max-w-5xl max-h-[85vh] sm:max-h-[82vh] bg-[var(--tj-color-surface-default,#0B1424)] text-white rounded-t-3xl sm:rounded-[var(--tj-radius-lg,12px)] flex flex-col overflow-hidden shadow-2xl border border-[var(--tj-color-border-subtle,rgba(192,192,192,0.15))] pb-safe"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--tj-color-border-subtle,rgba(192,192,192,0.15))] bg-[var(--tj-color-bg-secondary,#07111F)]">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-0"
              aria-label="Close vertical list"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Grid / List Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
            {items.length === 0 ? (
              <div className="py-20 text-center text-[var(--tj-color-text-secondary,#A8B7CC)] text-xs">
                No items available in this section.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
                {items.map((item, idx) => (
                  <div key={item.id || item.uid || item.songId || idx} className="w-full flex justify-center">
                    {renderItem(item, idx)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VerticalSectionListModal;
