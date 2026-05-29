import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Activity, 
  Coins, 
  ArrowLeft, 
  ExternalLink, 
  Search,
  Filter,
  SearchIcon,
  Rocket,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Mail,
  UserCheck,
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { TON_LOGO } from '@/constants';
import { ButtonGroupInput } from '@/components/ButtonGroupInput';
import { Button } from '@/components/ui/button';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { deployTonJamCollection, deployTonJamMarketplace, TONJAM_COLLECTION_ADDRESS, TONJAM_MARKETPLACE_ADDRESS } from '@/services/tonService';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { SponsoredContent, UserProfile, TreasuryStats, GrantAllocation } from '@/types';
import { doc, updateDoc, setDoc, deleteDoc, getDocs, collection, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { governanceService } from '@/services/governanceService';
import { treasuryService } from '@/services/treasuryService';
import { seedDatabase } from '@/services/seedService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { transactions, approveSponsorship, rejectSponsorship } = useAudio();
  const safeTransactions = transactions || [];
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [isDeployingCollection, setIsDeployingCollection] = useState(false);
  const [isDeployingMarketplace, setIsDeployingMarketplace] = useState(false);
  const [deployedCollection, setDeployedCollection] = useState(localStorage.getItem('tonjam_collection_address') || TONJAM_COLLECTION_ADDRESS);
  const [deployedMarketplace, setDeployedMarketplace] = useState(localStorage.getItem('tonjam_marketplace_address') || TONJAM_MARKETPLACE_ADDRESS);

  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const [allSponsorships, setAllSponsorships] = useState<SponsoredContent[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [updatingUserUid, setUpdatingUserUid] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [roleFilter, setRoleFilter] = useState('all');
  const [minTransactions, setMinTransactions] = useState(0);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesActivity = (user.transactions?.length || 0) >= minTransactions;
      return matchesRole && matchesActivity;
    });
  }, [allUsers, roleFilter, minTransactions]);
  
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleForceSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase(true);
      toast.success('Database re-seeded with high-quality mock data!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to re-seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const unsubStats = treasuryService.subscribeToStats(setTreasuryStats);
    const unsubProposals = governanceService.getProposals(setAllProposals);
    return () => {
      unsubStats();
      unsubProposals();
    };
  }, []);

  const handleExecuteTreasury = async (proposal: any) => {
    setIsExecuting(proposal.id);
    try {
      // Mocking recipient details for demo if not in proposal
      const recipientId = proposal.creatorId;
      const recipientName = proposal.creatorName;
      const amount = proposal.category === 'Artist Grant' ? 500 : 2500; // Mock amounts
      
      await governanceService.executeTreasuryProposal(
        proposal.id,
        recipientId,
        recipientName,
        amount,
        proposal.category === 'Artist Grant' ? 'artist_grant' : 'feature_development'
      );
      toast.success('Funds distributed and proposal executed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to execute treasury proposal');
    } finally {
      setIsExecuting(null);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'sponsoredContent'), orderBy('createdAt', 'desc')),
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SponsoredContent));
        setAllSponsorships(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'sponsoredContent')
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setAllUsers(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'users')
    );

    const unsubVerifications = onSnapshot(
      query(collection(db, 'verificationRequests'), orderBy('submittedAt', 'desc')),
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVerificationRequests(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'verificationRequests')
    );

    return () => {
      unsub();
      unsubVerifications();
    };
  }, []);

  const handleApproveVerification = async (request: any) => {
    setIsVerifying(request.id);
    try {
      const batch = writeBatch(db);
      
      // 1. Update user profile to verified artist
      const userRef = doc(db, 'users', request.userId);
      batch.update(userRef, {
        isVerified: true,
        isVerifiedArtist: true,
        role: 'artist',
        verificationStatus: 'verified',
        bio: request.metadata?.bio || '',
        genre: request.metadata?.genre || '',
        socials: {
          x: request.socialLinks?.find((s: any) => s.platform === 'twitter')?.url || '',
          instagram: request.socialLinks?.find((s: any) => s.platform === 'instagram')?.url || '',
          website: request.portfolioUrl || '',
          spotify: request.socialLinks?.find((s: any) => s.platform === 'spotify')?.url || ''
        }
      });

      // 2. Update the verification request status
      const requestRef = doc(db, 'verificationRequests', request.id);
      batch.update(requestRef, { 
        status: 'approved',
        resolvedAt: new Date().toISOString()
      });

      await batch.commit();
      toast.success(`Artist ${request.artistName} verified!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve verification');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleRejectVerification = async (request: any) => {
    setIsVerifying(request.id);
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', request.userId);
      batch.update(userRef, { verificationStatus: 'rejected' });

      const requestRef = doc(db, 'verificationRequests', request.id);
      batch.update(requestRef, { 
        status: 'rejected',
        resolvedAt: new Date().toISOString()
      });

      await batch.commit();
      toast.success('Verification rejected');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject verification');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserUid(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', userId), { assignedAt: new Date().toISOString() });
      } else {
        await deleteDoc(doc(db, 'admins', userId));
      }
      toast.success(`Role updated successfully to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUserUid(null);
    }
  };

  const handleDeployCollection = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setIsDeployingCollection(true);
    try {
      const metadataUrl = "https://tonjam.app/nft-collection.json"; // Example
      const address = await deployTonJamCollection(tonConnectUI, userAddress, metadataUrl);
      setDeployedCollection(address);
      localStorage.setItem('tonjam_collection_address', address);
      toast.success("Collection contract deployment initiated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to deploy collection contract");
    } finally {
      setIsDeployingCollection(false);
    }
  };

  const handleDeployMarketplace = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setIsDeployingMarketplace(true);
    try {
      const address = await deployTonJamMarketplace(tonConnectUI, userAddress, userAddress);
      setDeployedMarketplace(address);
      localStorage.setItem('tonjam_marketplace_address', address);
      toast.success("Marketplace contract deployment initiated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to deploy marketplace contract");
    } finally {
      setIsDeployingMarketplace(false);
    }
  };

  const platformStats = useMemo(() => {
    const totalVolume = safeTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const totalFees = safeTransactions.reduce((acc, tx) => acc + tx.platformFee, 0);
    const streamCount = safeTransactions.filter(tx => tx.type === 'stream').length;
    const saleCount = safeTransactions.filter(tx => tx.type === 'nft_sale').length;

    return {
      totalVolume: totalVolume.toFixed(4),
      totalFees: totalFees.toFixed(4),
      streamCount,
      saleCount
    };
  }, [safeTransactions]);

  return (
    <div className="min-h-screen bg-background pb-4 pt-4 px-4 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-[4px]">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('withdrawals')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'withdrawals' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Withdrawals
              </button>
              <button 
                onClick={() => setActiveTab('sponsorships')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sponsorships' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sponsorships
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tasks
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setActiveTab('verifications')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'verifications' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Verifications
              </button>
              <button 
                onClick={() => setActiveTab('treasury')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'treasury' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Treasury
              </button>
              <button 
                onClick={() => setActiveTab('mockmaker')}
                className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'mockmaker' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Mock Maker
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-[0.5em]">Platform Governance</span>
              </div>
              <h1 className="text-[32px] font-bold text-foreground tracking-tighter uppercase flex items-center gap-4">
                Admin Console <Shield className="h-8 w-8 text-muted-foreground/30" />
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass px-4 py-4 rounded-[4px] flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Platform Balance</p>
                  <p className="text-lg font-bold text-foreground tracking-tighter">{platformStats.totalFees} TON</p>
                </div>
                <img src={TON_LOGO} className="w-6 h-6" alt="" />
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'mockmaker' && (
          <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-8 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tighter mb-2 uppercase">Platform Mock Maker</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Refresh all platform data with high-quality presets. This will update existing tracks, artists, NFTs, and governance proposals with the latest mock data definitions while preserving system-critical information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                {[
                  { label: 'Metadata Quality', desc: 'Detailed bios, technical specs, and realistic metrics.', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                  { label: 'Visual Assets', desc: 'High-res images from pollinations.ai for all entities.', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                  { label: 'Wallet Context', desc: 'Realistic UQ-prefixed wallet addresses for TON.', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                  { label: 'Engagement Data', desc: 'Consistent play counts, likes, and followers.', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className="mt-0.5">{feature.icon}</div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{feature.label}</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={handleForceSeed}
                  disabled={isSeeding}
                  className="w-full sm:w-auto h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-xs font-bold uppercase tracking-widest gap-2"
                >
                  {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isSeeding ? 'Refreshing Data...' : 'Run Mock Maker'}
                </Button>
                <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-3 h-3" /> System Version 2.4.0 (Latest)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-xl border border-border/50 bg-foreground/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Seeded Tracks</h3>
                <div className="text-3xl font-bold tracking-tighter mb-1">16</div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Across 11 genres</p>
              </div>
              <div className="glass p-6 rounded-xl border border-border/50 bg-foreground/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Verified Artists</h3>
                <div className="text-3xl font-bold tracking-tighter mb-1">11</div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">With full profiles</p>
              </div>
              <div className="glass p-6 rounded-xl border border-border/50 bg-foreground/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">NFT Inventory</h3>
                <div className="text-3xl font-bold tracking-tighter mb-1">5</div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Mythic & Legendary</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Volume', value: `${platformStats.totalVolume} TON`, icon: <TrendingUp className="h-4 w-4" />, color: 'blue' },
            { label: 'Revenue (Fees)', value: `${platformStats.totalFees} TON`, icon: <Coins className="h-4 w-4" />, color: 'green' },
            { label: 'Total Streams', value: platformStats.streamCount.toLocaleString(), icon: <Activity className="h-4 w-4" />, color: 'purple' },
            { label: 'NFT Transactions', value: platformStats.saleCount.toLocaleString(), icon: <Shield className="h-4 w-4" />, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
              <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">{stat.label}</p>
              <h3 className="text-xl font-bold text-foreground tracking-tighter">{stat.value}</h3>
            </div>
          ))}
            </div>
          </>
        )}

        {/* Contract Management */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">NFT Collection Contract</h3>
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-2">Core NFT logic & minting</p>
              </div>
              <Rocket className="h-4 w-4 text-muted-foreground/30" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-[4px] border border-border/30">
                <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mb-2">Deployed Address</p>
                <p className="text-[10px] font-mono text-foreground break-all">
                  {deployedCollection.startsWith('EQB_') ? (
                    <span className="text-amber-500 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" /> Not Deployed (Placeholder)
                    </span>
                  ) : (
                    <span className="text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> {deployedCollection}
                    </span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={handleDeployCollection}
                disabled={isDeployingCollection}
                className="w-full py-6 bg-foreground text-background hover:bg-foreground/90 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isDeployingCollection ? "Deploying..." : "Deploy Collection Contract"}
              </Button>
            </div>
          </div>

          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Marketplace Contract</h3>
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-2">Listing, buying & fees</p>
              </div>
              <SettingsIcon className="h-4 w-4 text-muted-foreground/30" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-[4px] border border-border/30">
                <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mb-2">Deployed Address</p>
                <p className="text-[10px] font-mono text-foreground break-all">
                  {deployedMarketplace.startsWith('EQB_') ? (
                    <span className="text-amber-500 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" /> Not Deployed (Placeholder)
                    </span>
                  ) : (
                    <span className="text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> {deployedMarketplace}
                    </span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={handleDeployMarketplace}
                disabled={isDeployingMarketplace}
                className="w-full py-6 bg-foreground text-background hover:bg-foreground/90 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isDeployingMarketplace ? "Deploying..." : "Deploy Marketplace Contract"}
              </Button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Platform Withdrawals</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-foreground">Pending Withdrawals</p>
                  <p className="text-[10px] text-muted-foreground">Process pending artist earnings</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">Process All</Button>
              </div>
              {/* Add withdrawal list here */}
            </div>
          </div>
        )}

        {activeTab === 'sponsorships' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Sponsored Content Management</h2>
                <p className="text-[10px] text-muted-foreground mt-1">Review and approve artist sponsorship requests.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {allSponsorships.filter(s => s.status === 'pending').length} Pending
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {allSponsorships.length > 0 ? (
                allSponsorships.map((s) => (
                  <div key={s.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/30 group hover:bg-muted/50 transition-all">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={s.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          s.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                          s.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {s.status}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                          {s.type}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground truncate">{s.title}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        By {s.artistName} • {s.paymentAmount} {s.paymentCurrency} • {s.durationDays} Days
                      </p>
                    </div>

                    {s.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => rejectSponsorship(s.id)}
                          variant="outline" 
                          className="h-9 px-4 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          onClick={() => approveSponsorship(s.id)}
                          className="h-9 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Pay
                        </Button>
                      </div>
                    )}

                    {s.status === 'approved' && (
                      <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> Active until {new Date(s.endDate || '').toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Rocket className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No sponsorship requests found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Task Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs font-bold text-foreground mb-4">Add New Platform Task</p>
                {/* Add task creation form here */}
                <p className="text-[10px] text-muted-foreground">Task creation form will be implemented here.</p>
              </div>
              {/* Add task list here */}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6 mb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">User Role Management</h2>
            <div className="flex gap-4 mb-4">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-muted p-2 rounded text-[10px] uppercase font-bold text-muted-foreground outline-none border border-border/20">
                <option value="all">All Roles</option>
                <option value="user">Collector</option>
                <option value="artist">Artist</option>
                <option value="admin">Admin</option>
              </select>
              <select value={minTransactions} onChange={(e) => setMinTransactions(parseInt(e.target.value))} className="bg-muted p-2 rounded text-[10px] uppercase font-bold text-muted-foreground outline-none border border-border/20">
                <option value={0}>Any Activity</option>
                <option value={1}>Active (&gt;0 txs)</option>
                <option value={10}>Very Active (&gt;10 txs)</option>
              </select>
            </div>
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2">User details</th>
                        <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2">Role</th>
                        <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img src={user.avatar} className="w-8 h-8 rounded-full bg-muted object-cover" alt="" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold uppercase">{user.name?.charAt(0)}</div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-foreground">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground">@{user.username || user.uid.substring(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                              user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                              user.role === 'artist' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right flex items-center justify-end gap-2">
                            <select 
                              value={selectedRoles[user.uid] || user.role || 'user'} 
                              onChange={(e) => setSelectedRoles({...selectedRoles, [user.uid]: e.target.value})}
                              disabled={updatingUserUid === user.uid}
                              className="bg-transparent border border-border/50 p-2 text-xs rounded-lg text-foreground uppercase outline-none focus:border-blue-500/50 hover:bg-foreground/5 transition-colors disabled:opacity-50"
                            >
                              <option value="user" className="bg-background text-foreground">User</option>
                              <option value="artist" className="bg-background text-foreground">Artist</option>
                              <option value="admin" className="bg-background text-foreground">Admin</option>
                            </select>
                            {selectedRoles[user.uid] && selectedRoles[user.uid] !== user.role && (
                              <Button 
                                size="sm" 
                                onClick={() => handleRoleChange(user.uid, selectedRoles[user.uid])}
                                disabled={updatingUserUid === user.uid}
                              >
                                {updatingUserUid === user.uid ? 'Saving...' : 'Save'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6 mb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Artist Verification Requests</h2>
            <div className="space-y-4">
              {verificationRequests.length > 0 ? (
                verificationRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-muted/30 rounded-xl border border-border/30 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                           req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                           req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                           'bg-red-500/10 text-red-500'
                         }`}>
                           {req.status}
                         </span>
                         <span className="text-sm font-bold text-foreground">{req.artistName}</span>
                       </div>
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                         {req.metadata?.genre} • {req.metadata?.bio?.substring(0, 100)}...
                       </p>
                       <div className="flex gap-4">
                         {req.socialLinks?.map((s: any) => s.url && (
                           <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" className="text-[9px] text-blue-400 hover:underline flex items-center gap-1 uppercase font-bold">
                             {s.platform} <ExternalLink className="w-2 h-2" />
                           </a>
                         ))}
                         {req.portfolioUrl && (
                           <a href={req.portfolioUrl} target="_blank" rel="noreferrer" className="text-[9px] text-purple-400 hover:underline flex items-center gap-1 uppercase font-bold">
                             Portfolio <ExternalLink className="w-2 h-2" />
                           </a>
                         )}
                       </div>
                    </div>
                    
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectVerification(req)}
                          disabled={isVerifying === req.id}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] uppercase font-bold h-10 px-4"
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApproveVerification(req)}
                          disabled={isVerifying === req.id}
                          className="bg-green-600 hover:bg-green-500 text-white text-[10px] uppercase font-bold h-10 px-4"
                        >
                          {isVerifying === req.id ? 'Approving...' : 'Approve & Verify'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground/50 uppercase font-bold text-[10px] tracking-widest">
                  No verification requests in queue
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'treasury' && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Treasury Balance</p>
                <h3 className="text-xl font-bold text-foreground tracking-tighter">{treasuryStats?.balance?.toFixed(2) || '0.00'} TON</h3>
              </div>
              <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Fees Collected</p>
                <h3 className="text-xl font-bold text-green-500 tracking-tighter">+{treasuryStats?.totalFeesCollected?.toFixed(2) || '0.00'} TON</h3>
              </div>
              <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Grants Allocated</p>
                <h3 className="text-xl font-bold text-amber-500 tracking-tighter">{treasuryStats?.totalGrantsAllocated?.toFixed(2) || '0.00'} TON</h3>
              </div>
            </div>

            <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-6">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Treasury Governance Proposals</h2>
              <div className="space-y-4">
                {allProposals.filter(p => p.category === 'Treasury' || p.category === 'Artist Spotlight').length > 0 ? (
                  allProposals
                    .filter(p => (p.category === 'Treasury' || p.category === 'Artist Spotlight') && p.status === 'passed')
                    .map((p) => (
                    <div key={p.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded uppercase font-bold">Passed</span>
                          <span className="text-[8px] text-muted-foreground uppercase font-bold">{p.category}</span>
                        </div>
                        <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                        <p className="text-[10px] text-muted-foreground">Proposed by {p.creatorName} • {p.forVotes} For / {p.againstVotes} Against</p>
                      </div>
                      <Button 
                        disabled={isExecuting === p.id}
                        onClick={() => handleExecuteTreasury(p)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase py-2 px-6 rounded-lg h-auto"
                      >
                        {isExecuting === p.id ? 'Executing...' : 'Execute & Distribute'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No executable treasury proposals found</p>
                  </div>
                )}
                
                {allProposals.filter(p => (p.category === 'Treasury' || p.category === 'Artist Spotlight') && p.status === 'executed').length > 0 && (
                   <div className="pt-6 border-t border-border/30">
                     <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Executed Grants</h3>
                     <div className="space-y-2 opacity-60">
                        {allProposals
                          .filter(p => (p.category === 'Treasury' || p.category === 'Artist Spotlight') && p.status === 'executed')
                          .slice(0, 5)
                          .map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg text-xs">
                             <span className="font-medium text-foreground">{p.title}</span>
                             <span className="text-muted-foreground text-[10px] uppercase font-bold">Distributed</span>
                          </div>
                        ))}
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Master Ledger */}
        <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[4px] p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Global Transaction Ledger</h3>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-4">Real-time auditable blockchain events</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <ButtonGroupInput 
                  placeholder="Search Hash/Address..." 
                  className="w-full"
                  inputClassName="bg-muted/50 border-border py-4 text-[10px] outline-none text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500"
                />
              </div>
              <Button variant="outline" className="p-4 bg-muted/50 rounded-[4px] text-muted-foreground hover:text-foreground transition-all">
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Timestamp</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Asset</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Total Amount</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Platform Fee</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Artist Share</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Recipient</th>
                  <th className="pb-4 text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors group">
                      <td className="py-4 text-[9px] text-muted-foreground font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4">
                        <span className={`text-[7px] font-bold uppercase px-4 py-4 rounded-[4px] ${tx.type === 'stream' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {(tx.type || 'transaction').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-[9px] font-bold text-foreground uppercase truncate max-w-[100px]">{tx.trackTitle || 'Unknown'}</p>
                      </td>
                      <td className="py-4 text-[9px] font-mono text-foreground">{tx.amount} TON</td>
                      <td className="py-4 text-[9px] font-mono text-amber-500">+{tx.platformFee}</td>
                      <td className="py-4 text-[9px] font-mono text-green-400">+{tx.artistShare}</td>
                      <td className="py-4">
                        <p className="text-[7px] font-mono text-muted-foreground">{tx.recipientAddress ? `${tx.recipientAddress.slice(0, 6)}...${tx.recipientAddress.slice(-4)}` : 'Unknown'}</p>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-4 bg-muted/50 rounded-[4px] text-muted-foreground/50 hover:text-blue-400 transition-all">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center">
                      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em]">Zero activity detected in the current epoch.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
