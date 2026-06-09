import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gavel, 
  MessageSquare, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  BarChart3,
  ChevronRight,
  Info,
  Activity
} from 'lucide-react';
import { governanceService } from '@/services/governanceService';
import { treasuryService } from '@/services/treasuryService';
import { Proposal, Vote } from '@/types';
import { auth } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import TreasuryDashboard from '@/components/TreasuryDashboard';

const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = governanceService.getUserVote(proposal.id, (vote) => {
        setUserVote(vote);
      });
      return () => unsubscribe();
    }
  }, [proposal.id]);

  const handleVote = async (choice: 'for' | 'against') => {
    if (!auth.currentUser) {
      toast.error('Please sign in to vote');
      return;
    }
    
    setIsVoting(true);
    try {
      await governanceService.castVote(proposal.id, choice);
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    passed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    executed: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  const categoryIcons: Record<string, any> = {
    'Feature': Plus,
    'Platform Change': Gavel,
    'Artist Spotlight': Users,
    'Treasury': TrendingUp
  };

  const Icon = categoryIcons[proposal.category] || Info;

  return (
    <motion.div 
      layout
      className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[proposal.status]}`}>
                  {proposal.status}
                </span>
                <span className="text-xs text-muted-foreground font-medium">• {proposal.category}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mt-1 group-hover:text-primary transition-colors">{proposal.title}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>Ends {formatDistanceToNow(new Date(proposal.endTime), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {proposal.description}
        </p>

        {/* Voting Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-blue-500">For ({proposal.forVotes})</span>
            <span className="text-red-500">Against ({proposal.againstVotes})</span>
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${forPercentage}%` }}
              className="h-full bg-blue-500" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${againstPercentage}%` }}
              className="h-full bg-red-500" 
            />
          </div>
        </div>

        {/* Voting Actions */}
        <div className="pt-4 flex items-center gap-3">
          {userVote ? (
            <div className="flex-1 py-3 px-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center gap-2 text-primary font-bold text-sm">
              <CheckCircle2 size={16} />
              You voted {userVote.choice.toUpperCase()}
            </div>
          ) : (
            <>
              <button 
                onClick={() => handleVote('for')}
                disabled={isVoting || proposal.status !== 'active'}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Vote For
              </button>
              <button 
                onClick={() => handleVote('against')}
                disabled={isVoting || proposal.status !== 'active'}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Vote Against
              </button>
            </>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-[0.1em]">
          <span>Proposed by {proposal.creatorName}</span>
          <span className="flex items-center gap-1">
             <MessageSquare size={10} />
             Discussion
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const CreateProposalModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Feature');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      await governanceService.createProposal({
        title,
        description,
        category,
        status: 'active'
      });
      toast.success('Proposal submitted successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border p-8 rounded-3xl shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
          <XCircle size={24} />
        </button>
        
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Submit Proposal</h2>
            <p className="text-sm text-muted-foreground">Power to the players. Propose a change to the TonJam protocol.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Increase artist royalties"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary/50 outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary/50 outline-none transition-all text-sm font-medium"
              >
                <option value="Feature">New Feature</option>
                <option value="Platform Change">Platform Change</option>
                <option value="Artist Spotlight">Artist Spotlight</option>
                <option value="Treasury">Treasury</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your proposal in detail..."
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary/50 outline-none transition-all text-sm font-medium h-32 resize-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Plus size={18} />
                  Submit to DAO
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Governance: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'passed' | 'rejected' | 'treasury'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { userProfile } = useAuth();

  useEffect(() => {
    const unsubscribe = governanceService.getProposals((data) => {
      setProposals(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredProposals = proposals.filter(p => {
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = [
    { label: 'Active Proposals', value: proposals.filter(p => p.status === 'active').length, icon: Activity },
    { label: 'Total Votes', value: proposals.reduce((acc, p) => acc + p.forVotes + p.againstVotes, 0), icon: BarChart3 },
    { label: 'Treasury Balance', value: '...', icon: TrendingUp, id: 'treasury-balance' },
  ];

  useEffect(() => {
    const unsubscribe = treasuryService.subscribeToStats((data) => {
      // We'll update the stats array dynamically or just use a state for treasury balance
    });
    return () => unsubscribe();
  }, []);

  const [treasuryBalance, setTreasuryBalance] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = treasuryService.subscribeToStats((data) => {
      setTreasuryBalance(data.balance);
    });
    return () => unsubscribe();
  }, []);

  const displayStats = [
    { label: 'Active Proposals', value: proposals.filter(p => p.status === 'active').length, icon: Activity },
    { label: 'Total Votes', value: proposals.reduce((acc, p) => acc + p.forVotes + p.againstVotes, 0), icon: BarChart3 },
    { label: 'Treasury Balance', value: treasuryBalance !== null ? `${treasuryBalance.toFixed(2)} TON` : 'Loading...', icon: TrendingUp },
  ];

  return (
    <div className="page-container w-full space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-background border border-primary/20 p-8 lg:p-12 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        
        <div className="relative z-10 space-y-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.2em]">
              <Gavel size={14} />
              Decentralized Governance
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-tight text-foreground">
              TonJam <span className="text-primary">DAO</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              The future of the protocol is in your hands. Propose, debate, and vote on the core parameters and features of the TonJam ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group/btn text-sm"
              >
                <Plus className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                Submit Proposal
              </button>
              <button 
                className="px-8 py-4 bg-muted/30 hover:bg-muted text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-3 text-sm border border-border"
              >
                <Info className="h-5 w-5" />
                Whitepaper
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full md:w-64">
            {displayStats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-black text-foreground">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-1">
             <Filter size={16} className="text-muted-foreground mr-2" />
             {['all', 'active', 'passed', 'rejected', 'treasury'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-transparent' : 'text-muted-foreground border border-[#C0C0C0]/35 hover:bg-muted/50 hover:border-[#C0C0C0]/60'}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          {activeTab !== 'treasury' && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-card border border-border focus:border-primary/50 outline-none transition-all text-sm font-medium"
              />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'treasury' ? (
            <motion.div
              key="treasury"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TreasuryDashboard />
            </motion.div>
          ) : (
            <motion.div 
              key="proposals"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground">
                    <Search size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">No proposals found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                    className="px-6 py-2 bg-muted/50 rounded-full text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Governance;
