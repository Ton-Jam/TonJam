import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Bot, X, Send, Music, Sparkles, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { useNavigate } from 'react-router-dom';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Yo! I'm krupy, your AI DJ and Web3 music guide. 🎧 I'm here to help you navigate the TonJam universe—whether you're looking for the hottest new tracks, want to understand how music NFTs work, or need a custom playlist for your next session. What's the vibe today?" }
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

      const systemInstruction = `You are krupy AI Assistant, a helpful AI DJ and Web3 music expert on the TonJam platform.
Your mission is to help users discover music, explain Web3 concepts (NFTs, Staking, Royalties), and control the music player.
You have deep knowledge of the current music catalog and platform features.
Available tracks in the catalog: ${allTracks.map(t => `"${t.title}" by ${t.artist}`).join(', ')}.
Use the provided tools to interact with the app.
Be charismatic, knowledgeable, and always ready to drop a music recommendation.
Keep responses concise but informative.`;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [playTrackFunction, searchMusicFunction, createPlaylistFunction] }],
        }
      });

      // Send previous messages as context (excluding the initial greeting to save tokens, or just send the latest)
      // For simplicity, we'll just send the current message, but ideally we'd pass history.
      // The SDK's chat object maintains history automatically if we use the same instance, 
      // but since we recreate it, we should pass history.
      
      const response = await chat.sendMessage({ message: userMessage });
      
      let responseText = response.text || '';

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'playTrack') {
            const args = call.args as any;
            const track = allTracks.find(t => t.title.toLowerCase().includes(args.trackTitle.toLowerCase()));
            if (track) {
              playTrack(track);
              responseText = `Playing "${track.title}" by ${track.artist} right now! 🎵`;
            } else {
              responseText = `I couldn't find a track named "${args.trackTitle}" in our catalog.`;
            }
          } else if (call.name === 'searchMusic') {
            const args = call.args as any;
            setSearchQuery(args.query);
            navigate('/discover');
            responseText = `I've opened the Discover page and searched for "${args.query}" for you! 🎧`;
          } else if (call.name === 'createRecommendedPlaylist') {
            createRecommendedPlaylist();
            responseText = `I'm generating a personalized AI playlist for you right now! Check your Library in a moment. 🎵✨`;
          }
        }
      }

      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting to my neural network right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[99]" />

      {/* Floating Action Button */}
      <motion.button
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-[100] w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-colors cursor-grab active:cursor-grabbing pointer-events-auto"
        whileHover={{ scale: 1.1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        whileDrag={{ opacity: 1 }}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0.5, y: 0 }}
        animate={{ opacity: 0.5, y: 0 }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
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
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 lg:bottom-24 lg:right-6 z-[101] w-[350px] h-[500px] max-h-[80vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header - Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-blue-600 p-4 flex items-center justify-between text-white cursor-move touch-none"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-bold">krupy AI DJ</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors pointer-events-auto">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-black/50">
              {messages.map((msg, idx) => (
                <div key={`msg-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-neutral-800 text-foreground border border-border shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-neutral-800 border border-border p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 bg-neutral-50 dark:bg-black/50">
                <button 
                  onClick={() => handleSend("Play some electronic music")}
                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Play Electronic
                </button>
                <button 
                  onClick={() => handleSend("Create a recommended playlist for me")}
                  className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  Create Playlist
                </button>
                <button 
                  onClick={() => handleSend("What is TonJam?")}
                  className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  What is TonJam?
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-neutral-900 border-t border-border">
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="text-blue-600 disabled:text-muted-foreground transition-colors"
                >
                  <Send className="w-4 h-4" />
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
