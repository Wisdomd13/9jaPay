import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { NIGERIAN_BANKS } from '../data/initialData';
import { 
  ArrowUpRight, 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  ShieldCheck,
  Building2,
  Crown,
  Users,
  Calendar,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface WithdrawModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => Promise<void>;
  onOpenUpgrade: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  user,
  isOpen,
  onClose,
  onWithdraw,
  onOpenUpgrade,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>(user.bankDetails?.bankName || 'OPay (PayCom)');
  const [accountNumber, setAccountNumber] = useState<string>(user.bankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState<string>(user.bankDetails?.accountName || user.fullName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{ amount: number; bank: string; account: string } | null>(null);

  // Time & Window calculation
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const isPremium = user.tier === 'PREMIUM';
  const minWithdrawal = isPremium ? 12000 : 65000;
  const numAmount = Number(amount);

  // Free Tier Requirement checks
  const hasMinBalance = user.walletBalance >= minWithdrawal;
  const totalRef = user.referralsCount || 0;
  const vipRef = user.vipReferralsCount || 0;
  const hasRequiredRefs = isPremium ? true : (totalRef >= 5 && vipRef >= 2);

  // Payout Window Check: 8:00 PM - 9:00 PM WAT (20:00 to 20:59)
  const currentDay = now.getDate();
  const currentHour = now.getHours();
  const isTimeWindow = currentHour === 20; // 8 PM to 9 PM
  const isDateWindow = isPremium ? true : currentDay === 29;
  const isWindowActive = isDateWindow && isTimeWindow;

  // Next window calculation string
  const getNextWindowText = () => {
    if (isWindowActive) {
      const minutesLeft = 59 - now.getMinutes();
      const secondsLeft = 59 - now.getSeconds();
      return `WINDOW OPEN NOW! Closes in ${minutesLeft}m ${secondsLeft}s`;
    }
    if (isPremium) {
      if (currentHour < 20) {
        return `Today at 8:00 PM - 9:00 PM WAT`;
      }
      return `Tomorrow at 8:00 PM - 9:00 PM WAT`;
    }
    // Free user: next 29th of the month
    if (currentDay < 29) {
      return `${29 - currentDay} day(s) away (29th of this month, 8:00 PM - 9:00 PM WAT)`;
    } else if (currentDay === 29 && currentHour < 20) {
      return `Today at 8:00 PM - 9:00 PM WAT (Only 1 Hour Window!)`;
    }
    return `Next month on the 29th (8:00 PM - 9:00 PM WAT)`;
  };

  const isEligibleToSubmit = hasMinBalance && hasRequiredRefs && isWindowActive;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount < minWithdrawal) {
      setErrorMsg(`Minimum withdrawal limit for ${user.tier} plan is ₦${minWithdrawal.toLocaleString()}`);
      return;
    }

    if (numAmount > user.walletBalance) {
      setErrorMsg(`Insufficient balance. You have ₦${user.walletBalance.toLocaleString()} available.`);
      return;
    }

    if (!isPremium) {
      if (totalRef < 5 || vipRef < 2) {
        setErrorMsg(`Free tier requires at least 5 total referrals (with min 2 VIP upgrades). You currently have ${totalRef} total (${vipRef} VIP).`);
        return;
      }
      if (!isWindowActive) {
        setErrorMsg(`Free Plan withdrawals are strictly processed on the 29th of the month between 8:00 PM and 9:00 PM WAT.`);
        return;
      }
    } else {
      if (!isWindowActive) {
        setErrorMsg(`Daily withdrawal window opens between 8:00 PM and 9:00 PM WAT.`);
        return;
      }
    }

    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit NUBAN account number.');
      return;
    }

    if (!accountName.trim()) {
      setErrorMsg('Please enter the recipient account name.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      await onWithdraw(numAmount, { bankName, accountNumber, accountName });
      soundManager.playRewardSound();
      setSuccessData({ amount: numAmount, bank: bankName, account: accountNumber });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-[28px] bg-[#0E0C14] border border-purple-900/30 p-5 sm:p-8 shadow-2xl overflow-hidden text-white">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Bank Withdrawal
                </h2>
                {isPremium ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                    VIP ₦12K Threshold
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                    FREE ₦65K Threshold
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Instant NGN Settlement to Any Nigerian Commercial or Microfinance Bank
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successData ? (
          /* Success Screen */
          <div className="mt-6 text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Disbursement Queued Successfully
              </span>
              <h3 className="text-2xl font-black text-white font-display mt-2">
                Withdrawal Initiated!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-sm mx-auto">
                ₦{successData.amount.toLocaleString()} will be deposited directly to your {successData.bank} account ({successData.account}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-gray-800 text-xs text-gray-300 space-y-1.5 text-left max-w-sm mx-auto">
              <p>• Account Name: <strong className="text-white">{accountName}</strong></p>
              <p>• Estimated Settlement: <strong className="text-emerald-400">Within 5 - 15 Minutes</strong></p>
              <p>• Reference ID: <span className="font-mono text-purple-300">9JA-WD-{Date.now().toString().slice(-6)}</span></p>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="w-full max-w-xs py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Rules & Form */
          <div className="mt-5 space-y-4">
            
            {/* Rules Checklist Box */}
            <div className="p-4 rounded-2xl bg-[#14101D] border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  {isPremium ? 'VIP Withdrawal Rules' : 'Free Tier Withdrawal Checklist'}
                </span>
                {isWindowActive ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 animate-pulse">
                    ● WINDOW OPEN
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                    🕒 NEXT WINDOW
                  </span>
                )}
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 text-xs">
                {/* 1. Balance */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-gray-800">
                  <div className="flex items-center gap-2">
                    {hasMinBalance ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <span className={hasMinBalance ? 'text-white' : 'text-gray-400'}>
                      Min Balance: <strong>₦{minWithdrawal.toLocaleString()}</strong> (You have ₦{user.walletBalance.toLocaleString()})
                    </span>
                  </div>
                  <span className={`text-[11px] font-black ${hasMinBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {hasMinBalance ? 'Passed ✓' : `Need ₦${Math.max(0, minWithdrawal - user.walletBalance).toLocaleString()}`}
                  </span>
                </div>

                {/* 2. Referrals (Free Plan Only) */}
                {!isPremium && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-gray-800">
                    <div className="flex items-center gap-2">
                      {hasRequiredRefs ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <span className={hasRequiredRefs ? 'text-white' : 'text-gray-400'}>
                        Min 5 Referrals (2 VIP): <strong>{totalRef}/5 Total ({vipRef}/2 VIP)</strong>
                      </span>
                    </div>
                    <span className={`text-[11px] font-black ${hasRequiredRefs ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {hasRequiredRefs ? 'Passed ✓' : 'Required'}
                    </span>
                  </div>
                )}

                {/* 3. Payout Time Window */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-gray-800">
                  <div className="flex items-center gap-2">
                    {isWindowActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    )}
                    <span className="text-gray-300">
                      {isPremium ? 'Daily Window (8:00 PM – 9:00 PM WAT):' : '29th of the Month (8:00 PM – 9:00 PM):'}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-purple-300 font-bold">
                    {getNextWindowText()}
                  </span>
                </div>
              </div>

              {/* Upgrade Banner for Free Users */}
              {!isPremium && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-200">
                    <p className="font-bold">Want ₦12,000 threshold & daily withdrawals?</p>
                    <p className="text-gray-400">Upgrade to VIP membership with zero referral barriers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      onClose();
                      onOpenUpgrade();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] flex-shrink-0 shadow-md flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3 fill-black" />
                    <span>Upgrade (₦10k)</span>
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Withdrawal Form */}
            <form onSubmit={handleWithdraw} className="space-y-3.5">
              
              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Withdrawal Amount (₦)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(user.walletBalance.toString())}
                    className="text-xs text-purple-400 hover:underline font-semibold"
                  >
                    Withdraw Full Balance (₦{user.walletBalance.toLocaleString()})
                  </button>
                </div>
                <input
                  type="number"
                  min={minWithdrawal}
                  max={user.walletBalance}
                  required
                  placeholder={`Min ₦${minWithdrawal.toLocaleString()}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Destination Nigerian Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-gray-900 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number & Account Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    placeholder="10-digit number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Account Holder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name as Registered on Bank"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isProcessing 
                  ? 'Initiating Bank Transfer...' 
                  : numAmount > 0 
                    ? `REQUEST WITHDRAWAL (₦${numAmount.toLocaleString()}) →` 
                    : 'REQUEST BANK WITHDRAWAL →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
