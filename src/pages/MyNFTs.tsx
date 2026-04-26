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
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Financial Depot V.1</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
            Digital <br /> Asset Vault
          </h1>
          
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/30 p-1 h-12 rounded-xl border border-white/5">
              <TabsTrigger 
                value="owned" 
                className="rounded-lg px-6 font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full transition-all"
              >
                Collection
                {userNFTs && userNFTs.length > 0 && (
                  <Badge className="ml-2 h-5 min-w-[20px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[9px]">
                    {userNFTs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="bids" 
                className="rounded-lg px-6 font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-purple-600 data-[state=active]:text-white h-full transition-all"
              >
                My Bids
                {userBids && userBids.length > 0 && (
                  <Badge className="ml-2 h-5 min-w-[20px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[9px]">
                    {userBids.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <Tabs value={activeTab} className="mt-0">
        <TabsContent value="owned" className="mt-0 focus-visible:outline-none">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userNFTs && userNFTs.length > 0 ? (
              userNFTs.map((nft) => (
                <NFTCard 
                  key={nft.id} 
                  nft={nft} 
                  // onAction={() => handleManage(nft)}
                />
              ))
            ) : renderEmptyState('owned')}
          </section>
        </TabsContent>
        
        <TabsContent value="bids" className="mt-0 focus-visible:outline-none">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userBids && userBids.length > 0 ? (
              userBids.map((nft) => (
                <NFTCard 
                  key={nft.id} 
                  nft={nft}
                />
              ))
            ) : renderEmptyState('bids')}
          </section>
        </TabsContent>
      </Tabs>

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
