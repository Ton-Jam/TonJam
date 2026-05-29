import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Music, Mic2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useAudio } from '@/context/AudioContext';
import { chatWithKrupy, ChatAssistantResponse } from '@/services/geminiService';
import { toast } from 'sonner';

const DJ_KRUPY_AVATAR = 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  isError?: boolean;
}

const AIAssistant: React.FC = () => {
  const { currentTrack, playTrack, searchTracks } = useAudio();
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([
    { role: 'ai', text: "KrupyVibez active. Neural relay synchronized. How can I help you calibrate your sonic identity today?" }
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSend = async (retryText?: string) => {
    const textToSend = retryText || message;
    if (!textToSend.trim() || isLoading) return;
    
    if (!retryText) {
      setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
      setMessage('');
    } else {
      setChatHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'ai' && last.isError) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }

    setIsLoading(true);

    try {
      const response: ChatAssistantResponse = await chatWithKrupy(textToSend, chatHistory.filter(h => !h.isError), currentTrack);
      
      if ('toolCalls' in response && response.toolCalls) {
        // Handle tool calls
        for (const toolCall of response.toolCalls) {
          if (toolCall.name === 'play_song') {
            const mood = toolCall.args.mood_or_keyword;
            const tracks = await searchTracks(mood); // or similar function
            if (tracks && tracks.length > 0) {
              await playTrack(tracks[0]);
              setChatHistory(prev => [...prev, { role: 'ai', text: `Initiating ${mood} protocols. Playing ${tracks[0].title}.` }]);
            } else {
              setChatHistory(prev => [...prev, { role: 'ai', text: `No sonic signals matched ${mood}. Trying default frequency.` }]);
            }
          } else if (toolCall.name === 'get_fun_fact') {
             if (currentTrack) {
               setChatHistory(prev => [...prev, { role: 'ai', text: `Did you know? ${currentTrack.title} is known for its ${currentTrack.mood} vibe!` }]);
             } else {
               setChatHistory(prev => [...prev, { role: 'ai', text: "No track playing to extract facts from. Let's start the vibe!" }]);
             }
          }
        }
      } else if ('text' in response) {
        if (typeof response.text === 'string') {
          setChatHistory(prev => [...prev, { role: 'ai', text: response.text }]);
        } else {
          console.error("RESPONSE TEXT IS NOT A STRING:", response.text);
          setChatHistory(prev => [...prev, { role: 'ai', text: JSON.stringify(response.text) }]);
        }
      }
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      const errorMessage = error?.message?.includes('quota') 
        ? "Neural bandwidth exceeded."
        : "Neural relay failure.";
      
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: errorMessage,
        isError: true
      }]);
      toast.error("Sonic communication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="fixed bottom-32 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[calc(100vw-48px)] sm:w-[380px] h-[60vh] sm:h-[500px] bg-background/80 backdrop-blur-2xl border border-blue-500/20 rounded-[4px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={DJ_KRUPY_AVATAR} alt="DJ Krupy" className="w-10 h-10 rounded-full border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center"
                  >
                    <Sparkles className="w-2 h-2 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter text-neutral-900 dark:text-zinc-100">DJ Krupy</h3>
                  <p className="text-[9px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">Active Vibez</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/10 h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {chatHistory.map((chat, i) => (
                <motion.div
                  initial={{ opacity: 0, x: chat.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] sm:text-xs font-medium leading-relaxed shadow-sm ${
                    chat.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : chat.isError 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 rounded-tl-none'
                        : 'bg-muted/50 text-foreground border border-white/5 rounded-tl-none'
                  }`}>
                    {chat.isError && <AlertCircle className="w-3 h-3 mb-1 inline-block mr-1" />}
                    {chat.text}
                    
                    {chat.isError && (
                      <button 
                        onClick={() => {
                          const lastUserMsg = [...chatHistory].reverse().find(h => h.role === 'user');
                          if (lastUserMsg) {
                            handleSend(lastUserMsg.text);
                          }
                        }}
                        className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-2 py-1 rounded-full w-fit"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        Retry Mission
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted/30 text-muted-foreground p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">DJ Krupy is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-muted/20 border-t border-white/5">
              <div className="flex items-center gap-2 bg-background/50 border border-white/10 rounded-full px-4 py-2 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  placeholder={isLoading ? "Neural syncing..." : "Ask DJ Krupy..."} 
                  className="flex-1 bg-transparent border-none text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/50 focus:outline-none min-w-0 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !message.trim()}
                  className="p-1 text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:text-muted-foreground transition-colors flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          opacity: isOpen ? 1 : 0.7,
          scale: isOpen ? 1.1 : 1
        }}
        className="relative group h-12 w-12 sm:h-16 sm:w-16"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
        />
        
        {/* KrupyVibez Hover Label */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none hidden sm:block">
          <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            KrupyVibez
          </div>
        </div>

        <div className="relative h-full w-full bg-background border border-blue-500/30 rounded-full p-1 sm:p-1.5 shadow-[0_0_30px_rgba(37,99,235,0.2)] overflow-hidden transition-all duration-300 group-hover:border-blue-500">
          <img 
            src={DJ_KRUPY_AVATAR} 
            alt="DJ Krupy" 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        
        {!isOpen && (
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-background shadow-lg"
            >
                <Mic2 className="w-2.5 h-2.5" />
            </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
