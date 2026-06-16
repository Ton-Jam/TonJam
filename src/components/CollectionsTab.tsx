import React, { useState, useEffect } from 'react';
import { Plus, Folder, Tag, Package } from 'lucide-react';
import { Collection } from '@/types';

export const CollectionsTab: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('tonjam_collections');
        if (saved) setCollections(JSON.parse(saved));
    }, []);

    const handleCreate = () => {
        const name = prompt("Enter collection name");
        if (!name) return;
        const newCol: Collection = {
            id: `col-${Date.now()}`,
            artistId: 'current-artist-id',
            name: name,
            coverUrl: 'https://image.pollinations.ai/prompt/abstract%20collection%20cover?width=400&height=400&nologo=true',
            nftIds: [],
            createdAt: new Date().toISOString(),
        };
        const updated = [...collections, newCol];
        setCollections(updated);
        localStorage.setItem('tonjam_collections', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider">Your Collections</h3>
                <button onClick={handleCreate} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer">
                    <Plus className="w-3 h-3" /> Create New
                </button>
            </div>
            {collections.length === 0 ? (
                <div className="text-center py-10 bg-white/[0.01] rounded-2xl border border-dashed border-white/[0.05]">
                    <Folder className="w-8 h-8 mx-auto text-zinc-700" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">No collections yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {collections.map(col => (
                        <div key={col.id} className="bg-white/[0.02] p-4 rounded-xl space-y-2 text-white">
                            <img src={col.coverUrl} className="w-full aspect-square rounded-lg object-cover" />
                            <h4 className="text-xs font-black truncate">{col.name}</h4>
                            <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-black">
                                <span className='flex items-center gap-1'><Package className='w-3 h-3'/> {col.nftIds.length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
