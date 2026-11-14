import React from 'react';
import { Folder, Package } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';

export const CollectionsTab: React.FC = () => {
    const { collections, userProfile } = useAudio();
    const navigate = useNavigate();

    const userCollections = collections.filter(
      (c) => !userProfile?.uid || c.artistId === userProfile.uid
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider">Your Collections</h3>
            </div>
            {userCollections.length === 0 ? (
                <div className="text-center py-10 bg-white/[0.01] rounded-2xl">
                    <Folder className="w-8 h-8 mx-auto text-zinc-700" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">No collections yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {userCollections.map(col => (
                        <div
                            key={col.id}
                            onClick={() => navigate(`/collection/${col.id}`)}
                            className="bg-white/[0.02] p-4 rounded-xl space-y-2 text-white cursor-pointer hover:bg-white/[0.05] transition-colors"
                        >
                            {col.coverUrl && (
                                <img src={col.coverUrl} alt={col.name} className="w-full aspect-square rounded-lg object-cover" />
                            )}
                            <h4 className="text-xs font-black truncate">{col.name}</h4>
                            <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-black">
                                <span className='flex items-center gap-1'><Package className='w-3 h-3'/> {col.nftIds?.length || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
