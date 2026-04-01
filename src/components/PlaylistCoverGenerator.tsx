import React, { useState } from 'react';
import { Sparkles, LayoutGrid, Loader2, X, Check, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Playlist, Track } from '@/types';
import { GoogleGenAI } from '@google/genai';
import { useAudio } from '@/context/AudioContext';

interface PlaylistCoverGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  tracks: Track[];
}

const PlaylistCoverGenerator: React.FC<PlaylistCoverGeneratorProps> = ({ isOpen, onClose, playlist, tracks }) => {
  const { updatePlaylist, addNotification } = useAudio();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<'ai' | 'collage' | null>(null);

  const generateAI = async () => {
    setIsGenerating(true);
    setGenerationType('ai');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // First, generate a descriptive prompt for the image based on the tracks
      const trackInfo = tracks.slice(0, 10).map(t => `${t.title} by ${t.artist} (${t.genre})`).join(', ');
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a highly descriptive and artistic prompt for an image generation model to create a playlist cover for a playlist titled "${playlist.title}". The playlist contains tracks like: ${trackInfo}. The style should be modern, vibrant, and reflect the mood of the music. Return only the prompt text.`,
      });

      const imagePrompt = promptResponse.text || `Artistic playlist cover for ${playlist.title}, modern music theme, vibrant colors`;

      // Now generate the image using gemini-2.5-flash-image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = '';
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (base64Data) {
        setGeneratedImage(`data:image/png;base64,${base64Data}`);
      } else {
        throw new Error("No image data received");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      addNotification("AI Generation failed. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCollage = async () => {
    setIsGenerating(true);
    setGenerationType('collage');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      const coverUrls = tracks
        .slice(0, 4)
        .map(t => t.coverUrl)
        .filter((url): url is string => !!url);

      if (coverUrls.length === 0) {
        throw new Error("No track covers available to create a collage");
      }

      const images = await Promise.all(
        coverUrls.map(url => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        })
      );

      if (images.length === 1) {
        ctx.drawImage(images[0], 0, 0, 1000, 1000);
      } else if (images.length === 2) {
        ctx.drawImage(images[0], 0, 0, 500, 1000);
        ctx.drawImage(images[1], 500, 0, 500, 1000);
      } else if (images.length === 3) {
        ctx.drawImage(images[0], 0, 0, 500, 500);
        ctx.drawImage(images[1], 500, 0, 500, 500);
        ctx.drawImage(images[2], 0, 500, 1000, 500);
      } else {
        ctx.drawImage(images[0], 0, 0, 500, 500);
        ctx.drawImage(images[1], 500, 0, 500, 500);
        ctx.drawImage(images[2], 0, 500, 500, 500);
        ctx.drawImage(images[3], 500, 500, 500, 500);
      }

      setGeneratedImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error("Collage generation failed:", error);
      addNotification("Collage generation failed. Make sure tracks have covers.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedImage) {
      updatePlaylist(playlist.id, { coverUrl: generatedImage });
      addNotification("Playlist cover updated!", "success");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/50 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-tighter">Generate Cover</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a method to generate a unique cover for your playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {generatedImage ? (
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
              <img src={generatedImage} alt="Generated Cover" className="w-full h-full object-cover" />
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square w-full rounded-xl bg-muted/30 border border-dashed border-border/50 flex flex-col items-center justify-center gap-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Preview will appear here</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4 gap-2 border-blue-500/30 hover:bg-blue-500/10"
              onClick={generateAI}
              disabled={isGenerating}
            >
              <Sparkles className={`h-5 w-5 ${isGenerating && generationType === 'ai' ? 'animate-pulse text-blue-500' : 'text-blue-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Generate</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4 gap-2 border-purple-500/30 hover:bg-purple-500/10"
              onClick={generateCollage}
              disabled={isGenerating || tracks.length === 0}
            >
              <LayoutGrid className={`h-5 w-5 ${isGenerating && generationType === 'collage' ? 'animate-pulse text-purple-500' : 'text-purple-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Collage</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!generatedImage || isGenerating}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest px-8"
          >
            Apply Cover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistCoverGenerator;
