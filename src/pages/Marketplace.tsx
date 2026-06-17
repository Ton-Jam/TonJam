import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import NFTCard from '@/components/NFTCard';
import SkeletonCard from '@/components/SkeletonCard';
import { NFTComparisonModal } from '@/components/NFTComparisonModal';
import { useAudio } from '@/context/AudioContext';
import { TrendingUp, Zap, Bell, Rocket, ArrowRight, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const TABS = ['Trending', 'New Signal', 'Auctions', 'Genesis', 'Limited', 'My Bids', 'My NFTs'];

const Marketplace: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Trending');
    const [comparingNFTs, setComparingNFTs] = useState<NFTItem[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    
    const { allNFTs, isLoading, marketplaceFilters, setMarketplaceFilters } = useAudio();

    const toggleComparingNFT = (nft: NFTItem) => {
        setComparingNFTs(prev => 
            prev.find(item => item.id === nft.id) 
            ? prev.filter(item => item.id !== nft.id)
            : [...prev, nft]
        );
    };

    const filteredNfts = useMemo(() => {
        return allNFTs.filter(nft => {
            if (activeTab === 'Trending') return true;
            if (activeTab === 'Auctions') return nft.listingType === 'auction';
            return true;
        });
    }, [allNFTs, activeTab]);

    return (
        <div className="relative min-h-screen w-full bg-background text-foreground pb-12">
            <NFTComparisonModal 
                nfts={comparingNFTs} 
                isOpen={isComparisonModalOpen} 
                onClose={() => setIsComparisonModalOpen(false)} 
            />

            {comparingNFTs.length > 0 && (
                <div className="fixed bottom-24 right-8 z-50">
                    <Button onClick={() => setIsComparisonModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
                        Compare {comparingNFTs.length} NFTs
                    </Button>
                </div>
            )}
            {/* Header Area */}
            <div className="w-full px-4 md:px-8 lg:px-12 pt-8 pb-6 bg-gradient-to-b from-background to-muted/20 border-b border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Marketplace</h1>
                    <div className="w-full md:w-auto">
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* Filter Area */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 w-full border-b border-border/10">
                <div className="w-full px-4 md:px-8 lg:px-12">
                    <FilterPills
                        selectedGenre={activeTab}
                        onSelect={(v) => v && setActiveTab(v)}
                        categories={TABS}
                    />
                </div>
            </div>

            {/* Recommended Section - Horizontal Scroll */}
            <section className="w-full px-4 md:px-8 lg:px-12 mt-8">
                <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={`loading-${i}`} className="flex-shrink-0 w-[240px] snap-start">
                                <SkeletonCard />
                            </div>
                        ))
                    ) : (
                        allNFTs.slice(0, 8).map((nft) => (
                            <div key={nft.id} className="flex-shrink-0 w-[240px] snap-start">
                                <NFTCard 
                                    nft={nft} 
                                    isSelectedForCompare={!!comparingNFTs.find(item => item.id === nft.id)}
                                    onToggleCompare={toggleComparingNFT}
                                />
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Content Area */}
            <div className="w-full px-4 md:px-8 lg:px-12 mt-8">
                <section>
                    <h2 className="text-xl font-bold mb-4">Browse All</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : filteredNfts.length > 0 ? (
                            filteredNfts.map((nft) => (
                                <NFTCard 
                                    key={nft.id} 
                                    nft={nft} 
                                    isSelectedForCompare={!!comparingNFTs.find(item => item.id === nft.id)}
                                    onToggleCompare={toggleComparingNFT}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                No items found in this section.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Marketplace;
