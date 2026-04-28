 import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Hammer, Antenna, PlusCircle } from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAudio } from '@/context/AudioContext';
import { beginCell, toNano, Address } from '@ton/core';
import { APP_LOGO, TON_LOGO } from '@/constants';
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 -blue-500/20">
          <Lock className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-[26px] font-bold text-foreground uppercase tracking-tighter mb-2">Protocol Access Restricted</h2>
        <p className="text-muted-foreground max-w-md leading-relaxed mb-2">
          The Protocol Forge is reserved for <span className="text-blue-500 font-bold">Verified Artists</span>. Establish your sonic identity via Spotify or TON verification to unlock genesis deployment capabilities.
        </p>
        <button onClick={() => navigate('/settings')} className="px-2 py-2 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
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
    <div className="animate-in fade-in duration-1000 min-h-screen pb-2 max-w-7xl mx-auto px-2 pt-2">
      <header className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.6em]">Genesis Setup Wizard</span>
          </div>
          <h1 className="text-[32px] md:text-[92px] font-bold tracking-tighter uppercase text-foreground leading-none">
            Protocol <span className="text-blue-500">Forge</span>
          </h1>
        </div>
        <button
          onClick={handleFreshStart}
          className="px-2 py-2 bg-red-500/10 -red-500/30 text-red-500 rounded-[10px] text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-foreground transition-all"
        >
          Factory Reset Protocol
        </button>
      </header>

      {!genesisContractAddress && !isDeploying ? (
        /* ONBOARDING STATE: No contract yet */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 animate-in zoom-in-95 duration-700">
          <div className="space-y-2">
            <section className="glass p-2 rounded-[10px] -blue-500/20 bg-blue-500/[0.03] shadow-2xl">
              <h3 className="text-[20px] font-bold text-foreground uppercase tracking-tighter mb-2">Initialize Neural Genesis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                A fresh start begins by deploying the <span className="text-foreground">TonJam Genesis Contract</span>. This smart contract will govern all NFT mints, royalties, and artist verification on your personal node.
              </p>
              <button
                onClick={handleDeploy}
                className="w-full py-2 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] rounded-[10px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 text-white flex items-center justify-center gap-2"
              >
                <Hammer className="w-4 h-4" /> Forge New Genesis
              </button>
            </section>
            <div className="glass p-2 rounded-[10px] ">
              <h4 className="text-sm font-bold text-muted-foreground/80 uppercase tracking-widest mb-2">Already have a contract?</h4>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="Paste EQ... address"
                  className="flex-1 bg-background p-2 rounded-[10px] text-[10px] font-mono text-blue-400 outline-none focus:-blue-500"
                />
                <button
                  onClick={handleLinkProtocol}
                  className="px-2 py-2 bg-muted/50 rounded-[10px] text-[9px] font-bold uppercase text-foreground hover:bg-muted transition-all"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-[10px] p-2 font-mono text-[11px] space-y-2 overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-8 text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Compiler Preview</div>
            <pre className="text-blue-400/50 leading-loose">
              {TACT_SNIPPET.trim()}
            </pre>
          </div>
        </div>
      ) : (
        /* ACTIVE/DEPLOYING STATE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          <div className="lg:col-span-7 space-y-2">
            <div className="glass p-2 rounded-[10px] -blue-500/20 shadow-2xl bg-blue-500/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg">
                    <Antenna className="text-foreground text-xl" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-foreground uppercase tracking-tighter">
                      {isDeploying ? "Neural Forge Active" : "Genesis Online"}
                    </h3>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-2">
                      {isDeploying ? "Deploying Protocol..." : "Contract Synchronized"}
                    </p>
                  </div>
                </div>
              </div>
              {isDeploying && (
                <div className="mb-2 space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{deploymentStep * 33}%</span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${deploymentStep * 33}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                      className="h-full bg-blue-500 rounded-full relative"
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear",
                        }}
                        className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>
              )}
              {!isDeploying && (
                <div className="space-y-2">
                  <div className="p-2 bg-background rounded-[10px] ">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Deployed Address</p>
                    <p className="text-sm font-mono text-blue-400 break-all select-all">{genesisContractAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-background rounded-[10px] ">
                      <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Network</p>
                      <p className="text-xl font-bold text-foreground tracking-tighter">TON TESTNET</p>
                    </div>
                    <div className="p-2 bg-background rounded-[10px] ">
                      <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Type</p>
                      <p className="text-xl font-bold text-foreground tracking-tighter">NFT COLLECTION</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/mint')}
                    className="w-full py-2 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] rounded-[10px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 text-white flex items-center justify-center gap-2 mt-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Mint New Track Protocol
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-background rounded-[10px] p-2 font-mono text-[10px] space-y-2 h-[500px] overflow-y-auto no-scrollbar shadow-2xl">
              {logs.map((log, idx) => (
                <div
                  key={`log-${idx}`}
                  className={`${log.includes('ERROR') ? 'text-red-500' : log.includes('SUCCESS') ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  {log}
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
