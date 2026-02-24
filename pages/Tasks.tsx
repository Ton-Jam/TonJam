
import React, { useState } from 'react';
import { TJ_COIN_ICON, MOCK_USER } from '../constants';
import { useAudio } from '../context/AudioContext';

interface Task {
  id: string;
  title: string;
  reward: number;
  description: string;
  completed: boolean;
  type: 'daily' | 'alpha' | 'streaming' | 'social';
  progress?: number;
  target?: number;
  dueDate?: string;
}

const Tasks: React.FC = () => {
  const { addNotification } = useAudio();
  const [balance, setBalance] = useState(1250);
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard' | 'staking'>('quests');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward: 50,
    type: 'daily' as Task['type'],
    dueDate: ''
  });

  const [taskList, setTaskList] = useState<Task[]>([
    { id: '1', title: 'Daily Check-in', reward: 10, description: 'Return to TonJam every 24h', completed: false, type: 'daily', dueDate: '2026-02-23' },
    { id: '2', title: 'Vibe Creator', reward: 25, description: 'Post your first Jam in JamSpace', completed: true, type: 'social' },
    { id: '3', title: 'Sync 5 Tracks', reward: 50, description: 'Listen to 5 full tracks today', completed: false, type: 'streaming', progress: 2, target: 5, dueDate: '2026-02-22' },
    { id: '4', title: 'NFT Drop Alert', reward: 200, description: 'Join the whitelist for Neon Voyager Vol. II', completed: false, type: 'alpha', dueDate: '2026-03-01' },
    { id: '5', title: 'Spotify Bridge', reward: 40, description: 'Verify your artist identity', completed: false, type: 'social' },
    { id: '6', title: 'Viral Mix', reward: 100, description: 'Get 50+ likes on a shared playlist', completed: false, type: 'streaming', dueDate: '2026-02-28' },
    { id: '7', title: 'Early Adopter', reward: 500, description: 'Hold at least 3 Genesis NFTs', completed: false, type: 'alpha', progress: 1, target: 3 },
    { id: '8', title: 'Network Node', reward: 150, description: 'Invite 3 friends to the network', completed: false, type: 'social', progress: 0, target: 3, dueDate: '2026-03-15' },
  ]);

  const leaderboard = [
    { rank: 1, name: 'NeonVoyager', score: 45200, avatar: 'https://picsum.photos/100/100?seed=1' },
    { rank: 2, name: 'ByteBeat', score: 38100, avatar: 'https://picsum.photos/100/100?seed=2' },
    { rank: 3, name: 'CryptoPioneer', score: 32400, avatar: 'https://picsum.photos/100/100?seed=3' },
    { rank: 4, name: 'LunaRay', score: 29800, avatar: 'https://picsum.photos/100/100?seed=4' },
    { rank: 5, name: 'EchoPhase', score: 25600, avatar: 'https://picsum.photos/100/100?seed=5' },
  ];

  const handleClaim = (taskId: string, reward: number) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    setBalance(prev => prev + reward);
    addNotification(`+${reward} TJ Coins synced!`, 'success');
  };

  const handleClaimAll = () => {
    const claimableTasks = taskList.filter(t => !t.completed && (t.progress === undefined || t.progress >= (t.target || 0)));
    if (claimableTasks.length === 0) {
      addNotification("No rewards ready for sync.", "info");
      return;
    }
    
    const totalReward = claimableTasks.reduce((acc, t) => acc + t.reward, 0);
    setTaskList(prev => prev.map(t => {
      const isClaimable = !t.completed && (t.progress === undefined || t.progress >= (t.target || 0));
      return isClaimable ? { ...t, completed: true } : t;
    }));
    setBalance(prev => prev + totalReward);
    addNotification(`+${totalReward} TJ Coins synced from ${claimableTasks.length} tasks!`, 'success');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || 'Custom community quest',
      reward: newTask.reward,
      type: newTask.type,
      completed: false,
      dueDate: newTask.dueDate || undefined
    };

    setTaskList(prev => [task, ...prev]);
    setShowCreateModal(false);
    setNewTask({ title: '', description: '', reward: 50, type: 'daily', dueDate: '' });
    addNotification("New quest forged in the network!", "success");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-5xl mx-auto px-1 md:px-0">
      {/* Dynamic Header - Refined for Mobile */}
      <div className="relative overflow-hidden bg-[#0A0A0A] rounded-2xl p-6 md:p-10 border-yellow-500/20 border mb-8 md:mb-12 shadow-2xl group/header">
        <div className="absolute -top-32 -right-32 w-64 md:w-96 h-64 md:h-96 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none group-hover/header:bg-yellow-500/20 transition-all duration-1000"></div>
        <div className="absolute -bottom-32 -left-32 w-64 md:w-96 h-64 md:h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none group-hover/header:bg-blue-500/10 transition-all duration-1000"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
            <div className="relative group">
              <img 
                src={TJ_COIN_ICON} 
                className="w-24 h-24 md:w-36 md:h-36 object-contain animate-spin-slow" 
                alt="TJ Coin" 
              />
            </div>
            <div>
              <p className="text-yellow-500/60 text-[9px] md:text-xs font-black uppercase tracking-[0.4em] mb-1 md:mb-2">Global Balance</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white">{balance.toLocaleString()}</h2>
                <span className="text-xl md:text-2xl font-black text-yellow-500">TJ</span>
              </div>
              <div className="flex justify-center md:justify-start gap-2 md:gap-4 mt-4 md:mt-6">
                 <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">12D Streak</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                   <i className="fas fa-bolt text-blue-400 text-[8px]"></i>
                   <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">1.45x Buff</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-64">
             <button className="w-full py-4 electric-blue-bg rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                Redeem
             </button>
             <button className="w-full py-4 bg-white/10 border border-white/10 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest text-white/60 hover:bg-white/20 transition-all">
                History
             </button>
          </div>
        </div>
      </div>

      {/* Tabs - Mobile Responsive Gaps */}
      <div className="flex items-center justify-between md:justify-center gap-4 md:gap-12 mb-8 md:mb-12 border-b border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'quests', label: 'Quests', icon: 'fa-gem' },
          { id: 'leaderboard', label: 'Masters', icon: 'fa-trophy' },
          { id: 'staking', label: 'Vault', icon: 'fa-vault' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 md:pb-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all relative flex items-center gap-2 md:gap-3 whitespace-nowrap ${activeTab === tab.id ? 'text-yellow-500' : 'text-white/20 hover:text-white'}`}
          >
            <i className={`fas ${tab.icon} text-[9px]`}></i>
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'quests' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-8 px-2 md:px-0">
            <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">Available Quests</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2 hover:bg-blue-500/20 transition-all"
              >
                <i className="fas fa-plus text-[8px] text-blue-400"></i>
                <span className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">Forge Quest</span>
              </button>
              <button 
                onClick={handleClaimAll}
                className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors border-b border-blue-500/20 pb-0.5"
              >
                Sync All Rewards
              </button>
              <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                <span className="text-[8px] md:text-[10px] font-black text-yellow-500 uppercase tracking-widest">Live Drops</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {taskList.map(task => (
              <div 
                key={task.id} 
                className={`bg-[#0A0A0A] rounded-xl p-5 md:p-8 border transition-all flex flex-col lg:flex-row lg:items-center gap-4 md:gap-8 group/card ${task.completed ? 'opacity-30 border-white/5' : 'border-white/10 hover:border-yellow-500/40 hover:bg-white/[0.02] shadow-xl'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 transition-transform group-hover/card:scale-110 ${task.completed ? 'bg-white/5' : 'bg-yellow-500/10 text-yellow-500 shadow-inner'}`}>
                    <i className={`fas ${task.type === 'daily' ? 'fa-calendar-day' : task.type === 'alpha' ? 'fa-bolt-lightning' : task.type === 'streaming' ? 'fa-headphones' : 'fa-users'}`}></i>
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm md:text-xl font-black uppercase truncate tracking-tight text-white">{task.title}</h4>
                      {task.type === 'alpha' && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[6px] md:text-[8px] font-black uppercase tracking-tighter animate-pulse border border-red-500/10 flex-shrink-0">ALPHA</span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-sm text-white/30 font-medium truncate mb-1">{task.description}</p>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-yellow-500/60">
                        <i className="far fa-clock text-[7px]"></i>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {task.progress !== undefined && task.target !== undefined && !task.completed && (
                  <div className="w-full lg:max-w-[120px] xl:max-w-xs">
                    <div className="flex justify-between text-[8px] font-black text-white/20 uppercase mb-1.5 tracking-widest">
                       <span>{task.progress}/{task.target}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full" 
                        style={{ width: `${(task.progress / task.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between lg:justify-end gap-6 md:gap-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="flex items-center gap-2">
                    <img src={TJ_COIN_ICON} className="w-5 h-5 md:w-6 md:h-6 object-contain" alt="" />
                    <span className="text-lg md:text-2xl font-black text-yellow-500">+{task.reward}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleClaim(task.id, task.reward)}
                    disabled={task.completed || (task.progress !== undefined && task.progress < (task.target || 0))}
                    className={`px-8 py-3 md:py-4 md:px-10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                      task.completed 
                        ? 'bg-white/5 text-white/20' 
                        : 'bg-yellow-500 text-black active:scale-95 shadow-lg shadow-yellow-500/10'
                    }`}
                  >
                    {task.completed ? 'Claimed' : 'Claim'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between mb-8 px-2 md:px-0">
            <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">Network Masters</h3>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Season 1 Relay</p>
          </div>

          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            {leaderboard.map((user, idx) => (
              <div 
                key={user.name} 
                className={`flex items-center justify-between p-6 md:p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all ${user.name === MOCK_USER.name ? 'bg-yellow-500/[0.03]' : ''}`}
              >
                <div className="flex items-center gap-6 md:gap-10">
                  <span className={`text-xl md:text-3xl font-black italic w-8 md:w-12 text-center ${idx < 3 ? 'text-yellow-500' : 'text-white/10'}`}>
                    {idx + 1}
                  </span>
                  <div className="relative">
                    <img src={user.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover border border-white/10" alt="" />
                    {idx === 0 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center border-2 border-black shadow-xl"><i className="fas fa-crown text-[8px] text-black"></i></div>}
                  </div>
                  <div>
                    <h4 className="text-sm md:text-xl font-black text-white uppercase tracking-tight">{user.name}</h4>
                    <p className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-widest">Level {Math.floor(user.score / 1000)} Architect</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-lg md:text-2xl font-black text-white tracking-tighter">{user.score.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-yellow-500">TJ</span>
                  </div>
                  <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">Total Resonance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'staking' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-10 rounded-2xl border-blue-500/20 border-2 bg-blue-500/[0.02] shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em]">Staking Protocol</h3>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-10">Lock your TJ Coins in the neural vault to earn passive yield and governance voting power.</p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Current APY</p>
                  <span className="text-4xl font-black text-white tracking-tighter">12.4%</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Total Staked</p>
                  <span className="text-4xl font-black text-white tracking-tighter">4.2M</span>
                </div>
              </div>

              <button className="w-full py-6 electric-blue-bg rounded-xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/20">
                Initialize Stake
              </button>
            </div>

            <div className="glass p-10 rounded-2xl border-white/5 border bg-[#0A0A0A] shadow-2xl">
              <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-8">Your Vault</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Locked Balance</span>
                  <span className="text-xl font-black text-white">0.00 TJ</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pending Rewards</span>
                  <span className="text-xl font-black text-green-500">0.00 TJ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Voting Weight</span>
                  <span className="text-xl font-black text-blue-500">0.00</span>
                </div>
              </div>
              <button disabled className="w-full py-6 bg-white/5 border border-white/10 rounded-xl font-black text-xs uppercase tracking-[0.4em] text-white/20 cursor-not-allowed">
                Claim Rewards
              </button>
            </div>
          </div>

          <div className="glass p-10 rounded-2xl border-white/5 border">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Staking History</h3>
            <div className="py-20 text-center">
              <i className="fas fa-history text-white/5 text-4xl mb-6"></i>
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">No staking events detected in the ledger.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Forge New Quest</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Quest Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quest name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:border-yellow-500/50 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:border-yellow-500/50 outline-none transition-all h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Reward (TJ)</label>
                  <input 
                    type="number" 
                    value={newTask.reward}
                    onChange={e => setNewTask(prev => ({ ...prev, reward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Quest Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'alpha', 'streaming', 'social'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewTask(prev => ({ ...prev, type }))}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${newTask.type === type ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-yellow-500 text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 active:scale-95 transition-all shadow-xl shadow-yellow-500/10 mt-4"
              >
                Forge Protocol
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
