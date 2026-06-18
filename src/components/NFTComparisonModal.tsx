import React from 'react';
import { NFTItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface NFTComparisonModalProps {
  nfts: NFTItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const NFTComparisonModal: React.FC<NFTComparisonModalProps> = ({ nfts, isOpen, onClose }) => {
  if (nfts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>NFT Comparison</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="border border-border p-4 rounded-lg">
              <img src={nft.imageUrl} alt={nft.title} className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="font-bold text-lg">{nft.title}</h3>
              <p className="text-sm text-muted-foreground">Price: {nft.price} TON</p>
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Traits</h4>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {(nft.traits || nft.attributes || []).map((trait, index) => (
                    <li key={index}>
                      <span className="font-medium">{trait.trait_type}:</span> {trait.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={onClose} className="mt-6 w-full">Close</Button>
      </DialogContent>
    </Dialog>
  );
};
