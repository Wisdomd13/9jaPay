import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  Landmark, 
  TrendingUp, 
  Crown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  Gift,
  Coins,
  Clock
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculation of Task Earnings specifically
  const taskRate = user.tier === 'PREMIUM' ? 1000 : 500;
  const estimatedTasksEarned = user.tasksCompleted * taskRate;

  // 3 Carousel Cards configuration
  const CARDS = [
    {
      id: 'tasks_wallet',
      label: 'Tasks Wallet',
      badge: 'Tasks & Quizzes',
      badgeColor: 'bg-emerald-500/20 text-[#7CFF00] border-[#7CFF00]/30',
      amount: estimatedTasksEarned,
      subtitle: 'Earned strictly from completed video clips & trivia tasks',
      statLabel: 'Completed Tasks',
      statValue: `${user.tasksCompleted} Tasks`,
      rateLabel: 'Current Rate',
      rateValue: `₦${taskRate.toLocaleString()} / task`,
      accentGradient: 'from-[#063B16] via-[#072412] to-[#020805]',
      glowColor: 'bg-[#7CFF00]/15',
      icon: <Zap className="w-4 h-4 text-[#7CFF00]" />
    },
    {
      id: 'all_time_earnings',
      label: 'All-Time Earnings',
      badge: 'Lifetime Accumulated',
      badgeColor: 'bg-amber-500/20 text-[#FFB800] border-amber-500/30',
      amount: user.totalEarned,
      subtitle: 'Lifetime earnings accumulated across tasks, quizzes, and referrals',
      statLabel: 'Total Referrals',
      statValue: `${user.referralsCount} Members`,
      rateLabel: 'Account Status',
      rateValue: user.tier === 'PREMIUM' ? 'VIP Active' : 'Free Tier',
      accentGradient: 'from-[#1A1203] via-[#0F1E0B] to-[#020805]',
      glowColor: 'bg-[#FFB800]/15',
      icon: <TrendingUp className="w-4 h-4 text-[#FFB800]" />
    },
    {
      id: 'total_balance',
      label: 'Total Balance',
      badge: 'Available to Withdraw',
      badgeColor: 'bg-[#063B16] text-[#7CFF00] border-[#7CFF00]/40',
      amount: user.walletBalance,
      subtitle: 'Current balance available for withdrawal to your bank account',
      statLabel: 'Min. Payout',
      statValue: user.tier === 'PREMIUM' ? '₦10,000 (Daily)' : '₦65,000 (29th)',
      rateLabel: 'Active Loan',
      rateValue: user.loanBalance > 0 ? `₦${user.loanBalance.toLocaleString()}` : '₦0 Active',
      accentGradient: 'from-[#063B16] via-[#052912] to-[#020805]',
      glowColor: 'bg-[#7CFF00]/20',
      icon: <Wallet className="w-4 h-4 text-[#7CFF00]" />
    }
  ];

  // Auto-scroll every 5 seconds (5000ms) with smooth 50ms progress tracking
  useEffect(() => {
    if (isPaused) return;

    const INTERVAL_MS = 5000;
    const STEP_MS = 50;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (STEP_MS / INTERVAL_MS) * 100;
      });
    }, STEP_MS);

    timerRef.current = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % CARDS.length);
      setProgress(0);
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPaused, CARDS.length]);

  const handleNextCard = () => {
    soundManager.playClickSound();
    setCurrentCardIndex((prev) => (prev + 1) % CARDS.length);
    setProgress(0);
  };

  const handlePrevCard = () => {
    soundManager.playClickSound();
    setCurrentCardIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    setProgress(0);
  };

  const handleSelectCard = (index: number) => {
    soundManager.playClickSound();
    setCurrentCardIndex(index);
    setProgress(0);
  };

  const currentCard = CARDS[currentCardIndex];

  return (
    <div className="w-full">
      {/* Auto-Rotating Wallet Hero Card */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`bg-gradient-to-r ${currentCard.accentGradient} rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-[#7CFF00]/25 text-white transition-all duration-500`}
      >
        
        {/* Background ambient lighting effects */}
        <div className={`absolute top-0 right-0 -mt-6 -mr-6 w-64 h-64 ${currentCard.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-500`} />
        
        {/* Background Watermark */}
        <div className="absolute bottom-0 right-8 p-4 opacity-5 pointer-events-none hidden sm:block">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="white">
            <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.89 3.89 3 5 3H19C20.1 3 21 3.89 21 5V6H12C10.89 6 10 6.89 10 8V16C10 17.11 10.89 18 12 18H21M12 16H22V8H12V16M16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
          
          {/* Top Carousel Navigation & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Card Category Badge & Indicator */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${currentCard.badgeColor}`}>
                {currentCard.icon}
                <span>{currentCard.badge}</span>
              </span>

              <span className="text-[10px] text-[#A8B5AB] font-mono bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                Card {currentCardIndex + 1} of 3 (Auto-cycles 5s)
              </span>
            </div>

            {/* Carousel Nav Arrows & Dot Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {CARDS.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCard(idx)}
                    title={c.label}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentCardIndex 
                        ? 'w-6 bg-[#7CFF00]' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={handlePrevCard}
                  className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title="Previous Wallet Card"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextCard}
                  className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title="Next Wallet Card"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Balance & Status Details */}
          <div className="transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[#7CFF00] text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span>{currentCard.label}</span>
              </p>
              
              {currentCard.id === 'total_balance' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#063B16] text-[#7CFF00] border border-[#7CFF00]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF00] animate-pulse"></span>
                  Instant Payout
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-white">
                ₦{Math.floor(currentCard.amount).toLocaleString()}
                <span className="text-xl sm:text-2xl text-[#7CFF00]/80 font-mono">
                  .{(currentCard.amount % 1).toFixed(2).substring(2)}
                </span>
              </h2>
            </div>

            <p className="text-xs text-[#A8B5AB] mt-1 line-clamp-1">
              {currentCard.subtitle}
            </p>

            {/* Quick Metrics Footer */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#A8B5AB]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#A8B5AB]">{currentCard.statLabel}:</span>
                <span className="text-white font-bold">{currentCard.statValue}</span>
              </span>
              <span className="text-[#7CFF00]/40">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#A8B5AB]">{currentCard.rateLabel}:</span>
                <span className="text-[#22C55E] font-medium">{currentCard.rateValue}</span>
              </span>
              <span className="text-[#7CFF00]/40">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#A8B5AB]">Plan:</span>
                {user.tier === 'PREMIUM' ? (
                  <span className="text-[#FFB800] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-[#FFB800]" /> VIP PREMIUM
                  </span>
                ) : (
                  <span className="text-white font-semibold">FREE PLAN</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons: Withdraw, Loan, Upgrade */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#7CFF00]/15">
            
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
                <span>Upgrade VIP (₦10,000)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

