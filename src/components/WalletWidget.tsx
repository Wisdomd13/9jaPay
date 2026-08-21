import React from 'react';
import { UserProfile } from '../types';
import { 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  Landmark, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  ShieldAlert,
  Crown
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WalletWidgetProps {
  user: UserProfile;
  onOpenWithdraw: () => void;
  onOpenUpgrade: () => void;
  onOpenLoan: () => void;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({
  user,
  onOpenWithdraw,
  onOpenUpgrade,
  onOpenLoan,
}) => {
  return (
    <div className="w-full">
      {/* Main Financial Balance Bento Hero Card */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10 text-white">
        
        {/* Background ambient lighting effects & watermark */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-8 p-4 opacity-10 pointer-events-none hidden sm:block">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="white">
            <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.89 3.89 3 5 3H19C20.1 3 21 3.89 21 5V6H12C10.89 6 10 6.89 10 8V16C10 17.11 10.89 18 12 18H21M12 16H22V8H12V16M16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
          
          {/* Balance & Status Details */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-purple-200 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Available to Withdraw
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Instant Payout
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
                ₦{Math.floor(user.walletBalance).toLocaleString()}<span className="text-xl sm:text-2xl text-purple-300 opacity-75 font-mono">.{(user.walletBalance % 1).toFixed(2).substring(2)}</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-purple-200/80">
              <span className="flex items-center gap-1.5">
                <span className="text-purple-300/60">Plan:</span>
                {user.tier === 'PREMIUM' ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-amber-300" /> PREMIUM VIP
                  </span>
                ) : (
                  <span className="text-purple-200 font-semibold">FREE PLAN</span>
                )}
              </span>
              <span className="text-purple-400/40">•</span>
              <span className="text-emerald-300 font-medium">Min. Withdrawal: ₦12,000</span>
              {user.loanBalance > 0 && (
                <>
                  <span className="text-purple-400/40">•</span>
                  <span className="text-amber-300 font-medium">
                    Active Loan: ₦{user.loanBalance.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons: Withdraw, Loan, Upgrade */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            
            {/* Withdraw Button */}
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenWithdraw();
              }}
              className="px-6 py-2.5 bg-white hover:bg-purple-50 text-purple-950 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4 text-purple-900" />
              <span>Withdraw</span>
            </button>

            {/* Apply for Loan Button */}
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenLoan();
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Landmark className="w-4 h-4" />
              <span>Apply for Loan</span>
            </button>

            {/* Upgrade Button */}
            {user.tier !== 'PREMIUM' && (
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onOpenUpgrade();
                }}
                className="px-5 py-2.5 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-400/30 text-purple-200 rounded-xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Upgrade (₦6,000)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
