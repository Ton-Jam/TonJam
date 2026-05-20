import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Sparkles, Music, Mic2, Loader2, RefreshCw, 
  AlertCircle, ChevronLeft, Disc, Library, Radio,
  Share2, Zap, FileText, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAudio } from '@/context/AudioContext';
import { chatWithKrupy, ChatAssistantResponse } from '@/services/geminiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import { DJ_KRUPY_AVATAR } from '@/constants';

// Moved to constants.ts

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  isError?: boolean;
  type?: 'text' | 'lyrics' | 'trivia';
  metadata?: any;
}

const DJKrupy: React.FC = () => {
  const navigate = useNavigate();
  const { currentTrack } = useAudio();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', text: "KrupyVibez active. Neural relay synchronized. How can I help you calibrate your sonic identity today?" }
  ]);
  const [showLyrics, setShowLyrics] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || message;
    if (!textToSend.trim() || isLoading) return;

    if (!customMessage) {
      setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
      setMessage('');
    }

    setIsLoading(true);

    try {
      const response: ChatAssistantResponse = await chatWithKrupy(textToSend, chatHistory.filter(h => !h.isError), currentTrack);
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "No response received." }]);
    } catch (error: any) {
      console.error("DJ Krupy Error:", error);
      const errorMessage = error?.message?.includes('quota') 
        ? "Neural bandwidth exceeded. The algorithm needs a breather. Re-calibration recommended soon."
        : "Neural relay failure. Signal loss detected. Toggle the frequency and try again!";
      
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: errorMessage,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriviaRequest = () => {
    if (!currentTrack) {
        toast.error("Play a track first to fetch neural trivia!");
        return;
    }
    const triviaPrompt = `Tell me some interesting trivia or fun facts about the current track "${currentTrack.title}" by ${currentTrack.artist}. Use its genre (${currentTrack.genre}), mood, and metadata to generate unique insights.`;
    handleSend(triviaPrompt);
  };

  const handleLyricsRequest = () => {
    if (!currentTrack) {
        toast.error("No sonic stream detected. Play a track to view lyrics.");
        return;
    }
    if (!currentTrack.lyrics) {
        setChatHistory(prev => [...prev, { role: 'ai', text: `Neural scan complete. No lyric metadata found for "${currentTrack.title}". It might be a pure instrumental frequency!` }]);
        return;
    }
    
    setChatHistory(prev => [...prev, { role: 'ai', text: `Analyzing lyrical patterns for "${currentTrack.title}"...`, type: 'lyrics', metadata: { lyrics: currentTrack.lyrics } }]);
    setShowLyrics(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-deep-ocean-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Improved DJ Krupy Header */}
      <header className="px-6 h-16 border-b border-blue-500/20 flex items-center justify-between bg-background/80 backdrop-blur-2xl z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted/50 h-10 w-10">
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity animate-pulse" />
              <Avatar className="h-10 w-10 border-2 border-blue-500/50 relative z-10 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={DJ_KRUPY_AVATAR} className="rounded-full" />
                <AvatarFallback className="bg-blue-900 rounded-full font-black text-blue-400">DK</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background z-20 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground m-0">DJ Krupy AI</h2>
                <div className="px-1.5 py-0.5 rounded-[2px] bg-blue-500/20 border border-blue-500/30">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-400">Ver. 3.4.1</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Neural Link: Optimal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 mr-4">
              <div className="text-right">
                <p className="text-[8px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">Sync Port</p>
                <p className="text-[10px] font-mono text-blue-500/70 font-bold tracking-tighter">NODE_7749_KRUPY</p>
              </div>
              <div className="w-[1px] h-8 bg-border/40" />
            </div>
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleTriviaRequest}
                className="hidden sm:flex h-9 items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-400 transition-all active:scale-95 rounded-[4px]"
            >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Fetch Trivia
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLyricsRequest}
                className="hidden sm:flex h-9 items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-400 transition-all active:scale-95 rounded-[4px]"
            >
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                Read Lyrics
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-border/40 hidden sm:block" />
            
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 h-10 w-10 text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-4.5 w-4.5" />
            </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-0">
        {/* Chat Feed */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 scrollbar-thin scrollbar-thumb-muted-foreground/10 scroll-smooth">
            {chatHistory.map((chat, i) => (
              <motion.div
                initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                key={i}
                className={cn(
                  "flex flex-col max-w-[90%] sm:max-w-[75%]",
                  chat.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "relative px-5 py-4 rounded-[12px] text-sm leading-relaxed shadow-none transition-all duration-300",
                  chat.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none font-medium" 
                    : chat.isError 
                      ? "bg-red-500/15 text-red-500 border border-red-500/20 rounded-tl-none font-bold"
                      : "bg-blue-600 text-white border border-blue-500/30 rounded-tl-none font-medium shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                )}>
                  {chat.role === 'ai' && !chat.isError && (
                    <div className="absolute -top-3 -left-3 p-1.5 bg-blue-500 rounded-full shadow-lg">
                      <Sparkles className="h-3 w-3 text-white animate-spin-slow" />
                    </div>
                  )}

                  {chat.isError && <AlertCircle className="w-4 h-4 mb-2 text-red-500" />}
                  
                  <div className="markdown-body prose prose-sm max-w-none text-white prose-invert [&_strong]:text-white [&_p]:text-white/95 [&_li]:text-white/95 [&_a]:text-cyan-200">
                    <Markdown>{chat.text}</Markdown>
                  </div>

                   {chat.type === 'lyrics' && chat.metadata?.lyrics && (
                    <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 shadow-inner group/lyrics">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-cyan-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Lyric Relay Synchronized</span>
                            </div>
                            <button onClick={() => setShowLyrics(true)} className="text-[9px] font-bold text-cyan-200 hover:text-cyan-100 underline transition-colors">Expand Node</button>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed italic line-clamp-4 font-serif">
                            {chat.metadata.lyrics}
                        </p>
                    </div>
                  )}

                  {chat.isError && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSend(chatHistory[chatHistory.length - 2]?.text)}
                      className="mt-4 h-8 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20"
                    >
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Retry Mission
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    {chat.role === 'user' ? 'Local_ID' : 'DJ_Krupy_Relay'}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[9px] font-bold text-muted-foreground/30 tracking-tighter">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start max-w-[75%]"
              >
                <div className="bg-muted/30 backdrop-blur-sm text-muted-foreground px-6 py-4 rounded-[12px] rounded-tl-none flex items-center gap-4 border border-border/40 shadow-none group">
                  <div className="relative">
                    <LoadingSpinner size={20} />
                    <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 block animate-pulse">Neural_Syncing...</span>
                    <div className="flex gap-1">
                       <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }} className="h-1 w-1 rounded-full bg-blue-500" />
                       <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="h-1 w-1 rounded-full bg-blue-500" />
                       <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="h-1 w-1 rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Actions (Mobile Hover) */}
          <div className="px-6 py-2 flex items-center gap-2 sm:hidden overflow-x-auto no-scrollbar shrink-0 border-t border-border/30 bg-background/30">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleTriviaRequest}
                className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-border/40 bg-muted/20 hover:bg-muted/40 rounded-full px-4 h-7"
            >
                <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                Trivia
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLyricsRequest}
                className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-border/40 bg-muted/20 hover:bg-muted/40 rounded-full px-4 h-7"
            >
                <FileText className="h-3 w-3 text-blue-400" />
                Lyrics
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSend("Suggest some tracks similar to the current one.")}
                className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-border/40 bg-muted/20 hover:bg-muted/40 rounded-full px-4 h-7"
            >
                <Zap className="h-3 w-3 text-purple-400" />
                Smart Recs
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/50 border-t border-border/40 shrink-0 bottom-0 relative">
            <div className="max-w-2xl mx-auto flex items-center gap-2 bg-muted/20 border border-border/40 rounded-full px-4 py-2 focus-within:border-blue-500/50 shadow-none transition-all">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                placeholder={isLoading ? "Neural syncing..." : "Channel your vibe..."} 
                className="flex-1 bg-transparent border-none text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 focus:outline-none min-w-0 disabled:opacity-50 text-foreground"
              />
              <button 
                onClick={() => handleSend()} 
                disabled={isLoading || !message.trim()}
                className="h-8 w-8 flex items-center justify-center bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:bg-muted/50 transition-all active:scale-95 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Contextual Info) */}
        <aside className="hidden lg:flex w-80 shrink-0 border-l border-border/40 flex-col bg-background/30 z-10">
            <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
                {/* Current Context */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Context</h3>
                    {currentTrack ? (
                        <div className="p-4 bg-muted/20 border border-border/40 rounded-lg space-y-4">
                            <div className="aspect-square rounded-md overflow-hidden shadow-none border border-border/40">
                                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-foreground uppercase truncate">{currentTrack.title}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{currentTrack.artist}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase rounded-sm border border-blue-500/20">{currentTrack.genre}</span>
                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase rounded-sm border border-purple-500/20">{currentTrack.isNFT ? 'NFT' : 'TRACK'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 border border-dashed border-border/40 rounded-lg text-center">
                            <Disc className="h-8 w-8 text-muted-foreground/30 mx-auto mb-4 animate-spin-slow" />
                            <p className="text-[9px] font-black text-muted-foreground/45 uppercase tracking-widest">No Active Frequencies</p>
                        </div>
                    )}
                </section>

                {/* Quick Commands */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sonic Directives</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: 'Sonic Profile', prompt: 'Tell me about my unique sonic profile on TonJam.' },
                            { label: 'Weekly Trends', prompt: 'What music trends are active on the neural relay this week?' },
                            { label: 'Ecosystem Alpha', prompt: 'Give me ecosystem alpha on the latest music NFTs.' },
                            { label: 'Curate Mix', prompt: 'Curate a futuristic cyberpunk playlist for me.' }
                        ].map(cmd => (
                            <button 
                                key={cmd.label}
                                onClick={() => handleSend(cmd.prompt)}
                                className="w-full p-3 bg-muted/20 hover:bg-muted/40 rounded-lg text-left border border-border/40 transition-all group cursor-pointer"
                            >
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-blue-500 transition-colors">{cmd.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed pt-8 border-t border-border/40">
                    Model: DJ KRUPY NEURAL TRANSMITTER v3.1<br/>
                    Status: SYNCHRONIZED<br/>
                    © 2026 TONJAM AI PROTOCOLS
                </p>
            </div>
        </aside>
      </div>

      {/* Lyrics Full Page Overlay (Optional but handy) */}
      <AnimatePresence>
        {showLyrics && currentTrack?.lyrics && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col"
            >
                <header className="px-6 py-8 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-16 w-16 border-2 border-blue-500 shadow-2xl">
                            <AvatarImage src={currentTrack.coverUrl} />
                        </Avatar>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{currentTrack.title}</h2>
                            <p className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mt-2">{currentTrack.artist}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowLyrics(false)} className="rounded-full h-12 w-12 hover:bg-white/5">
                        <X className="h-8 w-8" />
                    </Button>
                </header>
                <div className="flex-1 overflow-y-auto px-6 md:px-24 py-16 scrollbar-none">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {currentTrack.lyrics.split('\n').map((line, idx) => (
                            <p key={idx} className={cn(
                                "text-2xl md:text-5xl font-black uppercase tracking-tight transition-all duration-700 leading-[1.3]",
                                line.trim() ? "text-white/40 hover:text-white cursor-pointer" : "h-12"
                            )}>
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
                <footer className="p-8 border-t border-white/5 text-center shrink-0">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Transcribed via Lyric Relay Protocol</p>
                </footer>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DJKrupy;
