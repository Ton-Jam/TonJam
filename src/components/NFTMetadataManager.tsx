import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Tag, 
  FileText, 
  Coins, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Disc,
  Sparkles
} from 'lucide-react';
import { Track } from '@/types';

interface NFTMetadataManagerProps {
  artistTracks: Track[];
  onSave: (trackId: string, metadata: any) => void;
}

const NFTMetadataManager: React.FC<NFTMetadataManagerProps> = ({ artistTracks, onSave }) => {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleEdit = (track: Track) => {
    setEditingTrackId(track.id);
    setMetadata(prev => ({
      ...prev,
      [track.id]: {
        title: track.title,
        genre: track.genre,
        description: '', // Default empty
        price: track.price || '1.0',
        isNFT: track.isNFT || false
      }
    }));
  };

  const handleChange = (trackId: string, field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [field]: value
      }
    }));
  };

  const handleSave = async (trackId: string) => {
    setIsSaving(trackId);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(trackId, metadata[trackId]);
    setIsSaving(null);
    setEditingTrackId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-purple-600/20 rounded-[10px] flex items-center justify-center">
          <Disc className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Forge Metadata Manager</h3>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Configure tracks for NFT minting protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {artistTracks.map((track) => {
          const isEditing = editingTrackId === track.id;
          const currentMetadata = metadata[track.id] || {
            title: track.title,
            genre: track.genre,
            description: '',
            price: track.price || '1.0',
            isNFT: track.isNFT || false
          };

          return (
            <motion.div 
              key={track.id}
              layout
              className={`glass border transition-all duration-300 rounded-[12px] overflow-hidden ${
                isEditing ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={track.coverUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg" alt="" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight">{track.title}</h4>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{track.genre} • {track.isNFT ? 'NFT Protocol Active' : 'Standard Stream'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isEditing ? (
                      <button 
                        onClick={() => handleEdit(track)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                      >
                        Configure Metadata
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingTrackId(null)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSave(track.id)}
                          disabled={isSaving === track.id}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                        >
                          {isSaving === track.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                              <Music className="w-3 h-3" /> Track Title
                            </label>
                            <input 
                              type="text"
                              value={currentMetadata.title}
                              onChange={(e) => handleChange(track.id, 'title', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                              <Tag className="w-3 h-3" /> Genre
                            </label>
                            <select 
                              value={currentMetadata.genre}
                              onChange={(e) => handleChange(track.id, 'genre', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all appearance-none"
                            >
                              {['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi'].map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                              <Coins className="w-3 h-3" /> NFT Price (TON)
                            </label>
                            <input 
                              type="number"
                              step="0.1"
                              value={currentMetadata.price}
                              onChange={(e) => handleChange(track.id, 'price', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                              <FileText className="w-3 h-3" /> NFT Description
                            </label>
                            <textarea 
                              value={currentMetadata.description}
                              onChange={(e) => handleChange(track.id, 'description', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all min-h-[100px] resize-none"
                              placeholder="Describe the unique qualities of this NFT asset..."
                            />
                          </div>

                          <div className="p-4 bg-purple-600/5 border border-purple-500/20 rounded-[10px] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <h5 className="text-[10px] font-bold text-white uppercase tracking-tight">NFT Protocol</h5>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Enable for Forge Minting</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleChange(track.id, 'isNFT', !currentMetadata.isNFT)}
                              className="text-purple-500 hover:text-purple-400 transition-colors"
                            >
                              {currentMetadata.isNFT ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 opacity-40" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NFTMetadataManager;
