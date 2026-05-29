import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { indexedDbService } from '@/services/indexedDbService';
import { audioCacheService } from '@/services/audioCacheService';
import { Trash2, HardDrive, Music } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as RechartsPrimitive from 'recharts';

const { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } = RechartsPrimitive as any;

const ResponsiveContainerRC = ResponsiveContainer as any;
const PieChartRC = PieChart as any;
const PieRC = Pie as any;
const CellRC = Cell as any;
const LegendRC = Legend as any;
const TooltipRC = Tooltip as any;

interface StorageManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CachedTrack {
  id: string;
  size: number;
  cachedAt: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

const StorageManagementModal: React.FC<StorageManagementModalProps> = ({ isOpen, onClose }) => {
  const [cachedTracks, setCachedTracks] = useState<CachedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const list = await indexedDbService.getAudioMetadataList();
    setCachedTracks(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    await audioCacheService.removeCachedTrack(id);
    loadData(); // Refresh list
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const audioTotalSize = cachedTracks.reduce((sum, t) => sum + t.size, 0);
  const nftImagesSize = 50 * 1024 * 1024; // Dummy value: 50MB
  const appAssetsSize = 25 * 1024 * 1024; // Dummy value: 25MB

  const data = [
    { name: 'Audio Tracks', value: audioTotalSize / (1024 * 1024) },
    { name: 'NFT Images', value: nftImagesSize / (1024 * 1024) },
    { name: 'App Assets', value: appAssetsSize / (1024 * 1024) },
  ];

  const totalSizeMB = ((audioTotalSize + nftImagesSize + appAssetsSize) / (1024 * 1024)).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 rounded-[4px] p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-500" />
            Storage Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-64 mb-4">
          <ResponsiveContainerRC width="100%" height="100%">
            <PieChartRC>
              <PieRC
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <CellRC key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </PieRC>
              <TooltipRC />
              <LegendRC />
            </PieChartRC>
          </ResponsiveContainerRC>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
          Total Storage Used: {totalSizeMB} MB
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead className="text-[9px] font-black uppercase text-white/50">Track ID (Cached)</TableHead>
                <TableHead className="text-[9px] font-black uppercase text-white/50 text-right">Size</TableHead>
                <TableHead className="text-[9px] font-black uppercase text-white/50">Cached</TableHead>
                <TableHead className="text-[9px] font-black uppercase text-white/50 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cachedTracks.map((track) => (
                <TableRow key={track.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-[10px] text-white flex items-center gap-2">
                    <Music className="h-3 w-3 text-blue-400" />
                    {track.id.substring(0, 12)}...
                  </TableCell>
                  <TableCell className="text-[10px] text-right text-muted-foreground">
                    {(track.size / (1024 * 1024)).toFixed(2)} MB
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">
                    {getRelativeTime(track.cachedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(track.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-full font-black uppercase tracking-widest text-[10px]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StorageManagementModal;
