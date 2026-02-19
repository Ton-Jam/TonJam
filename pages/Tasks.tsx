
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
}

const Tasks: React.FC = () => {
  const { addNotification } = useAudio();
  const [balance, setBalance] = useState(1250);
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard' | 'staking'>('quests');
  const [taskList, setTaskList] = useState<Task[]>([
    { id: '1', title: 'Daily Check-in', reward: 10, description: 'Return to TonJam every 24h', completed: false, type: 'daily' },
    { id: '2', title: 'Vibe Creator', reward: 25, description: 'Post your first Jam in JamSpace', completed: true, type: 'social' },
    { id: '3', title: 'Sync 5 Tracks', reward: 50, description: 'Listen to 5 full tracks today', completed: false, type: 'streaming', progress: 2, target: 5 },
    { id: '4', title: 'NFT Drop Alert', reward: 200, description: 'Join the whitelist for Neon Voyager Vol. II', completed: false, type: 'alpha' },
    { id: '5', title: 'Spotify Bridge', reward: 40, description: 'Verify your artist identity', completed: false, type: 'social' },
    { id: '6', title: 'Viral Mix', reward: 100, description: 'Get 50+ likes on a shared playlist', completed: false, type: 'streaming' },
  ]);

  const handleClaim = (taskId: string, reward: number) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    setBalance(prev => prev + reward);
    addNotification(`+${reward} TJ Coins synced!`, 'success');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-5xl mx-auto px-1 md:px-0">
      {/* Dynamic Header - Refined for Mobile */}
      <div className="relative overflow-hidden bg-[#0A0A0A] rounded-[3rem] p-6 md:p-10 border-yellow-500/20 border mb-8 md:mb-12 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-64 md:w-96 h-64 md:h-96 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
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
              <p className="text-yellow-500/60 text-[9px] md:text-xs font-black uppercase tracking-[0.4em] mb-1 md:mb-2 italic">Global Balance</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white">{balance.toLocaleString()}</h2>
                <span className="text-xl md:text-2xl font-black text-yellow-500 italic">TJ</span>
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
             <button className="w-full py-4 electric-blue-bg rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                Redeem
             </button>
             <button className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest text-white/60 hover:bg-white/20 transition-all">
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
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4 md:mb-8 px-2 md:px-0">
            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">Available Quests</h3>
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-[8px] md:text-[10px] font-black text-yellow-500 uppercase tracking-widest italic">Live Drops</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {taskList.map(task => (
              <div 
                key={task.id} 
                className={`bg-[#0A0A0A] rounded-[2.5rem] p-5 md:p-8 border transition-all flex flex-col lg:flex-row lg:items-center gap-4 md:gap-8 ${task.completed ? 'opacity-30 border-white/5' : 'border-white/10 hover:border-yellow-500/20 shadow-xl'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 ${task.completed ? 'bg-white/5' : 'bg-yellow-500/10 text-yellow-500 shadow-inner'}`}>
                    <i className={`fas ${task.type === 'daily' ? 'fa-calendar-day' : task.type === 'alpha' ? 'fa-bolt-lightning' : task.type === 'streaming' ? 'fa-headphones' : 'fa-users'}`}></i>
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm md:text-xl font-black italic uppercase truncate tracking-tight text-white">{task.title}</h4>
                      {task.type === 'alpha' && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[6px] md:text-[8px] font-black uppercase tracking-tighter animate-pulse border border-red-500/10 flex-shrink-0">ALPHA</span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-sm text-white/30 font-medium italic truncate">{task.description}</p>
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
                    <span className="text-lg md:text-2xl font-black text-yellow-500 italic">+{task.reward}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleClaim(task.id, task.reward)}
                    disabled={task.completed || (task.progress !== undefined && task.progress < (task.target || 0))}
                    className={`px-8 py-3 md:py-4 md:px-10 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
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

      {/* Other tabs omitted for brevity, but all buttons will now be curvy due to Tailwind's rounded-xl/full classes being effective again */}
    </div>
  );
};

export default Tasks;
