import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, ShieldCheck, Globe, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { APP_LOGO } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset, signInWithWallet, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();

  const from = (location.state as any)?.from?.pathname || "/";

  // If user is already logged in, redirect away
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    }
  });

  React.useEffect(() => {
    if (walletAddress && wallet) {
      handleWalletLogin(walletAddress, wallet.device.appName);
    }
  }, [walletAddress, wallet]);

  const handleWalletLogin = async (address: string, appName: string) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithWallet(address, appName);
      if (error) throw error;
      toast.success('Wallet Connected', {
        description: 'Successfully connected with TON Wallet.',
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error('Connection Failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    const code = error.code || error.message || '';
    if (code.includes('auth/invalid-credential')) {
      return 'Incorrect email or password.';
    }
    if (code.includes('auth/user-not-found')) {
      return 'No account found with this email.';
    }
    return error.message || 'An error occurred during authentication.';
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
      toast.success('Reset Email Sent');
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
        toast.success('Welcome Back');
        navigate(from, { replace: true });
      } else {
        const { error } = await signUpWithEmail(data.email, data.password, { username: data.username });
        if (error) throw error;
        toast.success('Account Created');
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error('Authentication Failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground z-20 group rounded-[2px]"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-4 relative"
          >
            <img src={APP_LOGO} className="w-12 h-12 relative z-10" alt="Logo" />
          </motion.div>
          <h1 className="text-lg font-bold text-foreground tracking-tighter uppercase leading-none mb-2">
            TON JAM
          </h1>
          <p className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.4em] uppercase">
            Audio Protocol
          </p>
        </div>

        <Tabs 
          value={isLogin ? "login" : "register"} 
          onValueChange={(val) => { reset(); setIsLogin(val === "login"); }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/50 mb-6 h-11 rounded-[2px]">
            <TabsTrigger value="login" className="text-[10px] font-semibold uppercase tracking-widest rounded-[2px]">
              Log In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-[10px] font-semibold uppercase tracking-widest rounded-[2px]">
              Create Account
            </TabsTrigger>
          </TabsList>

          <Card className="bg-white border-border/50 shadow-xl shadow-black/[0.03] relative overflow-hidden rounded-[2px]">
            <CardHeader className="text-center pb-2 relative z-10">
              <CardTitle className="text-base font-bold tracking-tight text-foreground">
                {isLogin ? 'WELCOME BACK' : 'JOIN THE REVOLUTION'}
              </CardTitle>
              <CardDescription className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {isLogin ? 'Login to access your jam' : 'Create your sonic node'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-4 relative z-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="username-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <Label htmlFor="username" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                        <Input
                          id="username"
                          {...register('username')}
                          placeholder="Username"
                          className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 font-semibold"
                        />
                      </div>
                      {errors.username && <p className="text-[9px] text-red-500 font-medium tracking-tight ml-1">{errors.username.message}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="email@example.com"
                      className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 font-semibold"
                    />
                  </div>
                  {errors.email && <p className="text-[9px] text-red-500 font-medium tracking-tight ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Password</Label>
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-[9px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                      >
                        Reset?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="••••••••"
                      className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 font-semibold"
                    />
                  </div>
                  {errors.password && <p className="text-[9px] text-red-500 font-medium tracking-tight ml-1">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group rounded-[2px]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">OR</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-center w-full">
                  <TonConnectButton className="w-full [&>button]:w-full [&>button]:h-10 [&>button]:rounded-md [&>button]:bg-muted/50 [&>button]:text-foreground [&>button]:hover:bg-muted/70 [&>button]:transition-all [&>button]:font-bold [&>button]:text-[9px] [&>button]:uppercase [&>button]:tracking-widest [&>button]:border [&>button]:border-border/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => signInWithGoogle()}
                    className="h-10 border-border/50 hover:bg-muted/50 text-foreground font-bold text-[9px] uppercase tracking-widest gap-2"
                  >
                    <Chrome className="h-3.5 w-3.5 text-amber-500" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 border-border/50 hover:bg-muted/50 text-foreground font-bold text-[9px] uppercase tracking-widest gap-2"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-center border-t border-border/50 bg-muted/20 p-3">
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500/70" />
                Access Protocol Secured
              </p>
            </CardFooter>
          </Card>
        </Tabs>
      </motion.div>

      <div className="absolute bottom-6 flex justify-center gap-8 opacity-40 text-muted-foreground z-10">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          <span className="text-[8px] font-black uppercase tracking-widest">Mainnet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span className="text-[8px] font-black uppercase tracking-widest">Secured</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

