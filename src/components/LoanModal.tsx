import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Landmark, 
  Lock, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface LoanModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplyLoan: (amount: number, tenureDays: number) => Promise<void>;
  onRepayLoan: () => Promise<void>;
  onOpenUpgrade: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  user,
  isOpen,
  onClose,
  onApplyLoan,
  onRepayLoan,
  onOpenUpgrade,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [tenure, setTenure] = useState<number>(14);
  const [isApplying, setIsApplying] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isFreePlan = user.tier !== 'PREMIUM';
  const interestRate = 0.05; // 5%
  const totalRepayment = Math.round(loanAmount * (1 + interestRate));

  const handleApply = async () => {
    if (loanAmount < 5000 || loanAmount > user.loanLimit || isApplying) return;
    setIsApplying(true);
    setErrorMsg('');

    try {
      await onApplyLoan(loanAmount, tenure);
      soundManager.playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply for loan';
      setErrorMsg(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRepay = async () => {
    if (user.loanBalance <= 0 || isRepaying) return;
    setIsRepaying(true);
    setErrorMsg('');

    try {
      await onRepayLoan();
      soundManager.playRewardSound();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to repay loan';
      setErrorMsg(msg);
    } finally {
      setIsRepaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto max-h-[92vh] overflow-y-auto rounded-3xl bg-[#071A0C] border border-[#7CFF00]/30 p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7CFF00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#7CFF00]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#063B16] text-[#FFB800] flex items-center justify-center border border-[#FFB800]/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
                9jaPay Instant Loan
              </h2>
              <p className="text-xs text-[#A8B5AB]">
                Instant Micro-Credit for Active Earners
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isFreePlan ? (
          /* Locked State for Free Plan */
          <div className="mt-6 text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#063B16] border border-[#FFB800]/30 text-[#FFB800] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white font-display">
              Loan Feature Locked for Free Plan
            </h3>

            <p className="text-xs sm:text-sm text-[#A8B5AB] max-w-sm mx-auto leading-relaxed">
              9jaPay Instant Loan is an exclusive financial privilege reserved for verified <strong>VIP Premium Members</strong>. Upgrade your account to borrow up to <strong>₦50,000</strong> with instant wallet disbursement.
            </p>

            <div className="p-4 rounded-2xl bg-[#040F07] border border-[#7CFF00]/15 text-left text-xs space-y-2 text-[#A8B5AB]">
              <p className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                Borrow between ₦5,000 — ₦50,000 instantly
              </p>
              <p className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                Zero collateral or paper documentation
              </p>
              <p className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                Low 5% flat fee with flexible repayment
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFCC33] via-[#FFB800] to-[#D99100] text-black font-black text-sm shadow-xl shadow-amber-950/50 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Premium to Unlock Loans</span>
              </button>
            </div>
          </div>
        ) : user.loanBalance > 0 ? (
          /* Active Loan Repayment State */
          <div className="mt-6 space-y-5">
            <div className="p-4 rounded-2xl bg-[#063B16]/60 border border-[#FFB800]/30 text-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFB800]">Active Loan Status</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] font-mono font-bold">ACTIVE</span>
              </div>
              <p className="text-2xl font-black text-white font-display">
                ₦{user.loanBalance.toLocaleString()} Due
              </p>
              <p className="text-xs text-[#A8B5AB]">
                Please clear your outstanding loan balance to restore full credit limits and apply for new loans.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#040F07] border border-[#7CFF00]/15 space-y-2 text-xs">
              <div className="flex justify-between text-[#A8B5AB]">
                <span>Your Current Wallet Balance</span>
                <span className="text-white font-bold">₦{user.walletBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A8B5AB]">
                <span>Repayment Required</span>
                <span className="text-[#FFB800] font-bold">₦{user.loanBalance.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleRepay}
              disabled={isRepaying || user.walletBalance < user.loanBalance}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                user.walletBalance >= user.loanBalance && !isRepaying
                  ? 'bg-gradient-to-r from-[#7CFF00] to-[#39E600] text-black font-black shadow-[#7CFF00]/20 hover:scale-[1.01]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isRepaying ? 'Processing Repayment...' : `Repay ₦${user.loanBalance.toLocaleString()} in Full`}
            </button>
          </div>
        ) : (
          /* Application Form for Premium Members */
          <div className="mt-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Loan Amount Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#A8B5AB]">Select Loan Amount</span>
                <span className="text-[#FFB800] font-bold">Limit: ₦{user.loanLimit.toLocaleString()}</span>
              </div>

              <div className="text-3xl font-black text-white font-display text-center py-2 bg-[#040F07] rounded-2xl border border-[#7CFF00]/15">
                ₦{loanAmount.toLocaleString()}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[5000, 10000, 20000, 35000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      loanAmount === amt
                        ? 'bg-gradient-to-r from-[#FFCC33] to-[#FFB800] text-black shadow-sm'
                        : 'bg-[#040F07] text-[#A8B5AB] hover:text-white border border-[#7CFF00]/15'
                    }`}
                  >
                    ₦{(amt / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Selection */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#A8B5AB]">Repayment Period</span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { days: 7, label: '7 Days' },
                  { days: 14, label: '14 Days' },
                  { days: 30, label: '30 Days' },
                ].map((t) => (
                  <button
                    key={t.days}
                    type="button"
                    onClick={() => setTenure(t.days)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tenure === t.days
                        ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-md shadow-[#7CFF00]/20'
                        : 'bg-[#040F07] text-[#A8B5AB] border border-[#7CFF00]/15 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-[#040F07] border border-[#7CFF00]/15 space-y-2 text-xs">
              <div className="flex justify-between text-[#A8B5AB]">
                <span>Disbursed to Wallet</span>
                <span className="text-[#22C55E] font-bold">₦{loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A8B5AB]">
                <span>Interest Fee (5%)</span>
                <span className="text-gray-300 font-mono">₦{Math.round(loanAmount * interestRate).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#7CFF00]/10 flex justify-between text-sm">
                <span className="text-white font-bold">Total Repayment</span>
                <span className="text-[#FFB800] font-black">₦{totalRepayment.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFCC33] via-[#FFB800] to-[#D99100] hover:opacity-95 text-black font-black text-sm shadow-xl shadow-amber-950/50 hover:scale-[1.01] transition-all cursor-pointer"
            >
              {isApplying ? 'Disbursing Funds...' : `Borrow ₦${loanAmount.toLocaleString()} Instantly`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
