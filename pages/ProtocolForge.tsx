
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAudio } from '../context/AudioContext';
import { beginCell, toNano, Address } from '@ton/core';
import { APP_LOGO, TON_LOGO } from '../constants';
import MintModal from '../components/MintModal';

const TACT_SNIPPET = `
contract TonJamGenesis {
  owner: Address;
  collection_content: Cell;
  next_item_index: Int;

  init(owner: Address, content: Cell) {
    self.owner = owner;
    self.collection_content = content;
    self.next_item_index = 0;
  }

  receive("Mint") {
    let ctx: Context = context();
    require(ctx.sender == self.owner, "Unauthorized");
  }
}
`;

const ProtocolForge: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, genesisContractAddress, setGenesisContractAddress, resetProtocol, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [inputAddress, setInputAddress] = useState('');
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM]: Protocol Forge Environment Initialized."
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0); // 0: None, 1: Compiling, 2: Broadcasting, 3: Indexing
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  if (!userProfile.isVerifiedArtist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
          <i className="fas fa-lock text-blue-500 text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Protocol Access Restricted</h2>
        <p className="text-white/40 max-w-md leading-relaxed mb-10">
          The Protocol Forge is reserved for <span className="text-blue-500 font-black">Verified Artists</span>. 
          Establish your sonic identity via Spotify or TON verification to unlock genesis deployment capabilities.
        </p>
        <button 
          onClick={() => navigate('/settings')}
          className="px-10 py-4 electric-blue-bg rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          Initialize Verification
        </button>
      </div>
    );
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}]: ${msg}`]);
  };

  const handleFreshStart = () => {
    if (confirm("This will clear your linked contract address and reset the forge. Continue?")) {
      resetProtocol();
      setDeploymentStep(0);
      setLogs(["[SYSTEM]: Factory Reset Complete. Standing by for Genesis deployment."]);
      addNotification("Environment Refreshed", "warning");
    }
  };

  const handleLinkProtocol = () => {
    if (!inputAddress) {
      addNotification("Please enter a contract address.", "warning");
      return;
    }

    try {
      Address.parse(inputAddress);
      setIsSyncing(true);
      addLog(`Connecting to existing protocol: ${inputAddress.slice(0, 12)}...`);
      
      setTimeout(() => {
        setGenesisContractAddress(inputAddress);
        setIsSyncing(false);
        addNotification("Protocol Linked Successfully", "success");
        addLog(`SUCCESS: Local relay synchronized with Genesis Contract.`);
      }, 1500);
    } catch (e) {
      addNotification("Invalid TON address format.", "error");
      addLog("ERROR: Pulse frequency mismatch. Invalid address.");
    }
  };

  const handleDeploy = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to forge protocol.", "warning");
      return;
    }

    setIsDeploying(true);
    setDeploymentStep(1);
    addLog("Phase 1: Initializing Tact Compiler...");
    addLog("Compiling TonJamGenesis.tact...");
    
    setTimeout(async () => {
      setDeploymentStep(2);
      addLog("Phase 2: Generating BoC (Bag of Cells)...");
      addLog("Signing transaction for contract deployment...");
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            address: "kQDNv_tD_N0R6K6u5-pXy8M4QnO-vD_N0R6K6u5-pXy8M88",
            amount: toNano("0.1").toString(),
            payload: beginCell().storeUint(0, 32).storeStringTail("TONJAM_GENESIS_DEPLOY").endCell().toBoc().toString('base64'),
          },
        ],
      };

      try {
        await tonConnectUI.sendTransaction(transaction);
        setDeploymentStep(3);
        addLog("Phase 3: Transaction broadcasted to TON Testnet.");
        
        const mockNewAddress = "EQ_TJ_GENESIS_" + Math.random().toString(16).slice(2, 10).toUpperCase();
        addLog(`Indexing new address: ${mockNewAddress}`);
        
        setTimeout(() => {
          setGenesisContractAddress(mockNewAddress);
          setIsDeploying(false);
          setDeploymentStep(0);
          addNotification("Genesis Protocol Online", "success");
          addLog("[FINAL]: Protocol synchronization complete.");
        }, 2500);

      } catch (e) {
        addLog("ERROR: Deployment aborted by user or timeout.");
        setIsDeploying(false);
        setDeploymentStep(0);
      }
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-1000 min-h-screen pb-40 max-w-7xl mx-auto px-6 pt-12">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.6em]">Genesis Setup Wizard</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
            Protocol <span className="text-blue-500">Forge</span>
          </h1>
        </div>
        
        <button 
          onClick={handleFreshStart}
          className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Factory Reset Protocol
        </button>
      </header>

      {!genesisContractAddress && !isDeploying ? (
        /* ONBOARDING STATE: No contract yet */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in zoom-in-95 duration-700">
          <div className="space-y-12">
            <section className="glass p-12 rounded-[3.5rem] border-blue-500/20 border-2 bg-blue-500/[0.03] shadow-2xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Initialize Neural Genesis</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-10">
                A fresh start begins by deploying the <span className="text-white">TonJam Genesis Contract</span>. This smart contract will govern all NFT mints, royalties, and artist verification on your personal node.
              </p>
              <button 
                onClick={handleDeploy}
                className="w-full py-6 electric-blue-bg rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 text-white flex items-center justify-center gap-4"
              >
                <i className="fas fa-hammer"></i> Forge New Genesis
              </button>
            </section>

            <div className="glass p-10 rounded-[2.5rem] border-white/10 border">
              <h4 className="text-sm font-black text-white/60 uppercase tracking-widest mb-6">Already have a contract?</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="Paste EQ... address" 
                  className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-[10px] font-mono text-blue-400 outline-none focus:border-blue-500"
                />
                <button 
                  onClick={handleLinkProtocol}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all"
                >
                  Link
                </button>
              </div>
            </div>
          </div>

          <div className="bg-black border border-white/10 rounded-[3rem] p-10 font-mono text-[11px] space-y-4 overflow-hidden shadow-2xl relative">
             <div className="absolute top-4 right-8 text-[8px] font-black text-white/10 uppercase tracking-widest">Compiler Preview</div>
             <pre className="text-blue-400/50 leading-loose">
               {TACT_SNIPPET.trim()}
             </pre>
          </div>
        </div>
      ) : (
        /* ACTIVE/DEPLOYING STATE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="glass p-10 rounded-[3rem] border-blue-500/20 border-2 shadow-2xl bg-blue-500/[0.02]">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                        <i className="fas fa-satellite-dish text-white text-xl"></i>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                          {isDeploying ? "Neural Forge Active" : "Genesis Online"}
                        </h3>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">
                          {isDeploying ? "Deploying Protocol..." : "Contract Synchronized"}
                        </p>
                     </div>
                  </div>
               </div>

               {isDeploying && (
                 <div className="mb-10 space-y-6">
                    <div className="flex justify-between items-center px-2">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Progress</span>
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{deploymentStep * 33}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${deploymentStep * 33}%` }}></div>
                    </div>
                 </div>
               )}

               {!isDeploying && (
                 <div className="space-y-6">
                    <div className="p-6 bg-black rounded-2xl border border-white/10">
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Deployed Address</p>
                       <p className="text-sm font-mono text-blue-400 break-all select-all">{genesisContractAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-black rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Network</p>
                          <p className="text-xl font-black text-white tracking-tighter">TON TESTNET</p>
                       </div>
                       <div className="p-6 bg-black rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Type</p>
                          <p className="text-xl font-black text-white tracking-tighter">NFT COLLECTION</p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsMintModalOpen(true)}
                      className="w-full py-6 electric-blue-bg rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 text-white flex items-center justify-center gap-4 mt-4"
                    >
                      <i className="fas fa-plus-circle"></i> Mint New Track Protocol
                    </button>
                  </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-black border border-white/10 rounded-[2.5rem] p-8 font-mono text-[10px] space-y-2 h-[500px] overflow-y-auto no-scrollbar shadow-2xl">
                {logs.map((log, i) => (
                  <div key={i} className={`${log.includes('ERROR') ? 'text-red-500' : log.includes('SUCCESS') ? 'text-green-500' : 'text-white/40'}`}>
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
             </div>
          </div>
        </div>
      )}
      
      {isMintModalOpen && <MintModal onClose={() => setIsMintModalOpen(false)} />}
    </div>
  );
};

export default ProtocolForge;
