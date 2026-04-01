import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GetFreeTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GetFreeTokensModal: React.FC<GetFreeTokensModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Get Free TJ Tokens</DialogTitle>
          <DialogDescription>
            Here is how you can obtain free TJ tokens to start your journey on TonJam:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Connect your TON wallet to the platform.</li>
            <li>Complete your profile setup.</li>
            <li>Participate in daily community challenges.</li>
            <li>Refer friends to join TonJam.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Keep an eye on our social channels for special airdrop events!
          </p>
        </div>
        <Button onClick={onClose} className="w-full">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default GetFreeTokensModal;
