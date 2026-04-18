import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';

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
          className="relative w-full max-w-md bg-background rounded-[24px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h2 className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.4em]">
                {isLogin ? 'Login' : 'Register'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-8 pt-6">
            <div className="mb-8">
              <h1 className="text-[36px] font-bold text-foreground tracking-tighter uppercase leading-none mb-3">
                {isLogin ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                {isLogin ? 'Sign in to your account to continue.' : 'Sign up to get started.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    <input
                      {...register('username')}
                      type="text"
                      placeholder="TON_VOYAGER"
                      className="w-full bg-muted/30 rounded-[14px] py-4 pl-12 pr-4 text-base text-foreground outline-none focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
                    />
                    {errors.username && <p className="text-[10px] text-red-500 mt-1">{errors.username.message}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="SIGNAL@TONJAM.COM"
                    className="w-full bg-muted/30 rounded-[14px] py-4 pl-12 pr-4 text-base text-foreground outline-none focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-muted/30 rounded-[14px] py-4 pl-12 pr-4 text-base text-foreground outline-none focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
                  />
                  {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-[14px] font-bold text-[12px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            {/* ... rest of the component ... */}

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/20"></div>
              </div>
              <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.3em]">
                <span className="bg-background px-4 text-muted-foreground/30">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-center w-full">
                <TonConnectButton className="w-full [&>button]:w-full [&>button]:py-3 [&>button]:rounded-[12px] [&>button]:bg-blue-500/10 [&>button]:text-blue-500 [&>button]:hover:bg-blue-500/20 [&>button]:transition-all [&>button]:font-bold [&>button]:text-[12px] [&>button]:uppercase [&>button]:tracking-[0.2em]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-[12px] hover:bg-muted/50 transition-all group"
                >
                  <Chrome className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Google</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-[12px] hover:bg-muted/50 transition-all group"
                >
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">GitHub</span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-blue-500 ml-1">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-blue-500 ml-1">Sign in</span></>
                )}
              </button>
            </div>
          </div>

          {/* Hardware Footer Deco */}
          <div className="bg-foreground/[0.01] p-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500/20"></div>
              <span className="text-[6px] font-mono text-muted-foreground/20 uppercase tracking-widest">AES-256 Encryption Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500/20"></div>
              <span className="text-[6px] font-mono text-muted-foreground/20 uppercase tracking-widest">Neural Link Secure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
