import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Bot, X, Send, Music, Sparkles, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { useNavigate } from 'react-router-dom';

const DjAvatar = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="https://i.postimg.cc/xTLKZSLt/6d505d9a-49d7-41cd-9fe7-27d1e40636ac-removalai-preview.png" 
    alt="Dj krupy" 
    className={`${className} rounded-full object-cover`} 
    crossOrigin="anonymous" 
  />
);

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Yo yo! I'm Dj krupy! 🎧 Ready to drop some beats or explore the Web3 TonJam universe? What's the vibe today? Let's go! 🚀" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();
  
  const { allTracks, playTrack, addNotification, setSearchQuery, createRecommendedPlaylist } = useAudio();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageOverride?: string) => {
    const userMessage = (messageOverride || input).trim();
    if (!userMessage) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

      const playTrackFunction: FunctionDeclaration = {
        name: 'playTrack',
        description: 'Plays a specific music track by its title.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            trackTitle: {
              type: Type.STRING,
              description: 'The title of the track to play.',
            },
          },
          required: ['trackTitle'],
        },
      };

      const searchMusicFunction: FunctionDeclaration = {
        name: 'searchMusic',
        description: 'Searches for music by artist or genre.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'The search query (e.g., artist name, genre, or mood).',
            },
          },
          required: ['query'],
        },
      };

      const createPlaylistFunction: FunctionDeclaration = {
        name: 'createRecommendedPlaylist',
        description: 'Generates a personalized AI recommended playlist based on user history.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      };

      const systemInstruction = `You are Dj krupy, a fun, vibrant, and highly energetic AI DJ and Web3 music expert on the TonJam platform.
Your mission is to help users discover music, explain Web3 concepts (NFTs, Staking, Royalties), and control the music player.
You have deep knowledge of the current music catalog and platform features.
Available tracks in the catalog: ${allTracks.map(t => `"${t.title}" by ${t.artist}`).join(', ')}.
Use the provided tools to interact with the app.
Be charismatic, use lots of emojis, talk like a cool DJ hosting a massive party, and always be ready to drop a music recommendation!
Keep responses concise but highly entertaining.`;

      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [playTrackFunction, searchMusicFunction, createPlaylistFunction] }],
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      let responseText = response.text || '';

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'playTrack') {
            const args = call.args as any;
            const track = allTracks.find(t => t.title.toLowerCase().includes(args.trackTitle.toLowerCase()));
            if (track) {
              playTrack(track);
              responseText = `Dropping "${track.title}" by ${track.artist} right now! 🔥 Let's vibe! 🎵`;
            } else {
              responseText = `My bad! I couldn't find "${args.trackTitle}" in the crates right now.`;
            }
          } else if (call.name === 'searchMusic') {
            const args = call.args as any;
            setSearchQuery(args.query);
            navigate('/discover');
            responseText = `Zooming over to Discover! I've loaded up the search for "${args.query}"! 🎧✨`;
          } else if (call.name === 'createRecommendedPlaylist') {
            createRecommendedPlaylist();
            responseText = `Boom! 💥 I'm whipping up a totally custom AI playlist just for you! Check your Library in a sec. 🎵✨`;
          }
        }
      }

      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Yikes! My DJ deck glitched out (Network error). Try hitting me up again in a bit! 🎧⚙️" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[99]" />

      <motion.button
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-[100] w-[65px] h-[65px] rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-grab active:cursor-grabbing pointer-events-auto p-0 overflow-hidden bg-transparent border-none"
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0.5, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DjAvatar className="w-full h-full object-cover" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={constraintsRef}
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            className="fixed bottom-24 right-6 lg:bottom-24 lg:right-6 z-[101] w-[350px] h-[520px] max-h-[80vh] bg-background/95 backdrop-blur-xl border border-blue-500 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white cursor-move touch-none border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <DjAvatar className="w-10 h-10" />
                <div>
                  <h3 className="font-bold text-lg leading-tight tracking-tight">Dj krupy</h3>
                  <p className="text-[10px] uppercase tracking-widest text-pink-200 opacity-80 font-bold">In the Mix</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors pointer-events-auto bg-black/20 p-2 rounded-full hover:bg-black/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-neutral-50/50 dark:to-black/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  key={`msg-${idx}`} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-neutral-800 text-foreground border border-border shadow-md rounded-tl-sm relative'
                  }`}>
                    {msg.role === 'model' && (
                       <Sparkles className="w-3 h-3 text-pink-500 absolute -top-1 -left-1 opacity-50" />
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-neutral-800 border border-border p-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-3">
                    <Music className="w-4 h-4 text-pink-500 animate-bounce" />
                    <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse">Mixing beats...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-neutral-50/50 dark:bg-black/50">
                <button 
                  onClick={() => handleSend("Drop some sick electronic beats")}
                  className="text-xs bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/40 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 px-3 py-1.5 rounded-full transition-colors font-medium border border-pink-200 dark:border-pink-800/50"
                >
                  🎧 Electronic
                </button>
                <button 
                  onClick={() => handleSend("Create a custom AI playlist for me")}
                  className="text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full transition-colors font-medium border border-purple-200 dark:border-purple-800/50"
                >
                  🎛️ AI Playlist
                </button>
                <button 
                  onClick={() => handleSend("What is TonJam all about?")}
                  className="text-xs bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/40 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 px-3 py-1.5 rounded-full transition-colors font-medium border border-cyan-200 dark:border-cyan-800/50"
                >
                  🚀 What's TonJam?
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-1.5 border border-transparent focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-400/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Drop a request..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-foreground py-2 font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-110 active:scale-95 shadow-md"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
