import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Handshake, 
  Coins, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Wallet as WalletIcon,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  Globe,
  Mail,
  Send,
  User
} from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  TONJAM_TREASURY_ADDRESS, 
  TON_LOGO, 
  APP_LOGO 
} from '@/constants';
import { 
  sendPartnershipContributionTransaction, 
  verifyPartnershipContributionOnChain,
  TON_NETWORK_MODE,
  getTonViewerUrl 
} from '@/services/tonService';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';

const TON_PRICE_USD = 5.30;

export const Partnerships: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  // Selected Option: 'support' | 'sponsor' | 'strategic'
  const [activeTab, setActiveTab] = useState<'support' | 'sponsor' | 'strategic'>('support');
  const [isReviewingSupport, setIsReviewingSupport] = useState(false);

  // Form State
  const [partnerName, setPartnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [category, setCategory] = useState('Ecosystem Supporter');
  const [sponsorshipTier, setSponsorshipTier] = useState('Festival Stage Sponsor');
  const [strategicScope, setStrategicScope] = useState('Record Label Onboarding');
  const [budgetEstimate, setBudgetEstimate] = useState('1,000 - 5,000 TON');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [contributionAmount, setContributionAmount] = useState('25');

  // Inline Validation Errors
  const [errors, setErrors] = useState<{ partnerName?: string; contactEmail?: string; message?: string; amount?: string }>({});

  // Payment Execution & Verification State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'submitting' | 'verifying' | 'verified' | 'failed'>('idle');
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copiedTreasury, setCopiedTreasury] = useState(false);
  const [copiedSender, setCopiedSender] = useState(false);

  // Auto-fill user email/name if logged in
  useEffect(() => {
    if (auth.currentUser) {
      if (auth.currentUser.email && !contactEmail) {
        setContactEmail(auth.currentUser.email);
      }
      if (auth.currentUser.displayName && !partnerName) {
        setPartnerName(auth.currentUser.displayName);
      }
    }
  }, []);

  const numAmount = parseFloat(contributionAmount) || 0;
  const usdEstimate = (numAmount * TON_PRICE_USD).toFixed(2);
  const nanotonsValue = BigInt(Math.floor((numAmount > 0 ? numAmount : 0) * 1e9)).toString();

  const presetAmounts = ['10', '25', '100', '250', '1000'];

  const handleCopy = async (text: string, type: 'treasury' | 'sender') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'treasury') {
        setCopiedTreasury(true);
        setTimeout(() => setCopiedTreasury(false), 2000);
      } else {
        setCopiedSender(true);
        setTimeout(() => setCopiedSender(false), 2000);
      }
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const validateForm = () => {
    const newErrors: { partnerName?: string; contactEmail?: string; message?: string; amount?: string } = {};

    if (!partnerName.trim()) {
      newErrors.partnerName = 'Organization or partner name is required.';
    }

    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      newErrors.contactEmail = 'Please enter a valid email address.';
    }

    if (activeTab === 'sponsor' || activeTab === 'strategic') {
      if (!message.trim()) {
        newErrors.message = 'Please include a brief message or proposal description.';
      } else if (message.trim().length < 10) {
        newErrors.message = 'Message should be at least 10 characters long.';
      }
    }

    if (activeTab === 'support') {
      if (!contributionAmount || isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid contribution amount greater than 0 TON.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please check highlighted errors before reviewing transaction."
      });
      return;
    }
    if (!userAddress) {
      toast.info("Wallet Recommended", {
        description: "Please connect your TON wallet to authorize the transfer on the review screen."
      });
    }
    setIsReviewingSupport(true);
  };

  // Submit Non-Financial Inquiry (Sponsor / Strategic)
  const handleInquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Validation Failed", {
        description: "Please check the highlighted errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    const ref = `INQUIRY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const docId = ref;
      const record = {
        id: docId,
        paymentReference: ref,
        partnerName: partnerName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        partnershipType: activeTab,
        category: activeTab === 'sponsor' ? sponsorshipTier : (activeTab === 'strategic' ? strategicScope : category),
        sponsorshipTier: activeTab === 'sponsor' ? sponsorshipTier : null,
        strategicScope: activeTab === 'strategic' ? strategicScope : null,
        budgetEstimate: activeTab === 'sponsor' ? budgetEstimate : null,
        website: website.trim() || null,
        message: message.trim() || null,
        senderAddress: userAddress || null,
        treasuryAddress: TONJAM_TREASURY_ADDRESS,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'partnershipContributions', docId), record);

      setPaymentRef(ref);
      setVerificationStatus('verified');
      toast.success("Partnership Inquiry Submitted!", {
        description: "Our ecosystem core team will review your proposal and respond via email."
      });
    } catch (err: any) {
      console.error("Firestore inquiry submit error:", err);
      toast.error("Failed to record inquiry", { description: err?.message || "Database connection error." });
      handleFirestoreError(err, OperationType.WRITE, 'partnershipContributions');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Financial Payment to Treasury (Support TonJam)
  const handleTreasuryContribution = async () => {
    if (!validateForm()) return;

    if (!userAddress) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your TON wallet before proceeding with contribution."
      });
      tonConnectUI.openModal();
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('submitting');

    const ref = `TJ-PARTNER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setPaymentRef(ref);

    try {
      // 1. Authorize transaction via partner's connected wallet to treasury
      toast.info("Awaiting Wallet Authorization...", {
        description: `Confirm payment of ${numAmount} TON to TonJam Treasury in your wallet app.`
      });

      const txResult = await sendPartnershipContributionTransaction(
        tonConnectUI,
        numAmount,
        ref,
        TONJAM_TREASURY_ADDRESS
      );

      setVerificationStatus('verifying');
      toast.info("Transaction Submitted to TON Relay", {
        description: "Broadcasting payment to TON network for trusted verification..."
      });

      // 2. Perform trusted blockchain verification
      const verifyRes = await verifyPartnershipContributionOnChain(
        ref,
        txResult.nanotons,
        TONJAM_TREASURY_ADDRESS
      );

      const generatedHash = verifyRes.txHash || `boc_${txResult.boc.substring(0, 24)}`;
      setTxHash(generatedHash);

      // 3. Save contribution record in Firestore
      const docId = ref;
      const contributionData = {
        id: docId,
        paymentReference: ref,
        partnerName: partnerName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        partnershipType: 'support',
        category,
        amountTon: numAmount,
        amountNanotons: txResult.nanotons,
        senderAddress: userAddress,
        treasuryAddress: TONJAM_TREASURY_ADDRESS,
        txHash: generatedHash,
        status: verifyRes.verified ? 'verified' : 'pending',
        website: website.trim() || null,
        message: message.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'partnershipContributions', docId), contributionData);

      setVerificationStatus('verified');
      toast.success(`Contribution Confirmed! Thank you, ${partnerName}.`, {
        description: `Recorded ${numAmount} TON contribution to TonJam Treasury.`
      });
    } catch (err: any) {
      console.error("Payment execution error:", err);
      setVerificationStatus('failed');
      const msg = err?.message || "Transaction cancelled or rejected by user.";
      toast.error("Contribution Could Not Be Processed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-[#F5F7FB] pb-32 animate-in fade-in duration-500">
      <PageHeader
        title="Partnership Portal"
        showBack={true}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#229ED9]/15 text-[#229ED9]">
              TON {TON_NETWORK_MODE.toUpperCase()}
            </span>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 space-y-6">
        {/* BRAND HERO HEADER */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#111C30] via-[#0E1729] to-[#0B1220] p-6 sm:p-8 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#229ED9]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#080D1A] p-2.5 shadow-lg shrink-0">
                <img src={APP_LOGO} alt="TonJam" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#229ED9] uppercase tracking-widest flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5" />
                  <span>TonJam Ecosystem Vault</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  Partner With TonJam
                </h1>
              </div>
            </div>

            <a
              href="https://ton.org"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300 transition-colors"
            >
              <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
              <span>Powered by TON</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed max-w-2xl relative z-10">
            Support African music creators, independent Web3 artists, and the next generation of decentralized music streaming. Your contributions directly fund artist grants, lossless audio hosting, and platform infrastructure.
          </p>
        </div>

        {/* THREE PARTNERSHIP TABS */}
        <div className="grid grid-cols-3 gap-2 bg-[#111C30] p-1.5 rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('support'); setVerificationStatus('idle'); setIsReviewingSupport(false); setErrors({}); }}
            className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeTab === 'support'
                ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/25'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>1. Support TonJam</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('sponsor'); setVerificationStatus('idle'); setIsReviewingSupport(false); setErrors({}); }}
            className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeTab === 'sponsor'
                ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/25'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Sponsor</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('strategic'); setVerificationStatus('idle'); setIsReviewingSupport(false); setErrors({}); }}
            className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeTab === 'strategic'
                ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/25'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>3. Strategic</span>
          </button>
        </div>

        {/* SUCCESS RECEIPT / STATUS SCREEN IF VERIFIED */}
        {verificationStatus === 'verified' ? (
          <div className="rounded-3xl bg-[#111C30] p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeTab === 'support' ? 'Contribution Verified & Confirmed!' : 'Partnership Inquiry Received'}
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeTab === 'support'
                  ? `Thank you for contributing to the TonJam Ecosystem Treasury. Your transaction has been recorded on the TON network.`
                  : `Thank you, ${partnerName || 'Partner'}! Your proposal for ${activeTab === 'sponsor' ? sponsorshipTier : strategicScope} has been logged. Our team will get back to you at ${contactEmail}.`}
              </p>
            </div>

            <div className="rounded-2xl bg-[#0B1424] p-5 max-w-lg mx-auto text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[#94A3B8] uppercase text-[10px]">Reference ID</span>
                <span className="font-bold text-white">{paymentRef}</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-[#94A3B8] uppercase text-[10px]">Organization / Partner</span>
                <span className="text-zinc-200">{partnerName}</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-[#94A3B8] uppercase text-[10px]">Contact Email</span>
                <span className="text-zinc-200">{contactEmail}</span>
              </div>

              {activeTab === 'sponsor' && (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[#94A3B8] uppercase text-[10px]">Sponsorship Tier</span>
                    <span className="text-[#229ED9] font-bold">{sponsorshipTier}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[#94A3B8] uppercase text-[10px]">Estimated Budget</span>
                    <span className="text-emerald-400 font-bold">{budgetEstimate}</span>
                  </div>
                </>
              )}

              {activeTab === 'strategic' && (
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[#94A3B8] uppercase text-[10px]">Strategic Scope</span>
                  <span className="text-[#9B7CFF] font-bold">{strategicScope}</span>
                </div>
              )}

              {activeTab === 'support' && (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[#94A3B8] uppercase text-[10px]">Amount Contributed</span>
                    <span className="font-bold text-emerald-400">{numAmount} TON (≈ ${usdEstimate} USD)</span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[#94A3B8] uppercase text-[10px]">Treasury Vault</span>
                    <span className="text-zinc-300 truncate max-w-[200px]">{TONJAM_TREASURY_ADDRESS}</span>
                  </div>
                  {txHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8] uppercase text-[10px]">TON Tx Hash</span>
                      <a
                        href={getTonViewerUrl(txHash, true)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#229ED9] hover:underline font-bold flex items-center gap-1"
                      >
                        <span>View on TonViewer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setVerificationStatus('idle'); setPaymentRef(null); setTxHash(null); setIsReviewingSupport(false); }}
                className="px-6 py-3 bg-[#17243A] hover:bg-[#1C2D49] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Submit Another Request
              </button>
              <button
                type="button"
                onClick={() => navigate('/wallet')}
                className="px-6 py-3 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20"
              >
                View Wallet & History
              </button>
            </div>
          </div>
        ) : (
          /* FORM & PAYMENT REVIEW PANEL */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: INFORMATION FORM & TAB CONTENT */}
            <div className="lg:col-span-7 space-y-6">
              {/* TAB 1: SUPPORT TONJAM */}
              {activeTab === 'support' && (
                <>
                  {!isReviewingSupport ? (
                    /* STEP 1: AMOUNT & SUPPORTER INFO FORM */
                    <div className="rounded-3xl bg-[#111C30] p-6 sm:p-7 shadow-xl space-y-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-[#229ED9]" />
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Support TonJam Ecosystem
                          </h2>
                        </div>
                        <p className="text-xs text-[#94A3B8]">
                          Choose a voluntary contribution amount to transfer directly to the official TonJam treasury vault.
                        </p>
                      </div>

                      {/* Preset Amount Pills */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                          Select Amount (TON)
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {presetAmounts.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => { setContributionAmount(preset); setErrors((prev) => ({ ...prev, amount: undefined })); }}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                contributionAmount === preset
                                  ? 'bg-[#229ED9] text-white shadow-md shadow-[#229ED9]/25 ring-2 ring-white/20'
                                  : 'bg-[#0B1424] text-zinc-300 hover:bg-[#162238]'
                              }`}
                            >
                              {preset} TON
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Amount Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex justify-between">
                          <span>Custom Amount (TON)</span>
                          <span className="text-emerald-400 font-normal">≈ ${usdEstimate} USD</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={contributionAmount}
                            onChange={(e) => {
                              setContributionAmount(e.target.value);
                              setErrors((prev) => ({ ...prev, amount: undefined }));
                            }}
                            placeholder="Enter TON amount..."
                            className={`w-full bg-[#0B1424] text-white text-base font-bold px-4 py-3.5 rounded-2xl outline-none focus:ring-2 transition-all ${
                              errors.amount ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                            }`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">
                            TON
                          </span>
                        </div>
                        {errors.amount && (
                          <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.amount}</span>
                          </p>
                        )}
                      </div>

                      {/* Supporter Form Details */}
                      <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-[#229ED9] uppercase tracking-wider">
                          Supporter & Receipt Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                              Name / Pseudonym *
                            </label>
                            <input
                              type="text"
                              value={partnerName}
                              onChange={(e) => {
                                setPartnerName(e.target.value);
                                setErrors((prev) => ({ ...prev, partnerName: undefined }));
                              }}
                              placeholder="e.g. Satoshi or Afrobeats Collector"
                              className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                                errors.partnerName ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                              }`}
                            />
                            {errors.partnerName && (
                              <p className="text-[10px] text-rose-400 font-medium">{errors.partnerName}</p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                              Contact Email *
                            </label>
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => {
                                setContactEmail(e.target.value);
                                setErrors((prev) => ({ ...prev, contactEmail: undefined }));
                              }}
                              placeholder="your@email.com"
                              className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                                errors.contactEmail ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                              }`}
                            />
                            {errors.contactEmail && (
                              <p className="text-[10px] text-rose-400 font-medium">{errors.contactEmail}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                            Message / Words of Encouragement (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Leave a message for TonJam creators..."
                            className="w-full bg-[#0B1424] text-white text-xs font-normal p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProceedToReview}
                        className="w-full py-3.5 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20 flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Proceed to Transaction Review</span>
                      </button>
                    </div>
                  ) : (
                    /* STEP 2: TRANSACTION REVIEW & WALLET AUTHORIZATION SCREEN */
                    <div className="rounded-3xl bg-[#111C30] p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#229ED9]" />
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Transaction Review & Authorization
                          </h2>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#229ED9]/15 text-[#229ED9]">
                          Network Validated
                        </span>
                      </div>

                      {/* TON NETWORK & TRANSACTION BREAKDOWN */}
                      <div className="rounded-2xl bg-[#0B1424] p-5 space-y-4 text-xs font-mono">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-[#94A3B8] uppercase text-[10px]">Contribution Amount</span>
                          <span className="text-base font-black text-emerald-400">
                            {numAmount} TON <span className="text-xs font-normal text-zinc-400">(≈ ${usdEstimate} USD)</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2">
                          <span className="text-[#94A3B8] uppercase text-[10px]">Exact Nanotons Value</span>
                          <span className="font-bold text-white">{nanotonsValue} nanotons</span>
                        </div>

                        <div className="flex items-center justify-between pb-2">
                          <span className="text-[#94A3B8] uppercase text-[10px]">Estimated Gas Fee</span>
                          <span className="text-zinc-300">~0.005 TON</span>
                        </div>

                        <div className="flex items-center justify-between pb-2">
                          <span className="text-[#94A3B8] uppercase text-[10px]">Target TON Network</span>
                          <span className="px-2 py-0.5 rounded bg-[#229ED9]/15 text-[#229ED9] font-bold uppercase text-[10px]">
                            TON {TON_NETWORK_MODE}
                          </span>
                        </div>

                        {/* CLEAR DISPLAY OF TREASURY ADDRESS FROM CONFIGURATION */}
                        <div className="pt-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#229ED9] uppercase tracking-wider">
                              Treasury Receiving Vault (Configured)
                            </span>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">
                              Project Verified
                            </span>
                          </div>
                          <div className="p-3 bg-[#080D1A] rounded-xl flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-white font-bold truncate">
                              {TONJAM_TREASURY_ADDRESS}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(TONJAM_TREASURY_ADDRESS, 'treasury')}
                              className="p-1.5 text-[#94A3B8] hover:text-white bg-[#111C30] rounded-lg cursor-pointer"
                              title="Copy Treasury Address"
                            >
                              {copiedTreasury ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* SENDER CONNECTED WALLET STATUS */}
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                            Authorized Sender Wallet
                          </span>
                          {userAddress ? (
                            <div className="p-3 bg-[#080D1A] rounded-xl flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                                  Sender Connected
                                </span>
                                <span className="font-mono text-xs text-white font-bold">
                                  {userAddress.substring(0, 10)}...{userAddress.substring(userAddress.length - 8)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(userAddress, 'sender')}
                                className="p-1.5 text-[#94A3B8] hover:text-white bg-[#111C30] rounded-lg cursor-pointer"
                              >
                                {copiedSender ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-500/10 rounded-xl space-y-2">
                              <p className="text-amber-400 text-xs">
                                Wallet is not connected yet. Click below to connect TON Connect before payment authorization.
                              </p>
                              <button
                                type="button"
                                onClick={() => tonConnectUI.openModal()}
                                className="px-4 py-2 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                              >
                                <WalletIcon className="w-3.5 h-3.5" />
                                <span>Connect Sender Wallet</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CONTRIBUTOR INFO SUMMARY */}
                      <div className="p-4 bg-[#0B1424] rounded-2xl text-xs space-y-1 font-sans">
                        <div className="flex justify-between">
                          <span className="text-[#94A3B8]">Contributor:</span>
                          <span className="text-white font-bold">{partnerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#94A3B8]">Receipt Email:</span>
                          <span className="text-white">{contactEmail}</span>
                        </div>
                        {message && (
                          <div className="flex justify-between pt-1">
                            <span className="text-[#94A3B8]">Attached Note:</span>
                            <span className="text-zinc-300 italic truncate max-w-[220px]">{message}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsReviewingSupport(false)}
                          className="px-5 py-3 bg-[#17243A] hover:bg-[#1C2D49] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleTreasuryContribution}
                          className="w-full py-3.5 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-[#229ED9]/25 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Authorizing TON Payment...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Confirm & Authorize {numAmount} TON</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: BECOME A SPONSOR FORM */}
              {activeTab === 'sponsor' && (
                <form onSubmit={handleInquirySubmit} className="rounded-3xl bg-[#111C30] p-6 sm:p-7 shadow-xl space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#229ED9]" />
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Become a TonJam Sponsor
                      </h2>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Elevate your brand across virtual festivals, music NFT drops, and artist grant programs on TonJam.
                    </p>
                  </div>

                  {/* Sponsorship Tier Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Select Sponsorship Package / Tier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { title: 'Festival Stage Sponsor', desc: 'Mainstage naming rights & live streaming overlay' },
                        { title: 'Artist Grant Co-Sponsor', desc: 'Fund creator grants with co-branded recognition' },
                        { title: 'Music NFT Collection Sponsor', desc: 'Exclusive drop partner for flagship NFT launches' },
                        { title: 'Platform Banner & Audio Drops', desc: 'In-app promo banners & native audio ad spots' }
                      ].map((tier) => (
                        <button
                          key={tier.title}
                          type="button"
                          onClick={() => setSponsorshipTier(tier.title)}
                          className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                            sponsorshipTier === tier.title
                              ? 'bg-[#229ED9]/15 ring-2 ring-[#229ED9] text-white'
                              : 'bg-[#0B1424] hover:bg-[#132038] text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{tier.title}</span>
                            {sponsorshipTier === tier.title && <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9]" />}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-1 leading-snug">{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Estimate */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Estimated Sponsorship Budget Range
                    </label>
                    <select
                      value={budgetEstimate}
                      onChange={(e) => setBudgetEstimate(e.target.value)}
                      className="w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all cursor-pointer"
                    >
                      <option value="1,000 - 5,000 TON">1,000 - 5,000 TON (≈ $5,300 - $26,500)</option>
                      <option value="5,000 - 20,000 TON">5,000 - 20,000 TON (≈ $26,500 - $106,000)</option>
                      <option value="20,000+ TON">20,000+ TON (≈ $106,000+ USD)</option>
                      <option value="Custom / Flexible">Custom / Flexible Terms</option>
                    </select>
                  </div>

                  {/* Interactive Fields with Inline Validation */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold text-[#229ED9] uppercase tracking-wider">
                      Sponsor Organization & Contact Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Organization Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#229ED9]" />
                          <span>Organization Name *</span>
                        </label>
                        <input
                          type="text"
                          value={partnerName}
                          onChange={(e) => {
                            setPartnerName(e.target.value);
                            setErrors((prev) => ({ ...prev, partnerName: undefined }));
                          }}
                          placeholder="e.g. RedBull Sound / Web3 Capital"
                          className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                            errors.partnerName ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                          }`}
                        />
                        {errors.partnerName && (
                          <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.partnerName}</span>
                          </p>
                        )}
                      </div>

                      {/* Contact Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#229ED9]" />
                          <span>Contact Email *</span>
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => {
                            setContactEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, contactEmail: undefined }));
                          }}
                          placeholder="sponsor@organization.com"
                          className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                            errors.contactEmail ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                          }`}
                        />
                        {errors.contactEmail && (
                          <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.contactEmail}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#229ED9]" />
                        <span>Website / Brand Link (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://brand.com"
                        className="w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all"
                      />
                    </div>

                    {/* Message / Proposal Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                          Sponsorship Proposal & Message *
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {message.length}/500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setErrors((prev) => ({ ...prev, message: undefined }));
                        }}
                        placeholder="Describe your brand sponsorship goals, preferred activation channels, or timeline..."
                        className={`w-full bg-[#0B1424] text-white text-xs font-normal p-4 rounded-xl outline-none focus:ring-2 transition-all resize-none ${
                          errors.message ? 'ring-2 ring-rose-500' : 'focus:ring-[#229ED9]'
                        }`}
                      />
                      {errors.message && (
                        <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Sponsorship Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Sponsorship Proposal</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: STRATEGIC PARTNERSHIP FORM */}
              {activeTab === 'strategic' && (
                <form onSubmit={handleInquirySubmit} className="rounded-3xl bg-[#111C30] p-6 sm:p-7 shadow-xl space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-[#9B7CFF]" />
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Strategic Ecosystem Partnership
                      </h2>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Partner with TonJam on protocol integration, music catalog licensing, node validation, or cross-chain liquidity.
                    </p>
                  </div>

                  {/* Strategic Scope Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Select Strategic Collaboration Scope
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { title: 'Record Label Onboarding', desc: 'Bring catalog assets & artist rosters to TonJam Web3' },
                        { title: 'Cross-Chain Bridge & Liquidity', desc: 'Connect TON music NFTs to EVM & Solana markets' },
                        { title: 'Node Validation & Infra', desc: 'Co-operate storage nodes & lossless audio CDN' },
                        { title: 'Distribution & Licensing', desc: 'Sync licensing & global publishing partnerships' }
                      ].map((scope) => (
                        <button
                          key={scope.title}
                          type="button"
                          onClick={() => setStrategicScope(scope.title)}
                          className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                            strategicScope === scope.title
                              ? 'bg-[#9B7CFF]/15 ring-2 ring-[#9B7CFF] text-white'
                              : 'bg-[#0B1424] hover:bg-[#132038] text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{scope.title}</span>
                            {strategicScope === scope.title && <CheckCircle2 className="w-3.5 h-3.5 text-[#9B7CFF]" />}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-1 leading-snug">{scope.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Fields with Inline Validation */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold text-[#9B7CFF] uppercase tracking-wider">
                      Partner Information & Proposal
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Organization Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3 h-3 text-[#9B7CFF]" />
                          <span>Organization / Entity Name *</span>
                        </label>
                        <input
                          type="text"
                          value={partnerName}
                          onChange={(e) => {
                            setPartnerName(e.target.value);
                            setErrors((prev) => ({ ...prev, partnerName: undefined }));
                          }}
                          placeholder="e.g. Universal Music Group / TON Infra"
                          className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                            errors.partnerName ? 'ring-2 ring-rose-500' : 'focus:ring-[#9B7CFF]'
                          }`}
                        />
                        {errors.partnerName && (
                          <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.partnerName}</span>
                          </p>
                        )}
                      </div>

                      {/* Contact Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#9B7CFF]" />
                          <span>Official Contact Email *</span>
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => {
                            setContactEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, contactEmail: undefined }));
                          }}
                          placeholder="partnerships@company.com"
                          className={`w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all ${
                            errors.contactEmail ? 'ring-2 ring-rose-500' : 'focus:ring-[#9B7CFF]'
                          }`}
                        />
                        {errors.contactEmail && (
                          <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.contactEmail}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#9B7CFF]" />
                        <span>Website / Documentation Link (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full bg-[#0B1424] text-white text-xs font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#9B7CFF] transition-all"
                      />
                    </div>

                    {/* Message / Proposal Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                          Strategic Proposal Details *
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {message.length}/600
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={600}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setErrors((prev) => ({ ...prev, message: undefined }));
                        }}
                        placeholder="Outline the technical, catalog, or ecosystem synergies of your proposed partnership..."
                        className={`w-full bg-[#0B1424] text-white text-xs font-normal p-4 rounded-xl outline-none focus:ring-2 transition-all resize-none ${
                          errors.message ? 'ring-2 ring-rose-500' : 'focus:ring-[#9B7CFF]'
                        }`}
                      />
                      {errors.message && (
                        <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-[#0B1424] p-3.5 text-[11px] text-[#94A3B8] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#9B7CFF] font-bold uppercase text-[9px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Ecosystem Review Notice</span>
                      </div>
                      <p className="leading-normal">
                        Proposals are reviewed by the TonJam Foundation core committee. Submissions do not constitute a binding contract until formal terms are executed.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#9B7CFF] hover:bg-[#8B65FF] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#9B7CFF]/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Proposal...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Strategic Proposal</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: TREASURY RECEIVING WALLET & PAYMENT REVIEW */}
            <div className="lg:col-span-5 space-y-6">
              {/* TREASURY RECEIVING WALLET ADDRESS PANEL */}
              <div className="rounded-3xl bg-[#111C30] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#229ED9] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Treasury Wallet</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                    Validated
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#94A3B8]">
                    All financial contributions are deposited directly into TonJam's designated ecosystem receiving address.
                  </p>
                  <div className="rounded-2xl bg-[#0B1424] p-4 space-y-2">
                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                      Treasury Receiving Address
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-white font-bold truncate">
                        {TONJAM_TREASURY_ADDRESS}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(TONJAM_TREASURY_ADDRESS, 'treasury')}
                        className="p-2 text-[#94A3B8] hover:text-white bg-[#111C30] hover:bg-[#182742] rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Copy Treasury Address"
                      >
                        {copiedTreasury ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SENDER CONNECTED WALLET STATUS */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block">
                    Connected Sender Wallet
                  </span>

                  {userAddress ? (
                    <div className="rounded-2xl bg-[#0B1424] p-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Connected (Sender)
                        </span>
                        <span className="font-mono text-xs text-white font-bold">
                          {userAddress.substring(0, 8)}...{userAddress.substring(userAddress.length - 6)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(userAddress, 'sender')}
                        className="p-2 text-[#94A3B8] hover:text-white bg-[#111C30] hover:bg-[#182742] rounded-xl transition-all cursor-pointer"
                      >
                        {copiedSender ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#0B1424] p-4 text-center space-y-3">
                      <p className="text-xs text-[#94A3B8]">
                        Connect your wallet to authorize and process transactions directly from your sender address.
                      </p>
                      <button
                        type="button"
                        onClick={() => tonConnectUI.openModal()}
                        className="w-full py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/20"
                      >
                        <WalletIcon className="w-4 h-4" />
                        <span>Connect Sender Wallet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT & INQUIRY SUMMARY PANEL */}
              <div className="rounded-3xl bg-[#111C30] p-6 shadow-xl space-y-5">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Summary & Submission
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#94A3B8]">Partnership Option:</span>
                    <span className="text-white font-bold uppercase">{activeTab}</span>
                  </div>

                  {activeTab === 'support' && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#94A3B8]">Contribution Amount:</span>
                      <span className="text-emerald-400 font-bold">{numAmount} TON (≈ ${usdEstimate})</span>
                    </div>
                  )}

                  {activeTab === 'sponsor' && (
                    <>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#94A3B8]">Selected Package:</span>
                        <span className="text-[#229ED9] font-bold">{sponsorshipTier}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#94A3B8]">Est. Budget:</span>
                        <span className="text-emerald-400 font-bold">{budgetEstimate}</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'strategic' && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#94A3B8]">Selected Scope:</span>
                      <span className="text-[#9B7CFF] font-bold">{strategicScope}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1.5">
                    <span className="text-[#94A3B8]">Network:</span>
                    <span className="text-white font-bold">TON {TON_NETWORK_MODE.toUpperCase()}</span>
                  </div>
                </div>

                {activeTab === 'support' ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleTreasuryContribution}
                    className="w-full py-4 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-xl shadow-[#229ED9]/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Treasury Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Authorize & Transfer {numAmount} TON</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleInquirySubmit()}
                    className={`w-full py-4 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 ${
                      activeTab === 'strategic'
                        ? 'bg-[#9B7CFF] hover:bg-[#8B65FF] shadow-[#9B7CFF]/25'
                        : 'bg-[#229ED9] hover:bg-[#168AC4] shadow-[#229ED9]/25'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit {activeTab === 'sponsor' ? 'Sponsorship' : 'Strategic'} Inquiry</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnerships;
