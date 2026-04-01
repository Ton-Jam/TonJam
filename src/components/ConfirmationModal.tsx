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

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default'
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="w-[95vw] max-w-[400px] rounded-[24px] border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-6">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-400 text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
          <AlertDialogCancel 
            onClick={onClose}
            className="flex-1 bg-transparent border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-[12px] h-11 font-medium transition-all"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              "flex-1 h-11 rounded-[12px] font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg",
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
