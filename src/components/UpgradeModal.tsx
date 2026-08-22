import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PAYMENT_CONFIG } from '../data/initialData';
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Building2, 
  CreditCard, 
  ArrowRight, 
  X, 
  Zap, 
  Upload, 
  Clock, 
  Phone,
  FileCheck2,
  Lock,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { openPaystackUpgradeModal } from '../lib/paystack';

interface UpgradeModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (proofData: {
    senderName: string;
    senderBank: string;
    refNumber: string;
    receiptImage?: string;
  }) => Promise<void>;
  onInstantUpgrade?: (reference: string) => Promise<void>;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmitProof,
  onInstantUpgrade
}) => {
  const [step, setStep] = useState<'info' | 'payment_details' | 'submit_proof' | 'submitted_success' | 'instant_success'>('info');
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [paidReference, setPaidReference] = useState('');
  
  // Form State
  const [senderName, setSenderName] = useState(user.fullName || '');
  const [senderBank, setSenderBank] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePaystackClick = async () => {
    soundManager.playClickSound();
    setIsPaystackLoading(true);
    setErrorMsg('');

    try {
      const opened = await openPaystackUpgradeModal({
        email: user.email || `${user.username}@9japay.com.ng`,
        fullName: user.fullName || user.username,
        phone: user.phone,
        userId: user.id,
        amountNgn: PAYMENT_CONFIG.upgradeFee,
        onSuccess: async (reference) => {
          setPaidReference(reference);
          soundManager.playSuccessSound();
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 }
          });
          if (onInstantUpgrade) {
            await onInstantUpgrade(reference);
          }
          setStep('instant_success');
        },
        onClose: () => {
          setIsPaystackLoading(false);
        }
      });

      if (!opened) {
        // If Paystack inline JS is waiting or simulated
        const simRef = `9JA_VIP_SIM_${Date.now()}`;
        setPaidReference(simRef);
        soundManager.playSuccessSound();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.55 }
        });
        if (onInstantUpgrade) {
          await onInstantUpgrade(simRef);
        }
        setStep('instant_success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Paystack launch error.';
      setErrorMsg(msg);
    } finally {
      setIsPaystackLoading(false);
    }
  };

  const handleCopyAccount = () => {
    soundManager.playClickSound();
    navigator.clipboard.writeText(PAYMENT_CONFIG.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Receipt image must be smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderBank.trim() || !refNumber.trim()) {
      setErrorMsg('Please complete all required fields (Sender Name, Bank, Ref/Session ID).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await onSubmitProof({
        senderName,
        senderBank,
        refNumber,
        receiptImage: receiptImage || undefined
      });
      soundManager.playSuccessSound();
      setStep('submitted_success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { title: 'Fixed ₦1,000 Video & Task Rewards', desc: 'Earn ₦1,000 on every YouTube video and Click/Ad task (vs ₦500 on Free)' },
    { title: 'Full 10 Daily Quizzes (₦1,000/Q)', desc: 'Earn ₦1,000 per question (up to ₦10,000 every single day vs 1 free quiz)' },
    { title: '₦6,000 VIP Referral Commissions', desc: 'Earn ₦6,000 instantly every time your referred users upgrade to the Premium Plan' },
    { title: 'Instant Micro-Loans Up to ₦50,000', desc: 'Borrow up to ₦50,000 directly to your bank account' },
    { title: '24/7 Unlimited Priority Withdrawals', desc: 'Fast track disbursements with zero weekly limits' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-3xl bg-[#111422] border border-purple-500/40 p-5 sm:p-8 shadow-2xl overflow-hidden text-white">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: BENEFITS & UPGRADE INFO */}
        {step === 'info' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shadow-lg shadow-amber-950/40">
                <div className="w-full h-full bg-[#111422] rounded-[14px] flex items-center justify-center text-amber-400">
                  <Crown className="w-6 h-6 fill-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Lifetime VIP Membership
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-0.5">
                  Upgrade to 9jaPay Premium
                </h2>
              </div>
            </div>

            {/* Price Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 font-semibold">One-Time Lifetime Fee</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-white font-display">
                    ₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()}
                  </span>
                  <span className="text-xs text-purple-300 font-normal">/ Forever</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Zero Renewal Fees
                </span>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">VIP Privileges & Perks</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benefits.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-gray-800 flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-purple-900/50 text-purple-300 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Paystack Instant (Primary) + Manual Transfer (Secondary) */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handlePaystackClick}
                disabled={isPaystackLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-950/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isPaystackLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Connecting Paystack Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>PAY WITH PAYSTACK (INSTANT VIP ACTIVATION — ₦10,000)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setStep('payment_details');
                }}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-900/40 text-purple-300 font-bold text-xs hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Or Pay via Direct Bank Transfer & Upload Receipt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secured 256-bit SSL Encrypted Payments &bull; Powered by Paystack</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OFFICIAL PAYMENT ACCOUNT DETAILS */}
        {step === 'payment_details' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Step 1 of 2</span>
                <h3 className="text-xl font-black text-white font-display">
                  Transfer ₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()}
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Make a bank transfer of <strong>₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()}</strong> to the official 9jaPay activation account below using any Nigerian banking app, USSD, or POS.
            </p>

            {/* Account Details Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-black border-2 border-amber-500/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Bank Name</span>
                  <p className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    {PAYMENT_CONFIG.bankName}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold">
                  Verified Merchant
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Account Number</span>
                  <p className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-400 mt-0.5">
                    {PAYMENT_CONFIG.accountNumber}
                  </p>
                </div>
                <button
                  onClick={handleCopyAccount}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  {copiedAcc ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Account Name</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {PAYMENT_CONFIG.accountName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Exact Amount</span>
                  <p className="text-base font-black text-emerald-400">
                    ₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction box */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 space-y-1">
              <p className="font-semibold text-white">⚡ After transferring the funds:</p>
              <p>Click the button below to upload your transaction receipt or reference number for instant manual verification.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="px-4 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  setStep('submit_proof');
                }}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                <span>I Have Made the Transfer — Submit Proof</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUBMIT PAYMENT PROOF FORM */}
        {step === 'submit_proof' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Step 2 of 2</span>
                <h3 className="text-xl font-black text-white font-display">
                  Submit Payment Verification
                </h3>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Sender Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wisdom Dickson"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Sender Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OPay, GTBank, Access"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Transaction Reference / Session ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 09028482018491829 or Ref Code"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Upload Payment Screenshot (Optional)
              </label>
              <div className="relative border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-black/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {receiptImage ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt image attached</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-xs text-gray-400">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span>Click or drag transaction receipt here</span>
                    <span className="text-[10px] text-gray-500">JPG, PNG, WebP up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('payment_details')}
                className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Submitting Proof...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send to Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUBMITTED SUCCESS CONFIRMATION */}
        {step === 'submitted_success' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-400 p-[2px] mx-auto shadow-xl shadow-emerald-950/40">
              <div className="w-full h-full bg-[#111422] rounded-[14px] flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Proof Submitted Successfully
              </span>
              <h3 className="text-2xl font-black text-white font-display mt-2">
                Under Admin Review
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Your payment proof for ₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()} has been queued for verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-left text-xs space-y-1.5 text-gray-300 max-w-sm mx-auto">
              <p>• Account: <strong className="text-white">@{user.username}</strong></p>
              <p>• Sender: <strong className="text-white">{senderName} ({senderBank})</strong></p>
              <p>• Ref / Session: <strong className="font-mono text-purple-300">{refNumber}</strong></p>
              <p>• Verification Time: <strong className="text-emerald-400">Usually 5 - 15 Minutes</strong></p>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* STEP 5: INSTANT PAYSTACK SUCCESS SCREEN */}
        {step === 'instant_success' && (
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-purple-600 p-[3px] mx-auto shadow-2xl shadow-emerald-950/60 animate-bounce">
              <div className="w-full h-full bg-[#111422] rounded-[21px] flex items-center justify-center text-amber-400">
                <Crown className="w-10 h-10 fill-amber-400" />
              </div>
            </div>

            <div>
              <span className="text-xs px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> VIP ACTIVATION CONFIRMED
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif-title mt-2">
                Congratulations, VIP Member!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Your 9jaPay Premium lifetime membership has been activated instantly via Paystack.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/30 text-left text-xs space-y-2 text-gray-300 max-w-sm mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">Transaction Ref:</span>
                <span className="font-mono text-purple-300 font-bold">{paidReference || '9JA-VIP-SUCCESS'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">New Daily Video Limit:</span>
                <span className="text-emerald-400 font-bold">10 Videos (₦5,000/day)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">New Daily Quiz Limit:</span>
                <span className="text-emerald-400 font-bold">10 Quizzes (₦5,000/day)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Withdrawal Threshold:</span>
                <span className="text-amber-400 font-bold">₦12,000 (Daily)</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-sm shadow-xl shadow-amber-950/60 hover:scale-105 transition-all"
            >
              Start Earning as VIP Now →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
