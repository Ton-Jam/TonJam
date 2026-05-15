import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import NFTCard from '@/components/NFTCard';
import ManageNFTModal from '@/components/ManageNFTModal';
import { Sparkles, Gavel, LayoutGrid, List } from 'lucide-react';
import { NFTItem } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MyNFTs: React.FC = () => {
  const { userNFTs, userBids } = useAudio();
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'owned' | 'bids'>('owned');

  const handleManage = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setIsManageModalOpen(true);
  };

  const renderEmptyState = (type: 'owned' | 'bids') => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center glass border border-border/20 rounded-2xl bg-white/[0.02]">
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
        {type === 'owned' ? <Sparkles className="h-8 w-8 text-muted-foreground/50" /> : <Gavel className="h-8 w-8 text-muted-foreground/50" />}
      </div>
      <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter">
        {type === 'owned' ? 'No NFTs Found' : 'No Active Bids'}
      </h3>
      <p className="text-muted-foreground/80 text-sm mt-2 max-w-sm">
        {type === 'owned' 
          ? "You haven't acquired any NFT artifacts yet. Explore the marketplace to find unique tracks."
          : "You haven't placed any bids on active auctions yet."}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <main className="px-5 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-transparent h-auto p-0 gap-2 flex flex-nowrap min-w-max">
              <TabsTrigger 
                value="owned" 
                className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] data-[state=inactive]:text-muted-foreground/60 data-[state=inactive]:bg-white/5 border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 hover:data-[state=inactive]:bg-white/10 shrink-0"
              >
                Collection
                {userNFTs && userNFTs.length > 0 && (
                  <Badge className="ml-2 h-4 min-w-[16px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[8px]">
                    {userNFTs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="bids" 
                className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] data-[state=inactive]:text-muted-foreground/60 data-[state=inactive]:bg-white/5 border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 hover:data-[state=inactive]:bg-white/10 shrink-0"
              >
                Bids
                {userBids && userBids.length > 0 && (
                  <Badge className="ml-2 h-4 min-w-[16px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[8px]">
                    {userBids.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Tabs value={activeTab} className="mt-0">
          <TabsContent value="owned" className="mt-0 focus-visible:outline-none">
            <div className="space-y-2">
              {userNFTs && userNFTs.length > 0 ? (
                userNFTs.map((nft) => (
                  <div key={nft.id} className="w-full">
                    <NFTCard nft={nft} variant="row" />
                  </div>
                ))
              ) : renderEmptyState('owned')}
            </div>
          </TabsContent>
          
          <TabsContent value="bids" className="mt-0 focus-visible:outline-none">
            <div className="space-y-2">
              {userBids && userBids.length > 0 ? (
                userBids.map((nft) => (
                  <div key={nft.id} className="w-full">
                    <NFTCard nft={nft} variant="row" />
                  </div>
                ))
              ) : renderEmptyState('bids')}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {selectedNFT && (
        <ManageNFTModal 
          nft={selectedNFT} 
          isOpen={isManageModalOpen} 
          onClose={() => setIsManageModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default MyNFTs;
