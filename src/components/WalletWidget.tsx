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
      <div className="bg-gradient-to-r from-[#063B16] via-[#072412] to-[#020805] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-[#7CFF00]/25 text-white">
        
        {/* Background ambient lighting effects & watermark */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-[#7CFF00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-8 p-4 opacity-10 pointer-events-none hidden sm:block">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="white">
            <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.89 3.89 3 5 3H19C20.1 3 21 3.89 21 5V6H12C10.89 6 10 6.89 10 8V16C10 17.11 10.89 18 12 18H21M12 16H22V8H12V16M16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
          
          {/* Balance & Status Details */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[#7CFF00] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                Available to Withdraw
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#063B16] text-[#7CFF00] border border-[#7CFF00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF00] animate-pulse"></span>
                Instant Payout
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
                ₦{Math.floor(user.walletBalance).toLocaleString()}<span className="text-xl sm:text-2xl text-[#7CFF00]/80 font-mono">.{(user.walletBalance % 1).toFixed(2).substring(2)}</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#A8B5AB]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#A8B5AB]">Plan:</span>
                {user.tier === 'PREMIUM' ? (
                  <span className="text-[#FFB800] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-[#FFB800]" /> PREMIUM VIP
                  </span>
                ) : (
                  <span className="text-white font-semibold">FREE PLAN</span>
                )}
              </span>
              <span className="text-[#7CFF00]/40">•</span>
              <span className="text-[#22C55E] font-medium">Min. Withdrawal: ₦12,000</span>
              {user.loanBalance > 0 && (
                <>
                  <span className="text-[#7CFF00]/40">•</span>
                  <span className="text-[#FFB800] font-medium">
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
              className="px-6 py-2.5 bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Withdraw</span>
            </button>

            {/* Apply for Loan Button */}
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenLoan();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FFCC33] via-[#FFB800] to-[#D99100] text-black rounded-xl font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
                className="px-5 py-2.5 bg-[#063B16] hover:bg-[#074D1D] border border-[#7CFF00]/40 text-[#7CFF00] rounded-xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFB800]" />
                <span>Upgrade (₦6,000)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
