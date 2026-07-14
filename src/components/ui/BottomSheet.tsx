import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[1300]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-surface rounded-t-sheet border-t border-border-subtle z-[1400] max-h-[85vh] overflow-y-auto flex flex-col pb-safe shadow-2xl",
              className
            )}
          >
            {/* Handle bar */}
            <div className="w-full flex justify-center py-3 shrink-0">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 pb-4 shrink-0">
                {title ? (
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="rounded-full hover:bg-white/10"
                >
                  <X className="size-4 text-text-secondary" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-8 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
