import React, { useState } from 'react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        toast.success('Access Granted', {
          description: 'Neural link established. Welcome back.',
        });
        onClose();
      } else {
        const { error } = await signUpWithEmail(email, password, { username });
        if (error) throw error;
        toast.success('Protocol Initialized', {
          description: 'Check your email to verify your identity.',
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error('Authentication Failed', {
        description: error.message || 'Signal interference detected.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[12px] overflow-hidden shadow-2xl"
        >
          {/* Hardware Header */}
          <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">
                {isLogin ? 'Auth_Protocol: Login' : 'Auth_Protocol: Register'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h1>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {isLogin ? 'Synchronizing neural frequencies...' : 'Initialize your sonic identity on TON.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="TON_VOYAGER"
                      className="w-full bg-white/5 border border-white/10 rounded-[8px] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/5"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="SIGNAL@TONJAM.COM"
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button type="button" className="text-[8px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-[8px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Establish Link' : 'Initialize Protocol'}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-widest">
                <span className="bg-[#0A0A0A] px-4 text-white/20">Social Relay</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-[8px] hover:bg-white/10 transition-all group"
              >
                <Chrome className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest">Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-[8px] hover:bg-white/10 transition-all group"
              >
                <Github className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest">GitHub</span>
              </button>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors"
              >
                {isLogin ? (
                  <>Don't have a node? <span className="text-blue-500 ml-1">Initialize one</span></>
                ) : (
                  <>Already have a node? <span className="text-blue-500 ml-1">Establish link</span></>
                )}
              </button>
            </div>
          </div>

          {/* Hardware Footer Deco */}
          <div className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/10"></div>
              <span className="text-[6px] font-mono text-white/10 uppercase tracking-widest">AES-256 Encryption Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/10"></div>
              <span className="text-[6px] font-mono text-white/10 uppercase tracking-widest">Neural Link Secure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
