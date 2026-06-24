import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, Wallet, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { triggerHaptic } from '@/lib/haptics';
import { APP_LOGO } from '../constants';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().optional().refine((val) => !val || val.length >= 3, {
    message: 'Username must be at least 3 characters',
  }),
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
      triggerHaptic('success');
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-background flex flex-col items-center justify-center p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-all border border-border"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px] space-y-8"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img src={APP_LOGO} className="w-16 h-16 object-contain" alt="TonJam" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                {isLogin ? 'Welcome Back' : 'Sign Up'}
              </h1>
              <p className="text-xs font-medium text-muted-foreground tracking-normal uppercase">
                {isLogin ? 'Sign in to access your music' : 'Create an account to start listening'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('username')}
                      type="text"
                      placeholder="Username"
                      className="w-full bg-muted/30 border border-border rounded-[4px] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                    />
                  </div>
                  {errors.username && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.username.message}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-muted/30 border border-border rounded-[4px] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  className="w-full bg-muted/30 border border-border rounded-[4px] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                />
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-[4px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center w-full">
                <TonConnectButton className="w-full h-14 [&>button]:w-full [&>button]:h-full [&>button]:rounded-[4px] [&>button]:bg-muted/50 [&>button]:text-foreground [&>button]:hover:bg-muted [&>button]:transition-all [&>button]:font-black [&>button]:text-xs [&>button]:uppercase [&>button]:tracking-widest [&>button]:border [&>button]:border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center justify-center gap-3 py-3.5 bg-muted/50 border border-border rounded-[4px] hover:bg-muted transition-all group"
                >
                  <Chrome className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Google</span>
                </button>
                <button
                  className="flex items-center justify-center gap-3 py-3.5 bg-muted/50 border border-border rounded-[4px] hover:bg-muted transition-all group"
                >
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">GitHub</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-xs font-bold text-muted-foreground tracking-tight hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-blue-500 font-black uppercase tracking-tighter">Sign Up</span></>
                ) : (
                  <>Already have an account? <span className="text-blue-500 font-black uppercase tracking-tighter">Sign In</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-8 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Secure Node</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Network Enabled</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
