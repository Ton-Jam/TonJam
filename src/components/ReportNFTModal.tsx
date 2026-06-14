import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ShieldAlert, Loader2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { NFTItem } from "@/types";

interface ReportNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
  userAddress: string;
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "copyright", label: "Copyright Violation" },
  { value: "spam", label: "Spam / Low Quality" },
  { value: "scam", label: "Potential Scam / Fraud" },
  { value: "other", label: "Other" },
];

const ReportNFTModal: React.FC<ReportNFTModalProps> = ({
  isOpen,
  onClose,
  nft,
  userAddress,
}) => {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const reportData = {
        id: reportId,
        nftId: nft.id,
        reporterId: userAddress,
        reason: reason,
        details: details,
        status: "pending",
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
      };

      await setDoc(doc(db, "reports", reportId), reportData);
      
      toast.success("Artifact reported. Our moderation protocols will review the signal.");
      onClose();
      // Reset state
      setReason("");
      setDetails("");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "reports");
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-neutral-900 border border-white/5 text-white rounded-[4px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Moderation Protocol</span>
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Report Artifact</DialogTitle>
          <DialogDescription className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">
            Flag inappropriate content for neural verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Primary Violation Reason</label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger className="w-full bg-white/[0.03] border-white/10 text-white rounded-[4px] h-12 uppercase text-[10px] tracking-widest font-bold">
                <SelectValue placeholder="SELECT REASON" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white uppercase text-[10px] tracking-widest font-bold">
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="focus:bg-white/10 focus:text-white">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Additional Signal Context (Optional)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more information about the violation..."
              className="min-h-[100px] bg-white/[0.03] border-white/10 text-white rounded-[4px] placeholder:text-zinc-600 focus:border-rose-500/50 transition-colors"
            />
          </div>

          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-[4px] flex items-start gap-3">
             <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
             <p className="text-[9px] text-rose-500/80 font-bold leading-relaxed uppercase tracking-widest">
               Reporting an artifact will flag it for our moderation team. Misuse of the reporting system may lead to protocol restrictions.
             </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !reason}
            onClick={handleSubmit}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportNFTModal;
