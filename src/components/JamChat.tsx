import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAudio } from '@/context/AudioContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  MessageSquare,
  X,
  Radio,
  Zap,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";

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
      text: `Sync established with ${activeJamRoom.name}. Broadcast your signal.`,
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
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      className="fixed bottom-24 right-4 sm:right-8 z-[60] w-[320px] sm:w-[380px] h-[500px] bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
    >
      {/* Digital Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      {/* Header */}
      <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-blue-600/10 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <Radio className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase italic tracking-tighter text-foreground leading-none">{activeJamRoom.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
              <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] leading-none">Signal Active</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={leaveJamRoom}
          className="h-8 w-8 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-red-400 transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-5 relative z-10">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.user.uid === userProfile.uid;
            const isSystem = msg.user.uid === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-full border border-white/[0.05]">
                    <Terminal className="h-3 w-3 text-blue-500/50" />
                    <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">
                      {msg.text}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn(
                "flex items-end gap-3",
                isMe ? "flex-row-reverse" : "flex-row"
              )}>
                <Avatar className="h-8 w-8 border border-white/5 shrink-0 shadow-lg">
                  <AvatarImage src={msg.user.avatar} />
                  <AvatarFallback className="text-[10px] bg-zinc-800 font-bold">{msg.user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "max-w-[75%] space-y-1",
                  isMe ? "items-end" : "items-start"
                )}>
                  {!isMe && (
                    <p className="text-[9px] font-black text-blue-400/70 uppercase tracking-widest ml-1">{msg.user.name}</p>
                  )}
                  <div className={cn(
                    "p-3.5 rounded-2xl text-[13px] shadow-lg leading-relaxed font-bold tracking-tight",
                    isMe 
                      ? "bg-blue-600 text-white rounded-br-none border border-blue-500/50" 
                      : "bg-white/[0.05] text-foreground rounded-bl-none border border-white/5 backdrop-blur-sm"
                  )}>
                    <p>{msg.text}</p>
                  </div>
                  <p className={cn(
                    "text-[8px] opacity-40 font-black uppercase tracking-[0.1em]",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-5 border-t border-white/[0.05] bg-white/[0.02] backdrop-blur-xl relative z-10">
        <form onSubmit={handleSendMessage} className="relative group">
          <Input 
            placeholder="Broadcast a signal..."
            className="bg-zinc-900/50 border-white/[0.05] rounded-2xl h-12 pr-14 focus-visible:ring-blue-500/30 transition-all text-xs font-bold italic placeholder:text-zinc-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button 
            type="submit"
            disabled={!input.trim()}
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all font-bold active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Zap className="h-3 w-3 text-blue-500/50 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Node Sync Active</span>
          </div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500/50">v4.0 Protocol</div>
        </div>
      </div>
    </motion.div>
  );
};

export default JamChat;

