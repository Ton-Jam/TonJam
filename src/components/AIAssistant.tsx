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
            className="fixed bottom-24 right-6 lg:bottom-24 lg:right-6 z-[101] w-[350px] h-[520px] max-h-[80vh] bg-white border border-blue-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-white p-4 flex items-center justify-between border-b border-neutral-100 cursor-move touch-none relative z-10"
            >
              <div className="flex items-center gap-3">
                <DjAvatar className="w-10 h-10 border-2 border-blue-500 shadow-md" />
                <div>
                  <h3 className="font-bold text-lg leading-tight tracking-tight text-zinc-900">Dj krupy</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-widest text-blue-500 font-black">Online / Mixing</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-rose-500 transition-colors pointer-events-auto bg-neutral-50 p-2 rounded-full hover:bg-rose-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
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
                      ? 'bg-blue-600 text-white rounded-tr-[2px]' 
                      : 'bg-white text-zinc-800 border border-neutral-100 shadow-md rounded-tl-[2px] relative'
                  }`}>
                    {msg.role === 'model' && (
                       <Sparkles className="w-3 h-3 text-blue-400 absolute -top-1 -left-1 opacity-50" />
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
                  <div className="bg-white border border-neutral-100 p-3.5 rounded-2xl rounded-tl-[2px] shadow-md flex items-center gap-3">
                    <Music className="w-4 h-4 text-blue-500 animate-bounce" />
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">Analyzing Frequencies...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-zinc-50/50">
                <button 
                  onClick={() => handleSend("Drop some sick electronic beats")}
                  className="text-[10px] bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full transition-colors font-black uppercase tracking-widest border border-blue-100 shadow-sm"
                >
                  🎧 Electronic
                </button>
                <button 
                  onClick={() => handleSend("Create a custom AI playlist for me")}
                  className="text-[10px] bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full transition-colors font-black uppercase tracking-widest border border-blue-100 shadow-sm"
                >
                  🎛️ AI Playlist
                </button>
                <button 
                  onClick={() => handleSend("What is TonJam all about?")}
                  className="text-[10px] bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full transition-colors font-black uppercase tracking-widest border border-blue-100 shadow-sm"
                >
                  🚀 About
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-neutral-100">
              <div className="flex items-center gap-2 bg-neutral-50 rounded-full px-4 py-1.5 border border-transparent focus-within:border-blue-400/50 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Krupy anything..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-zinc-900 py-2 font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 p-2 rounded-full text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-110 active:scale-95 shadow-lg shadow-blue-600/20"
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
