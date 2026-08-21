import React, { useState } from 'react';
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
  Crown
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

  if (!isOpen) return null;

  const minWithdrawal = 12000;
  const numAmount = Number(amount);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount < minWithdrawal) {
      setErrorMsg(`Minimum withdrawal limit is ₦${minWithdrawal.toLocaleString()}`);
      return;
    }

    if (numAmount > user.walletBalance) {
      setErrorMsg(`Insufficient balance. You have ₦${user.walletBalance.toLocaleString()} available.`);
      return;
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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#111422] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display tracking-tight text-white">
                Withdraw Earnings
              </h2>
              <p className="text-xs text-gray-400">
                Direct NGN Bank Transfer to Any Nigerian Bank
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successData ? (
          /* Success Screen */
          <div className="mt-6 text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white font-display">
              Withdrawal Processed!
            </h3>

            <p className="text-sm text-gray-300">
              ₦{successData.amount.toLocaleString()} has been queued for immediate credit to your {successData.bank} account ({successData.account}).
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-xs text-gray-400 space-y-1 text-left max-w-sm mx-auto">
              <p>• Estimated Settlement: <strong className="text-emerald-400">Within 5-30 Minutes</strong></p>
              <p>• Payout Reference: <span className="font-mono text-gray-300">9JA-WD-{Math.floor(100000 + Math.random() * 900000)}</span></p>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* Withdrawal Form */
          <form onSubmit={handleWithdraw} className="mt-6 space-y-4">
            
            {/* Balance Overview */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold">Available for Withdrawal</p>
                <p className="text-2xl font-black text-white font-display">
                  ₦{user.walletBalance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Min. Withdrawal</p>
                <p className="text-sm font-bold text-emerald-400">
                  ₦{minWithdrawal.toLocaleString()}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Withdrawal Amount (₦)</label>
                <button
                  type="button"
                  onClick={() => setAmount(user.walletBalance.toString())}
                  className="text-xs text-purple-400 hover:underline font-semibold"
                >
                  Withdraw All
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
              <label className="block text-xs font-semibold text-gray-300 mb-1">Select Nigerian Bank</label>
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
                <label className="block text-xs font-semibold text-gray-300 mb-1">NUBAN Account Number</label>
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
                <label className="block text-xs font-semibold text-gray-300 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name on Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            {user.tier !== 'PREMIUM' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>Standard min withdrawal limit: ₦12,000.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="font-bold underline text-amber-200"
                >
                  Upgrade for Instant 24/7
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || user.walletBalance < minWithdrawal}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all ${
                user.walletBalance >= minWithdrawal && !isProcessing
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50 hover:scale-[1.01]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Processing Transfer...' : numAmount > 0 ? `Confirm Withdrawal (₦${numAmount.toLocaleString()})` : 'Confirm Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
