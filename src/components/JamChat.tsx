import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAudio } from '@/context/AudioContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  user: {
    name: string;
    avatar: string;
    uid: string;
  };
  timestamp: string;
}

const JamChat: React.FC = () => {
  const { activeJamRoom, userProfile, leaveJamRoom } = useAudio();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeJamRoom) return;

    // Connect to the server
    const newSocket = io();
    setSocket(newSocket);

    // Join the room
    newSocket.emit('join-room', activeJamRoom.id);

    // Initial message if empty
    setMessages([{
      id: 'system-1',
      text: `Connected to ${activeJamRoom.name}. Say hello to the room!`,
      user: {
        name: 'System',
        avatar: '',
        uid: 'system'
      },
      timestamp: new Date().toISOString()
    }]);

    // Handle new messages
    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.emit('leave-room', activeJamRoom.id);
      newSocket.disconnect();
    };
  }, [activeJamRoom?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !activeJamRoom) return;

    socket.emit('send-message', {
      roomId: activeJamRoom.id,
      message: input,
      user: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        uid: userProfile.uid
      }
    });

    setInput('');
  };

  if (!activeJamRoom) return null;

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed bottom-24 right-4 sm:right-8 z-[60] w-[320px] sm:w-[380px] h-[500px] bg-background/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">{activeJamRoom.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Live Connection</span>
            </div>
          </div>
        </div>
        <button 
          onClick={leaveJamRoom}
          className="p-2 hover:bg-white/5 rounded-full transition-all text-muted-foreground hover:text-foreground"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg) => {
          const isMe = msg.user.uid === userProfile.uid;
          const isSystem = msg.user.uid === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[10px] bg-white/5 px-4 py-1.5 rounded-full text-muted-foreground/60 font-bold uppercase tracking-widest">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn(
              "flex items-end gap-2",
              isMe ? "flex-row-reverse" : "flex-row"
            )}>
              <Avatar className="h-7 w-7 mb-1 flex-shrink-0">
                <AvatarImage src={msg.user.avatar} />
                <AvatarFallback className="text-[10px]">{msg.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "max-w-[70%] p-3 rounded-2xl text-sm",
                isMe 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-muted/50 text-foreground rounded-bl-none"
              )}>
                {!isMe && <p className="text-[9px] font-bold text-blue-400 mb-1 uppercase tracking-tight italic">{msg.user.name}</p>}
                <p className="leading-relaxed font-medium">{msg.text}</p>
                <p className={cn(
                  "text-[8px] mt-1 opacity-40 font-mono",
                  isMe ? "text-right" : "text-left"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-muted/20">
        <div className="relative group">
          <Input 
            placeholder="Broadcast a signal..."
            className="bg-background/50 border-white/5 rounded-2xl h-12 pr-12 focus-visible:ring-blue-500/50 transition-all text-sm font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-500 rounded-xl text-white hover:bg-blue-600 disabled:opacity-50 transition-all font-bold group-hover:scale-105 active:scale-95"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default JamChat;
