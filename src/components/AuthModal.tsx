import React, { useState } from 'react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const getErrorMessage = (error: any) => {
    const code = error.code || error.message || '';
    if (code.includes('auth/invalid-credential')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code.includes('auth/user-not-found')) {
      return 'No account found with this email. Would you like to register?';
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
          description: 'Check your email to verify your identity.',
        });
        setIsLogin(true);
        reset();
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
          className="relative w-full max-w-md bg-background border border-border rounded-[16px] overflow-hidden shadow-2xl"
        >
          {/* Hardware Header */}
          <div className="bg-foreground/[0.02] border-b border-border/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h2 className="text-[12px] font-bold text-foreground uppercase tracking-[0.4em]">
                {isLogin ? 'Auth_Protocol: Login' : 'Auth_Protocol: Register'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-[32px] font-bold text-foreground tracking-tighter uppercase mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h1>
              <p className="text-[12px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                {isLogin ? 'Synchronizing neural frequencies...' : 'Initialize your sonic identity on TON.'}
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
                      className="w-full bg-muted/50 border border-border rounded-[12px] py-3 pl-12 pr-4 text-base text-foreground outline-none focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/30"
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
                    className="w-full bg-muted/50 border border-border rounded-[12px] py-3 pl-12 pr-4 text-base text-foreground outline-none focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/30"
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
                    className="w-full bg-muted/50 border border-border rounded-[12px] py-3 pl-12 pr-4 text-base text-foreground outline-none focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/30"
                  />
                  {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-[12px] font-bold text-[12px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Establish Link' : 'Initialize Protocol'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            {/* ... rest of the component ... */}

            <div className="mt-2 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-widest">
                <span className="bg-white px-2 text-muted-foreground/50">Social Relay</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center gap-2 py-2 bg-muted/50 border border-border rounded-[8px] hover:bg-muted transition-all group"
              >
                <Chrome className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-2 bg-muted/50 border border-border rounded-[8px] hover:bg-muted transition-all group"
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">GitHub</span>
              </button>
            </div>

            <div className="mt-2 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>Don't have a node? <span className="text-blue-500 ml-2">Initialize one</span></>
                ) : (
                  <>Already have a node? <span className="text-blue-500 ml-2">Establish link</span></>
                )}
              </button>
            </div>
          </div>

          {/* Hardware Footer Deco */}
          <div className="bg-foreground/[0.02] border-t border-border/50 p-2 flex justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted"></div>
              <span className="text-[6px] font-mono text-muted-foreground/30 uppercase tracking-widest">AES-256 Encryption Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted"></div>
              <span className="text-[6px] font-mono text-muted-foreground/30 uppercase tracking-widest">Neural Link Secure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
