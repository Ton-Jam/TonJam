import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, Wallet, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { APP_LOGO } from '../constants';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset, signInWithWallet } = useAuth();
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (walletAddress && wallet && isOpen) {
      handleWalletLogin(walletAddress, wallet.device.appName);
    }
  }, [walletAddress, wallet, isOpen]);

  const handleWalletLogin = async (address: string, appName: string) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithWallet(address, appName);
      if (error) throw error;
      toast.success('Wallet Connected', {
        description: 'Neural link established via Web3.',
      });
      onClose();
    } catch (error: any) {
      toast.error('Wallet Connection Failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    const code = error.code || error.message || '';
    if (code.includes('auth/invalid-credential')) {
      return 'Incorrect email or password. Please try again or initialize a new node if you haven\'t already.';
    }
    if (code.includes('auth/user-not-found')) {
      return 'No account found with this email. Would you like to initialize a new node?';
    }
    if (code.includes('auth/wrong-password')) {
      return 'Incorrect password. Please try again.';
    }
    if (code.includes('auth/email-already-in-use')) {
      return 'This email is already registered. Try logging in instead.';
    }
    if (code.includes('auth/popup-closed-by-user')) {
      return 'Sign-in cancelled.';
    }
    if (code.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please try again later.';
    }
    return error.message || 'Signal interference detected.';
  };

  const handleForgotPassword = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Email Required', {
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }

    try {
      const { error } = await sendPasswordReset(email);
      if (error) throw error;
      toast.success('Reset Email Sent', {
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (error: any) {
      toast.error('Reset Failed', {
        description: getErrorMessage(error),
      });
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(data.email, data.password);
        if (error) throw error;
        toast.success('Access Granted', {
          description: 'Neural link established. Welcome back.',
        });
        onClose();
      } else {
        const { error } = await signUpWithEmail(data.email, data.password, { username: data.username });
        if (error) throw error;
        toast.success('Protocol Initialized', {
          description: 'Neural link established. Welcome to TonJam.',
        });
        onClose();
      }
    } catch (error: any) {
      toast.error('Authentication Failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[360px] bg-[#0A0A0C] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] mx-4"
        >
          {/* Hero Branding Area - Compact */}
          <div className="relative h-24 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
             <div className="relative z-10 flex flex-col items-center">
                <div className="relative mt-2">
                  <div className="absolute -inset-3 bg-blue-500/10 blur-lg rounded-full" />
                  <img src={APP_LOGO} className="w-10 h-10 relative z-10 drop-shadow-xl" alt="TonJam" />
                </div>
             </div>
             <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all border border-white/5 z-20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
          </div>

          <div className="px-6 pb-6 pt-2">
            <div className="text-center mb-6">
              <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1 italic">
                {isLogin ? 'Join the Grid' : 'Network Signup'}
              </h1>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
                {isLogin ? 'Neural link authentication required' : 'Initialize your unique node signature'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {!isLogin && (
                <div className="space-y-1">
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('username')}
                      type="text"
                      placeholder="ALIAS"
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/5 font-bold uppercase tracking-widest"
                    />
                    {errors.username && <p className="text-[9px] text-red-500 mt-0.5 font-bold ml-1">{errors.username.message}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="EMAIL_ADDRESS"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/5 font-bold uppercase tracking-widest"
                  />
                  {errors.email && <p className="text-[9px] text-red-500 mt-0.5 font-bold ml-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="PWD_KEY"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/5 font-bold uppercase tracking-widest"
                  />
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 bg-[#0A0A0C]/80 px-1.5 py-0.5 rounded"
                    >
                      Reset
                    </button>
                  )}
                  {errors.password && <p className="text-[9px] text-red-500 mt-0.5 font-bold ml-1">{errors.password.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.97]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Access Grid' : 'Register'}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0A0A0C] px-3 text-[7px] font-black text-white/10 uppercase tracking-[0.2em]">Gateways</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-center w-full">
                <TonConnectButton className="w-full [&>button]:w-full [&>button]:py-3 [&>button]:rounded-xl [&>button]:bg-white/5 [&>button]:text-white [&>button]:hover:bg-white/10 [&>button]:transition-all [&>button]:font-black [&>button]:text-[10px] [&>button]:uppercase [&>button]:tracking-[0.15em] [&>button]:border [&>button]:border-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all group"
                >
                  <Chrome className="h-3.5 w-3.5 text-white/20 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-black text-white/40 group-hover:text-white uppercase tracking-widest">Google</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all group"
                >
                  <Github className="h-3.5 w-3.5 text-white/20 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-black text-white/40 group-hover:text-white uppercase tracking-widest">GitHub</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em] hover:text-white transition-colors group"
              >
                {isLogin ? (
                  <>New Member? <span className="text-blue-500 group-hover:underline ml-0.5">Register</span></>
                ) : (
                  <>Joined Already? <span className="text-blue-500 group-hover:underline ml-0.5">Login</span></>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-3 flex justify-center gap-6 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500/30" />
              <span className="text-[6px] font-black text-white/10 uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-2.5 h-2.5 text-blue-500/30" />
              <span className="text-[6px] font-black text-white/10 uppercase tracking-widest">Active Node</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
