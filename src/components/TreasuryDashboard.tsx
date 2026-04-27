import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Zap, 
  ShieldCheck,
  TrendingUp,
  PieChart,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { treasuryService } from '@/services/treasuryService';
import { TreasuryStats, GrantAllocation } from '@/types';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="p-6 rounded-3xl bg-card border border-border/50 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700`}></div>
    <div className="relative z-10 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AllocationRow = ({ allocation }: { allocation: GrantAllocation }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/50 group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${allocation.category === 'artist_grant' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
        {allocation.category === 'artist_grant' ? <History size={18} /> : <Zap size={18} />}
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">Grant to {allocation.recipientName}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
          {allocation.category.replace('_', ' ')} • {format(new Date(allocation.timestamp), 'MMM dd, yyyy')}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-foreground">-{allocation.amount} TON</p>
      <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold uppercase">
        <ShieldCheck size={10} />
        Distributed
      </div>
    </div>
  </div>
);

const TreasuryDashboard: React.FC = () => {
  const [stats, setStats] = useState<TreasuryStats | null>(null);
  const [allocations, setAllocations] = useState<GrantAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let statsUnsubscribe: () => void;
    let allocationsUnsubscribe: () => void;

    const init = async () => {
      statsUnsubscribe = treasuryService.subscribeToStats((data) => {
        setStats(data);
        setLoading(false);
      });

      allocationsUnsubscribe = treasuryService.getRecentAllocations((data) => {
        setAllocations(data);
      });
    };

    init();

    return () => {
      if (statsUnsubscribe) statsUnsubscribe();
      if (allocationsUnsubscribe) allocationsUnsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Treasury Balance" 
          value={`${stats?.balance?.toFixed(2) || '0.00'} TON`} 
          icon={DollarSign} 
          color="primary" 
        />
        <StatCard 
          title="Total Fees Collected" 
          value={`${stats?.totalFeesCollected?.toFixed(2) || '0.00'} TON`} 
          icon={ArrowUpRight} 
          color="green" 
        />
        <StatCard 
          title="Total Grants Allocated" 
          value={`${stats?.totalGrantsAllocated?.toFixed(2) || '0.00'} TON`} 
          icon={ArrowDownLeft} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart Placeholder / Distribution Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-[32px] bg-card border border-border shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Treasury Overview</h3>
                <p className="text-xs text-muted-foreground font-medium">Platform growth and resource allocation history</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                Real-time
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Resilience</p>
                  <p className="text-lg font-black text-foreground">98.4%</p>
                </div>
                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "98.4%" }}
                    className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]" 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Funding safety margin calculated based on projected operational costs for the next 24 months.
                </p>
              </div>

              <div className="space-y-4 text-center md:text-left flex flex-col justify-center">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">DAO Controlled</p>
                    <p className="text-xs text-muted-foreground">Governed by TON Jam holders</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50 grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Burned', value: '42K JAM', icon: Zap },
                 { label: 'Staked', value: '1.2M JAM', icon: TrendingUp },
                 { label: 'Artists', value: '8.5K', icon: User },
                 { label: 'Next Grant', value: 'Jun 15', icon: Calendar },
               ].map(item => (
                 <div key={item.label} className="space-y-1">
                   <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                     <item.icon size={10} />
                     {item.label}
                   </p>
                   <p className="text-xs font-black text-foreground">{item.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Recent Allocations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
               <History size={16} className="text-primary" />
               Recent Grants
            </h3>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="bg-card border border-border rounded-[32px] p-2 space-y-1">
            {allocations.length > 0 ? (
              allocations.map((allocation) => (
                <AllocationRow key={allocation.id} allocation={allocation} />
              ))
            ) : (
              <div className="py-20 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground opacity-50">
                   <ArrowDownLeft size={20} />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No grants yet</p>
              </div>
            )}
            
            {/* Sample empty state filler if needed */}
            {allocations.length > 0 && allocations.length < 5 && (
               <div className="p-4 rounded-2xl bg-muted/5 border border-dashed border-border/50 mt-2">
                  <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-widest">Your proposal could be next</p>
               </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 space-y-3">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <PieChart size={20} />
             </div>
             <p className="text-sm font-bold text-foreground">Submit a Grant Request</p>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Have a project that benefits the TonJam ecosystem? Submit a treasury proposal.
             </p>
             <button className="w-full py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
                Create Proposal
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
