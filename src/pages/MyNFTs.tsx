import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import NFTCard from '@/components/NFTCard';
import EmptyNFTState from '@/components/EmptyNFTState';
import ManageNFTModal from '@/components/ManageNFTModal';
import NFTFolderModal from '@/components/NFTFolderModal';
import CollectionGallery from '@/components/CollectionGallery';
import { Sparkles, Gavel, LayoutGrid, List } from 'lucide-react';
import { NFTItem } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MyNFTs: React.FC = () => {
  const navigate = useNavigate();
  const { userNFTs, userBids } = useAudio();
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'owned' | 'bids' | 'folders'>('owned');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const { nftFolders } = useAudio();

  const handleManage = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setIsManageModalOpen(true);
  };

  const renderEmptyState = (type: 'owned' | 'bids') => (
    <div className="col-span-full py-4">
      <EmptyNFTState
        title={type === 'owned' ? 'No NFTs Found' : 'No Active Bids'}
        description={
          type === 'owned' 
            ? "You haven't acquired any NFT artifacts yet. Explore the marketplace to find unique tracks."
            : "You haven't placed any bids on active auctions yet."
        }
        onReset={() => navigate('/marketplace')}
        actionLabel={type === 'owned' ? 'Browse Marketplace' : 'View Live Auctions'}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <main className="px-5 py-6 sm:px-8 w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-transparent h-auto p-0 gap-2 flex flex-nowrap min-w-max -mx-5 px-5">
              <TabsTrigger 
                value="owned" 
                className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent text-silver border border-silver data-[state=active]:border-transparent hover:bg-white/5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-white shrink-0 cursor-pointer h-auto"
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
                className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent text-silver border border-silver data-[state=active]:border-transparent hover:bg-white/5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-white shrink-0 cursor-pointer h-auto"
              >
                Bids
                {userBids && userBids.length > 0 && (
                  <Badge className="ml-2 h-4 min-w-[16px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[8px]">
                    {userBids.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="folders" 
                className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent text-silver border border-silver data-[state=active]:border-transparent hover:bg-white/5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-white shrink-0 cursor-pointer h-auto"
              >
                Folders
                {nftFolders && nftFolders.length > 0 && (
                  <Badge className="ml-2 h-4 min-w-[16px] px-1 bg-white/20 hover:bg-white/30 text-white border-none text-[8px]">
                    {nftFolders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Tabs value={activeTab} className="mt-0">
          <TabsContent value="owned" className="mt-0 focus-visible:outline-none">
            <CollectionGallery 
              items={userNFTs && userNFTs.length > 0 ? userNFTs : undefined}
              title="My Music NFT Collection"
              subtitle="Hover over any card to trigger hover audio preview or click to stream"
            />
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
          <TabsContent value="folders" className="mt-0 focus-visible:outline-none">
            {selectedFolderId ? (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedFolderId(null)}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors mb-4"
                >
                  ← Back to Folders
                </button>
                <div className="space-y-2">
                  {(() => {
                    const folder = nftFolders.find(f => f.id === selectedFolderId);
                    if (!folder) return null;
                    const folderNfts = userNFTs.filter(n => folder.nftIds.includes(n.id));
                    if (folderNfts.length === 0) {
                      return (
                        <div className="text-center py-10">
                          <p className="text-sm text-muted-foreground mb-4">No NFTs in this folder yet.</p>
                        </div>
                      );
                    }
                    return folderNfts.map((nft) => (
                      <div key={nft.id} className="w-full">
                        <NFTCard nft={nft} variant="row" />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Your Collections</h3>
                  <button 
                    onClick={() => setIsFolderModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-colors"
                  >
                    + New Folder
                  </button>
                </div>
                
                {nftFolders.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                    <LayoutGrid className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium text-white mb-1">No Folders Created</p>
                    <p className="text-xs text-muted-foreground">Organize your NFTs into custom folders.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {nftFolders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <List className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{folder.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{folder.nftIds.length} Items</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
      <NFTFolderModal 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
      />
    </div>
  );
};

export default MyNFTs;
