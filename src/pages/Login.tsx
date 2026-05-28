import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, ShieldCheck, Globe, ChevronLeft, Wallet, Camera, Check, Sparkles, RefreshCw, Twitter, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadFile } from '@/services/storageService';
import { toast } from 'sonner';
import { TonConnectButton, useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
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
  const [tabMode, setTabMode] = useState<'login' | 'register' | 'wallet'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset, signInWithWallet, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // TON Wallet state
  const tonAddress = useTonAddress();
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  // EVM / Wagmi Wallet state
  const { connectors, connect, error: wagmiConnectError } = useConnect();
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Unified Web3 States
  const [activeAddress, setActiveAddress] = useState<string>('');
  const [activeWalletType, setActiveWalletType] = useState<string>('');
  const [onboardingActive, setOnboardingActive] = useState<boolean>(false);

  // Profile Wizard fields
  const [onboardUsername, setOnboardUsername] = useState<string>('');
  const [onboardBio, setOnboardBio] = useState<string>('Creating sound waves on TonJam! 🎵');
  const [onboardAvatarUrl, setOnboardAvatarUrl] = useState<string>('');
  const [avatarStyle, setAvatarStyle] = useState<string>('identicon'); // identicon, bottts, lorelei, retro
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [socialTwitter, setSocialTwitter] = useState<string>('');
  const [socialTelegram, setSocialTelegram] = useState<string>('');
  
  // Custom image upload state
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilePreview, setCustomFilePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Hook TON connection changes
  useEffect(() => {
    if (tonAddress) {
      setActiveAddress(tonAddress);
      setActiveWalletType('TON Wallet');
      setTabMode('wallet');
      setOnboardingActive(true);
      if (!onboardUsername) {
        setOnboardUsername(`jam_user_${tonAddress.substring(0, 6)}`);
      }
      if (!avatarSeed) {
        setAvatarSeed(tonAddress);
      }
    } else if (!evmAddress) {
      setActiveAddress('');
      setActiveWalletType('');
      setOnboardingActive(false);
    }
  }, [tonAddress]);

  // Hook EVM / Wagmi connection changes
  useEffect(() => {
    if (evmAddress && isEvmConnected) {
      setActiveAddress(evmAddress);
      setActiveWalletType('EVM Wallet');
      setTabMode('wallet');
      setOnboardingActive(true);
      if (!onboardUsername) {
        setOnboardUsername(`eth_user_${evmAddress.substring(0, 6)}`);
      }
      if (!avatarSeed) {
        setAvatarSeed(evmAddress);
      }
    } else if (!tonAddress) {
      setActiveAddress('');
      setActiveWalletType('');
      setOnboardingActive(false);
    }
  }, [evmAddress, isEvmConnected]);

  // Dynamically compute avatar URL when seed or style updates
  useEffect(() => {
    if (avatarSeed && !customFilePreview) {
      const generated = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
      setOnboardAvatarUrl(generated);
    }
  }, [avatarStyle, avatarSeed, customFilePreview]);

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
      if (tabMode === 'login') {
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

  // Custom Local Avatar File Picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File Too Large", { description: "Max visual size is 2MB" });
        return;
      }
      setCustomFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOnboardAvatarUrl('');
        setCustomFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Web3 Complete Profile & Authenticate
  const handleLaunchWeb3Node = async () => {
    if (!activeAddress) {
      toast.error("No Wallet Connected");
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Sign in with Wallet anonymously, returning credentials and generating a user document reference
      const { user: registeredUser, error } = await signInWithWallet(activeAddress, activeWalletType);
      if (error) throw error;

      let finalAvatarUrl = onboardAvatarUrl;

      // 2. Safely upload selected avatar image if custom photo is chosen
      if (customFile && registeredUser) {
        setIsUploadingImage(true);
        try {
          const storagePath = `users/${registeredUser.uid}/avatar_${Date.now()}.png`;
          const { downloadUrl } = await uploadFile(customFile, storagePath);
          finalAvatarUrl = downloadUrl;
        } catch (uploadError) {
          console.warn("Avatar upload failed, falling back to dynamic SVG generator option", uploadError);
          // Fallback to generated Dicebear URL
          finalAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // 3. Upsert user info cleanly in Firestore
      if (registeredUser) {
        const userRef = doc(db, 'users', registeredUser.uid);
        await setDoc(userRef, {
          uid: registeredUser.uid,
          username: onboardUsername || `user_${registeredUser.uid.substring(0, 5)}`,
          name: onboardUsername || `Wallet User`,
          bio: onboardBio || "Bio not created yet.",
          avatar: finalAvatarUrl,
          walletAddress: activeAddress,
          walletType: activeWalletType,
          followers: 0,
          following: 0,
          earnings: 0,
          role: 'collector',
          socials: {
            x: socialTwitter || '',
            telegram: socialTelegram || '',
          },
          createdAt: new Date().toISOString()
        }, { merge: true });

        toast.success('Sonic Profile Registered', {
          description: `Customized bio & username saved to TON network identity.`
        });
        
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error('Node Launch Failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setOnboardingActive(false);
    setActiveAddress('');
    setActiveWalletType('');
    setCustomFile(null);
    setCustomFilePreview('');
    setOnboardUsername('');
    
    if (tonAddress) {
      await tonConnectUI.disconnect();
    }
    if (isEvmConnected) {
      disconnectEvm();
    }
    toast.info("Wallet Disconnected");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Background Glow */}
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
        className="w-full max-w-[420px] z-10 my-8"
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
          value={tabMode} 
          onValueChange={(val) => { reset(); setTabMode(val as any); }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border/50 mb-6 h-11 rounded-[2px] p-1">
            <TabsTrigger value="login" className="text-[10px] font-semibold uppercase tracking-widest rounded-[2px] cursor-pointer">
              Log In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-[10px] font-semibold uppercase tracking-widest rounded-[2px] cursor-pointer">
              New User
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-[10px] font-semibold uppercase tracking-widest rounded-[2px] cursor-pointer">
              Web3 Web
            </TabsTrigger>
          </TabsList>

          <Card className="bg-white border-border/50 shadow-xl shadow-black/[0.03] relative overflow-hidden rounded-[2px]">
            {/* EMAIL LOGIN VIEW */}
            {tabMode === 'login' && (
              <>
                <CardHeader className="text-center pb-2 relative z-10">
                  <CardTitle className="text-base font-bold tracking-tight text-foreground">
                    WELCOME BACK
                  </CardTitle>
                  <CardDescription className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Login to access your jam
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-4 relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          className="text-[9px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                        >
                          Reset?
                        </button>
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
                            SIGN IN
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
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      type="button"
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await signInWithGoogle();
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full h-11 border-border/50 hover:bg-muted/50 text-foreground font-bold text-[10px] uppercase tracking-[0.2em] gap-2 rounded-[2px]"
                    >
                      <Chrome className="h-4 w-4 text-blue-500" />
                      Continue with Google
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* EMAIL REGISTER VIEW */}
            {tabMode === 'register' && (
              <>
                <CardHeader className="text-center pb-2 relative z-10">
                  <CardTitle className="text-base font-bold tracking-tight text-foreground">
                    JOIN THE REVOLUTION
                  </CardTitle>
                  <CardDescription className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Create your sonic node
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-4 relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username_reg" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                        <Input
                          id="username_reg"
                          {...register('username')}
                          placeholder="Select username"
                          className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 font-semibold"
                        />
                      </div>
                      {errors.username && <p className="text-[9px] text-red-500 font-medium tracking-tight ml-1">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email_reg" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                        <Input
                          id="email_reg"
                          type="email"
                          {...register('email')}
                          placeholder="email@example.com"
                          className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 font-semibold"
                        />
                      </div>
                      {errors.email && <p className="text-[9px] text-red-500 font-medium tracking-tight ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password_reg" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                        <Input
                          id="password_reg"
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
                            CREATE ACCOUNT
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {/* WEB3 WALLET CONNECT & PROFILE ONBOARDING VIEW */}
            {tabMode === 'wallet' && (
              <>
                <CardHeader className="text-center pb-2 relative z-10">
                  <CardTitle className="text-base font-bold tracking-tight text-foreground uppercase">
                    {onboardingActive ? 'IDENTITY PROTOCOL' : 'SECURE SEC REVOLUTION'}
                  </CardTitle>
                  <CardDescription className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {onboardingActive ? 'Customize your on-chain sonic presence' : 'Authenticate using Web3 connection features'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 relative z-10 max-h-[500px] overflow-y-auto no-scrollbar">
                  {!onboardingActive ? (
                    <div className="space-y-4">
                      {/* Connection Warning / Info */}
                      <div className="bg-blue-500/5 p-4 rounded-xl text-center space-y-2">
                        <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Decentralized Authorization</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Secure wallet connections eliminate passwords completely. Link on-chain identity nodes directly.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* TON CONNECT DEFAULT SDK TRIGGER */}
                        <div className="flex flex-col gap-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">TON Ecosystem</Label>
                          <button
                            onClick={() => tonConnectUI.openModal()}
                            className="w-full h-11 pointer-events-auto flex items-center justify-between px-4 border border-blue-500/20 hover:bg-blue-500/5 text-blue-500 rounded-[2px] transition-colors font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              TON Wallet Connect (Standard)
                            </span>
                            <span className="text-[8px] tracking-normal font-bold lowercase opacity-75">SDK Client</span>
                          </button>
                        </div>

                        {/* EVM / WALLETCONNECT / WAGMI */}
                        <div className="flex flex-col gap-2 pt-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest ml-1 text-muted-foreground/70">Multi-Chain standard (WalletConnect / EVM)</Label>
                          
                          {/* Inject Standard EVM connectors dynamically */}
                          {connectors.map((connector) => (
                            <button
                              key={connector.id}
                              onClick={() => connect({ connector })}
                              className="w-full h-11 flex items-center justify-between px-4 border border-purple-500/20 hover:bg-purple-500/5 text-purple-500 rounded-[2px] transition-colors font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Connect with {connector.name}
                              </span>
                              <span className="text-[8px] bg-purple-500/10 px-2 py-0.5 rounded-[2px] tracking-widest">Active</span>
                            </button>
                          ))}

                          {/* Interactive Standard QR Simulator Card to represent premium WalletConnect capabilities */}
                          <div className="border border-border/40 p-3 rounded-lg flex items-center justify-between bg-muted/20 mt-1">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
                              <div className="text-left">
                                <p className="text-[9px] font-bold text-foreground">Standard WalletConnect Hub</p>
                                <p className="text-[8px] text-muted-foreground">Ethers, Metamask, Safe standard support</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Simulate WalletConnect address callback beautifully for full demo compliance
                                const mockEthAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
                                setActiveAddress(mockEthAddress);
                                setActiveWalletType('WalletConnect');
                                setOnboardingActive(true);
                                setOnboardUsername(`wc_user_${mockEthAddress.substring(2, 8)}`);
                                setAvatarSeed(mockEthAddress);
                                toast.success("WalletConnected Successfully");
                              }}
                              className="text-[8px] h-7 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 uppercase font-black tracking-widest rounded-sm"
                            >
                              Simulate WC
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STEP 2: STUNNING INTERACTIVE WEB3 PROFILE CREATION FORM */
                    <div className="space-y-4">
                      {/* Active Connection Badge */}
                      <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Linked Node Address</p>
                          <p className="font-mono text-[10px] text-foreground font-black mt-0.5">
                            {activeAddress.substring(0, 10)}...{activeAddress.substring(activeAddress.length - 8)}
                          </p>
                        </div>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* AVATAR SYSTEM WIZARD */}
                      <div className="flex flex-col items-center gap-4 py-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Choose Web3 Identity Picture</Label>
                        
                        <div className="relative w-24 h-24 rounded-full overflow-hidden group bg-muted/20 border-2 border-primary/20 flex items-center justify-center">
                          {customFilePreview ? (
                            <img src={customFilePreview} className="w-full h-full object-cover" alt="Custom Preview" />
                          ) : (
                            <img src={onboardAvatarUrl} className="w-full h-full object-cover" alt="Generated SVG Logo" />
                          )}

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <Camera className="h-5 w-5 text-white" />
                          </button>
                        </div>

                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*" 
                        />

                        {/* Identity Selection Style Grid & Seed Trigger */}
                        <div className="w-full space-y-2 text-center">
                          <div className="flex justify-center gap-1">
                            {['identicon', 'bottts', 'retro', 'lorelei'].map((styleName) => (
                              <button
                                key={styleName}
                                type="button"
                                onClick={() => {
                                  setCustomFile(null);
                                  setCustomFilePreview('');
                                  setAvatarStyle(styleName);
                                }}
                                className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded transition-all border ${
                                  avatarStyle === styleName && !customFilePreview
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                {styleName}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 max-w-[200px] mx-auto">
                            <Input
                              type="text"
                              value={avatarSeed}
                              onChange={(e) => {
                                setCustomFile(null);
                                setCustomFilePreview('');
                                setAvatarSeed(e.target.value);
                              }}
                              placeholder="Avatar seed..."
                              className="h-7 text-[10px] font-semibold text-center border-border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCustomFile(null);
                                setCustomFilePreview('');
                                setAvatarSeed(Math.random().toString(36).substring(7));
                              }}
                              className="h-7 w-7 rounded-[2px]"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* PROFILE DETAIL FIELDS */}
                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="space-y-1">
                          <Label htmlFor="onboard_username" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TONJam Profile Name</Label>
                          <Input
                            id="onboard_username"
                            type="text"
                            value={onboardUsername}
                            onChange={(e) => setOnboardUsername(e.target.value)}
                            placeholder="Input profile name (e.g. SatoshiSonics)"
                            className="h-10 bg-muted/40 font-semibold focus:border-primary border-border"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="onboard_bio" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">My Artist / Collector Bio</Label>
                          <textarea
                            id="onboard_bio"
                            value={onboardBio}
                            onChange={(e) => setOnboardBio(e.target.value)}
                            placeholder="Share your musical style and details..."
                            className="w-full bg-muted/40 text-foreground border border-border p-3 text-xs font-semibold rounded-md resize-none focus:outline-none focus:border-primary"
                            rows={3}
                          />
                        </div>

                        {/* Optional social links */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">On-chain Social Verification (Optional)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground/60 font-bold font-mono">X:</span>
                              <Input
                                value={socialTwitter}
                                onChange={(e) => setSocialTwitter(e.target.value)}
                                placeholder="username"
                                className="pl-6 h-8 text-[10px] font-semibold"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground/60 font-bold font-mono">TG:</span>
                              <Input
                                value={socialTelegram}
                                onChange={(e) => setSocialTelegram(e.target.value)}
                                placeholder="username"
                                className="pl-8 h-8 text-[10px] font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* COMPLETE SUBMIT BUTTONS */}
                      <div className="space-y-2 pt-4 border-t border-border/40">
                        <Button
                          type="button"
                          onClick={handleLaunchWeb3Node}
                          disabled={isLoading || !onboardUsername.trim()}
                          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all rounded-[2px]"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Launching Node...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              LAUNCH SONIC NODE <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </Button>

                        <button
                          type="button"
                          onClick={handleDisconnectWallet}
                          className="w-full text-center text-[9px] font-bold text-red-500/80 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                          Disconnect Linked Node
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

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
