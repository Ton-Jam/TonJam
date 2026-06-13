import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timer, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  unbondingPeriod?: string;
  penalty?: string;
  assetName?: string;
  assetImage?: string;
  tonAmount?: string;
  networkFee?: string;
  totalAmount?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  unbondingPeriod,
  penalty,
  assetName,
  assetImage,
  tonAmount,
  networkFee,
  totalAmount,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="w-[95vw] max-w-[400px] rounded-[4px] bg-neutral-900/95 backdrop-blur-xl p-6">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-400 text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {tonAmount && (
          <div className="mt-4 p-4 bg-white/[0.02] rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              {assetImage && (
                <img
                  src={assetImage}
                  alt={assetName}
                  className="w-12 h-12 rounded-lg object-cover bg-neutral-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">Sonic Artifact</span>
                <h4 className="text-xs font-bold text-white truncate">{assetName || "Unspecified Asset"}</h4>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium font-sans">Transaction cost</span>
                <span className="font-mono text-white font-extrabold">{tonAmount} TON</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium font-sans">Network Fee</span>
                <span className="font-mono text-neutral-400 font-bold">{networkFee || "0.05"} TON</span>
              </div>

              {totalAmount && (
                <div className="flex justify-between items-center pt-2.5 bg-white/[0.01]">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">Estimated total</span>
                  <span className="font-mono text-blue-400 font-black text-sm">{totalAmount} TON</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(unbondingPeriod || penalty) && (
          <div className="mt-4 p-3 bg-white/[0.03] rounded-xl space-y-2.5">
            {unbondingPeriod && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="w-3.5 h-3.5 text-orange-400" />
                  <span>Unbonding Period</span>
                </div>
                <span className="font-bold text-orange-400">{unbondingPeriod}</span>
              </div>
            )}
            {penalty && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Potential Penalty</span>
                </div>
                <span className="font-bold text-rose-400">{penalty}</span>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
          <AlertDialogCancel 
            onClick={onClose}
            className="flex-1 bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-[4px] h-11 font-medium transition-all"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              "flex-1 h-11 rounded-[4px] font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg",
              variant === 'destructive' 
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" 
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
