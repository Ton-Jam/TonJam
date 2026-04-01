import React, { useMemo, useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { TON_LOGO } from '@/constants';
import { ButtonGroupInput } from '@/components/ButtonGroupInput';
import { Button } from '@/components/ui/button';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { deployTonJamCollection, deployTonJamMarketplace, TONJAM_COLLECTION_ADDRESS, TONJAM_MARKETPLACE_ADDRESS } from '@/services/tonService';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { transactions } = useAudio();
  const safeTransactions = transactions || [];
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [isDeployingCollection, setIsDeployingCollection] = useState(false);
  const [isDeployingMarketplace, setIsDeployingMarketplace] = useState(false);
  const [deployedCollection, setDeployedCollection] = useState(localStorage.getItem('tonjam_collection_address') || TONJAM_COLLECTION_ADDRESS);
  const [deployedMarketplace, setDeployedMarketplace] = useState(localStorage.getItem('tonjam_marketplace_address') || TONJAM_MARKETPLACE_ADDRESS);

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
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-[12px]">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('withdrawals')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'withdrawals' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Withdrawals
              </button>
              <button 
                onClick={() => setActiveTab('sponsorships')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sponsorships' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sponsorships
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tasks
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
              <div className="glass px-4 py-4 rounded-[10px] flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Platform Balance</p>
                  <p className="text-lg font-bold text-foreground tracking-tighter">{platformStats.totalFees} TON</p>
                </div>
                <img src={TON_LOGO} className="w-6 h-6" alt="" />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Volume', value: `${platformStats.totalVolume} TON`, icon: <TrendingUp className="h-4 w-4" />, color: 'blue' },
            { label: 'Revenue (Fees)', value: `${platformStats.totalFees} TON`, icon: <Coins className="h-4 w-4" />, color: 'green' },
            { label: 'Total Streams', value: platformStats.streamCount.toLocaleString(), icon: <Activity className="h-4 w-4" />, color: 'purple' },
            { label: 'NFT Transactions', value: platformStats.saleCount.toLocaleString(), icon: <Shield className="h-4 w-4" />, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
              <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
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
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">NFT Collection Contract</h3>
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-2">Core NFT logic & minting</p>
              </div>
              <Rocket className="h-4 w-4 text-muted-foreground/30" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-[8px] border border-border/30">
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
                className="w-full py-6 bg-foreground text-background hover:bg-foreground/90 rounded-[8px] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isDeployingCollection ? "Deploying..." : "Deploy Collection Contract"}
              </Button>
            </div>
          </div>

          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Marketplace Contract</h3>
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-2">Listing, buying & fees</p>
              </div>
              <SettingsIcon className="h-4 w-4 text-muted-foreground/30" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-[8px] border border-border/30">
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
                className="w-full py-6 bg-foreground text-background hover:bg-foreground/90 rounded-[8px] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isDeployingMarketplace ? "Deploying..." : "Deploy Marketplace Contract"}
              </Button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-6">
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
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Sponsored Posts</h2>
            <p className="text-xs text-muted-foreground">Manage posts in the auto-scroll carousel.</p>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-6">
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

        {/* Transaction Master Ledger */}
        <div className="glass border border-border/50 bg-foreground/[0.02] rounded-[10px] p-4">
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
              <Button variant="outline" className="p-4 bg-muted/50 rounded-[5px] text-muted-foreground hover:text-foreground transition-all">
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
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-[9px] font-bold text-foreground uppercase truncate max-w-[100px]">{tx.trackTitle || 'Unknown'}</p>
                      </td>
                      <td className="py-4 text-[9px] font-mono text-foreground">{tx.amount} TON</td>
                      <td className="py-4 text-[9px] font-mono text-amber-500">+{tx.platformFee}</td>
                      <td className="py-4 text-[9px] font-mono text-green-400">+{tx.artistShare}</td>
                      <td className="py-4">
                        <p className="text-[7px] font-mono text-muted-foreground">{tx.recipientAddress.slice(0, 6)}...{tx.recipientAddress.slice(-4)}</p>
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
