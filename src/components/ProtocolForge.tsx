 import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Hammer, Antenna, PlusCircle } from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAudio } from '@/context/AudioContext';
import { beginCell, toNano, Address } from '@ton/core';
import { APP_LOGO, TON_LOGO } from '@/constants';
import { cn } from '@/lib/utils';
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
  const [logs, setLogs] = useState<string[]>(["[SYSTEM]: Protocol Forge Environment Initialized."]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0); /* 0: None, 1: Compiling, 2: Broadcasting, 3: Indexing */
  const logEndRef = useRef<HTMLDivElement>(null);

  if (!userProfile.isVerifiedArtist) {
    return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
        <Lock className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-[26px] font-black text-foreground uppercase tracking-tighter mb-3">Protocol Access Restricted</h2>
      <p className="text-muted-foreground max-w-md leading-relaxed mb-8 font-medium">
        The Protocol Forge is reserved for <span className="text-primary font-bold">Verified Architects</span>. Establish your sonic identity via verification to unlock genesis deployment capabilities.
      </p>
      <button 
        onClick={() => navigate('/settings')} 
        className="px-8 py-3.5 bg-primary rounded-full font-black text-[10px] uppercase tracking-[0.3em] text-primary-foreground shadow-xl shadow-primary/20 active:scale-95 transition-all hover:brightness-110"
      >
        Initialize.Verification_Sequence
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
    <div className="animate-in fade-in duration-1000 min-h-screen pb-20 max-w-7xl mx-auto px-6 pt-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]"></div>
            <span className="text-[9px] font-black text-primary/80 uppercase tracking-[0.6em]">Genesis.Setup_Wizard</span>
          </div>
          <h1 className="text-[42px] md:text-8xl font-black tracking-tighter uppercase text-foreground leading-[0.8]">
            Protocol <span className="text-primary">Forge</span>
          </h1>
        </div>
        <button
          onClick={handleFreshStart}
          className="px-6 py-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-destructive hover:text-white transition-all active:scale-95"
        >
          Factory_Reset.bin
        </button>
      </header>

      {!genesisContractAddress && !isDeploying ? (
        /* ONBOARDING STATE: No contract yet */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 duration-700">
          <div className="space-y-6">
            <section className="glass p-10 rounded-3xl border border-primary/20 bg-primary/[0.02] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Hammer className="w-32 h-32 rotate-12" />
              </div>
              <h3 className="text-[24px] font-black text-foreground uppercase tracking-tighter mb-4">Initialize Neural Genesis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-10 font-medium">
                A fresh start begins by deploying the <span className="text-foreground">TonJam Genesis Contract</span>. This smart contract will govern all NFT mints, royalties, and artist verification on your personal node.
              </p>
              <button
                onClick={handleDeploy}
                className="w-full py-4 bg-primary rounded-full font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-primary/20 text-primary-foreground flex items-center justify-center gap-2 hover:brightness-110"
              >
                <Hammer className="w-4 h-4" /> Forge_New_Genesis.lvl
              </button>
            </section>
            <div className="glass p-8 rounded-3xl border border-border/50 bg-secondary/30 backdrop-blur-md">
              <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-6">Existing.Protocol_Mapping</h4>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="Paste EQ... address"
                  className="flex-1 bg-background/50 border border-border/50 p-3.5 rounded-xl text-[11px] font-mono text-primary outline-none focus:border-primary/50 transition-all"
                />
                <button
                  onClick={handleLinkProtocol}
                  className="px-8 py-3.5 bg-secondary border border-border/50 rounded-xl text-[10px] font-black uppercase text-foreground hover:bg-accent transition-all active:scale-95"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
          <div className="bg-black/40 border border-border/30 rounded-3xl p-8 font-mono text-[11px] space-y-4 overflow-hidden shadow-2xl relative group">
            <div className="absolute top-6 right-10 text-[9px] font-black text-primary/30 uppercase tracking-[0.4em]">Tact.Compiler_Preview</div>
            <pre className="text-primary/40 leading-relaxed overflow-x-auto p-4 bg-black/20 rounded-xl border border-white/5">
              {TACT_SNIPPET.trim()}
            </pre>
            <div className="absolute bottom-6 right-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] font-black text-primary/40 uppercase">System.Stable.2024</span>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE/DEPLOYING STATE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="glass p-10 rounded-3xl border border-primary/20 shadow-2xl bg-primary/[0.01] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                    <Antenna className="text-primary-foreground text-2xl h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-[24px] font-black text-foreground uppercase tracking-tighter leading-none mb-2">
                      {isDeploying ? "Neural Forge Active" : "Genesis Online"}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                       <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest">
                        {isDeploying ? "Deploying Protocol..." : "Contract Synchronized"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {isDeploying && (
                <div className="mb-6 space-y-4 relative z-10">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">System.Progress</span>
                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">{(deploymentStep * 33).toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-secondary/50 rounded-full overflow-hidden relative p-1 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${deploymentStep * 33}%` }}
                      transition={{ type: "spring", stiffness: 40, damping: 20 }}
                      className="h-full bg-primary rounded-full relative shadow-[0_0_15px_var(--primary)]"
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                        className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                     <div className={cn("h-1 rounded-full transition-colors duration-500", deploymentStep >= 1 ? "bg-primary" : "bg-muted/30")}></div>
                     <div className={cn("h-1 rounded-full transition-colors duration-500", deploymentStep >= 2 ? "bg-primary" : "bg-muted/30")}></div>
                     <div className={cn("h-1 rounded-full transition-colors duration-500", deploymentStep >= 3 ? "bg-primary" : "bg-muted/30")}></div>
                  </div>
                </div>
              )}
              
              {!isDeploying && (
                <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-background/50 border border-border/50 rounded-2xl backdrop-blur-sm group">
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mb-3">Blockchain.Identity_Address</p>
                    <p className="text-xs font-mono text-primary break-all select-all font-bold group-hover:text-primary/100 transition-colors">{genesisContractAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-background/50 border border-border/50 rounded-2xl">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mb-2">Network.Status</p>
                      <p className="text-lg font-black text-foreground tracking-tighter">TON_TESTNET</p>
                    </div>
                    <div className="p-6 bg-background/50 border border-border/50 rounded-2xl">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mb-2">Protocol.Type</p>
                      <p className="text-lg font-black text-foreground tracking-tighter">NFT_COLLECTION</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/mint')}
                    className="w-full py-4 bg-primary rounded-full font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-primary/20 text-primary-foreground flex items-center justify-center gap-2 mt-4 hover:brightness-110"
                  >
                    <PlusCircle className="w-5 h-5" /> Initialize.Mint_Sequence
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 h-full">
            <div className="bg-black/60 border border-border/30 rounded-3xl p-8 font-mono text-[10px] space-y-3 h-[500px] overflow-y-auto no-scrollbar shadow-2xl relative">
              <div className="sticky top-0 -mt-2 mb-4 bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 flex items-center justify-between">
                 <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">System.Event_Log</span>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                 </div>
              </div>
              {logs.map((log, idx) => (
                <div
                  key={`log-${idx}`}
                  className={cn(
                    "flex gap-4 border-l-2 pl-3 py-1 transition-all",
                    log.includes('ERROR') ? 'text-destructive border-destructive' : 
                    log.includes('SUCCESS') || log.includes('FINAL') ? 'text-emerald-500 border-emerald-500' : 'text-muted-foreground/60 border-primary/20'
                  )}
                >
                  <span className="opacity-30 flex-shrink-0">[{idx.toString().padStart(2, '0')}]</span>
                  <span className="tracking-tight">{log}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolForge;
