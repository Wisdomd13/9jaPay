import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Volume2, 
  VolumeX, 
  Gift, 
  Youtube, 
  MousePointerClick, 
  Crown, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { NineJaPayLogo } from './NineJaPayLogo';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Live Payout Ticker Data (All amounts strictly ₦12,000 and above, matching the minimum withdrawal threshold)
  const livePayouts = [
    { name: 'Emeka O.', amount: '₦18,500', method: 'Direct Bank Transfer', time: '1m ago', bank: 'OPay' },
    { name: 'Amina B.', amount: '₦12,000', method: 'VIP Daily Payout', time: '2m ago', bank: 'Kuda MFB' },
    { name: 'Blessing K.', amount: '₦25,000', method: 'Bank Transfer', time: '4m ago', bank: 'GTBank' },
    { name: 'Tunde A.', amount: '₦14,500', method: 'Instant Withdrawal', time: '5m ago', bank: 'PalmPay' },
    { name: 'Chukwuma E.', amount: '₦35,000', method: 'Direct Payout', time: '7m ago', bank: 'Access Bank' },
    { name: 'Fatima S.', amount: '₦16,200', method: 'Daily Cashout', time: '9m ago', bank: 'Zenith Bank' },
    { name: 'Oluwaseun D.', amount: '₦22,000', method: 'Bank Transfer', time: '11m ago', bank: 'FairMoney MFB' },
    { name: 'Ngozi M.', amount: '₦65,000', method: 'Milestone Withdrawal', time: '13m ago', bank: 'Moniepoint MFB' },
    { name: 'Ibrahim Y.', amount: '₦14,000', method: 'Instant NUBAN Transfer', time: '16m ago', bank: 'UBA' },
    { name: 'Chioma R.', amount: '₦48,500', method: 'VIP Fast Payout', time: '18m ago', bank: 'FirstBank' },
    { name: 'David N.', amount: '₦12,500', method: 'Direct Bank Payout', time: '20m ago', bank: 'Stanbic IBTC' },
    { name: 'Kelechi U.', amount: '₦75,000', method: 'Verified Bank Settlement', time: '22m ago', bank: 'OPay' },
    { name: 'Zainab M.', amount: '₦15,000', method: 'Instant Cashout', time: '24m ago', bank: 'FairMoney MFB' },
    { name: 'Babajide A.', amount: '₦30,000', method: 'Direct Transfer', time: '26m ago', bank: 'Access Bank' },
  ];

  // Continuous Auto-scroll ticker
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let animationFrameId: number;
    const speed = 0.8;

    const step = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= (el.scrollWidth - el.clientWidth) / 2) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const earningRates = [
    { label: 'Watch / Video (Free)', reward: '₦500', icon: <Play className="w-3.5 h-3.5 fill-[#7CFF00] text-[#7CFF00]" /> },
    { label: 'Watch / Video (Premium)', reward: '₦1,000', icon: <Play className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" /> },
    { label: 'Click / Ad (Free)', reward: '₦500', icon: <MousePointerClick className="w-3.5 h-3.5 text-[#7CFF00]" /> },
    { label: 'Click / Ad (Premium)', reward: '₦1,000', icon: <MousePointerClick className="w-3.5 h-3.5 text-[#FFB800]" /> },
    { label: 'Quiz (Free)', reward: '₦500', icon: <Zap className="w-3.5 h-3.5 text-[#7CFF00]" /> },
    { label: 'Quiz (Premium)', reward: '₦1,000', icon: <Zap className="w-3.5 h-3.5 text-[#FFB800]" /> },
    { label: 'Referral on Upgrade (VIP)', reward: '₦6,000', icon: <Crown className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" /> },
  ];

  return (
    <div className="relative overflow-hidden text-white space-y-16 sm:space-y-24 py-4 sm:py-8">
      
      {/* Background Radiance Glows */}
      <div className="absolute top-10 left-1/4 w-[650px] h-[400px] bg-[#7CFF00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-10 w-[500px] h-[350px] bg-[#FFB800]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-[600px] h-[400px] bg-[#063B16]/25 rounded-full blur-[150px] pointer-events-none" />

      {/* =========================================================
          1. LIVE PAYOUTS TICKER
      ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#071A0C]/90 border border-[#7CFF00]/20 p-2 sm:p-2.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Live Badge */}
            <div className="flex items-center gap-1.5 font-bold text-[#7CFF00] uppercase tracking-wider text-[10px] sm:text-xs bg-[#063B16] px-3 py-1.5 rounded-xl border border-[#7CFF00]/30 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#7CFF00] animate-ping" />
              <span>Live Payouts</span>
            </div>

            {/* Auto-scrolling list */}
            <div 
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex items-center gap-3 overflow-x-hidden py-1 px-2 cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...livePayouts, ...livePayouts].map((p, i) => (
                <div 
                  key={i} 
                  className="inline-flex items-center gap-2 text-xs bg-[#020805]/80 border border-[#7CFF00]/10 px-3 py-1.5 rounded-xl flex-shrink-0 hover:border-[#7CFF00]/40 transition-colors"
                >
                  <span className="text-white font-bold">{p.name}</span>
                  <span className="text-[#FFB800] font-black font-mono">{p.amount}</span>
                  <span className="text-[#A8B5AB] text-[11px]">via {p.bank}</span>
                  <span className="text-gray-500 text-[10px]">({p.time})</span>
                </div>
              ))}
            </div>

            {/* Scroll Controls */}
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0 pl-1 border-l border-[#7CFF00]/15">
              <button 
                onClick={() => handleScroll('left')}
                className="p-1 rounded-lg bg-[#063B16]/60 hover:bg-[#063B16] text-[#A8B5AB] hover:text-white transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleScroll('right')}
                className="p-1 rounded-lg bg-[#063B16]/60 hover:bg-[#063B16] text-[#A8B5AB] hover:text-white transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. HERO SECTION
      ========================================================= */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description, CTAs, Stats */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Pill: LIVE & PAYING NOW */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#063B16]/80 border border-[#7CFF00]/40 text-[#7CFF00] text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#7CFF00] animate-pulse" />
              <span>LIVE & PAYING NOW</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif-title tracking-tight leading-[1.08]">
                9JAPAY NIGERIA
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#7CFF00] font-serif-title tracking-tight leading-[1.08]">
                WATCH, CLICK & EARN
              </h2>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#FFB800] font-serif-title tracking-tight leading-[1.08]">
                REAL CASH EVERY DAY
              </h2>
            </div>

            {/* Subtitle Paragraph */}
            <p className="text-sm sm:text-base text-[#A8B5AB] leading-relaxed max-w-xl">
              9jaPay is a Nigerian online earning platform where users earn money through daily tasks, referrals, sponsored activities, and digital rewards. Join for free, complete simple tasks, and unlock higher earnings with Premium membership.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onOpenAuth('register');
                }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black font-black text-xs sm:text-sm shadow-xl shadow-[#7CFF00]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>START EARNING FREE</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  const target = document.getElementById('how-it-works');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-[#071A0C] hover:bg-[#063B16]/50 border border-[#7CFF00]/20 text-white font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-[#7CFF00] fill-[#7CFF00]" />
                <span>HOW IT WORKS</span>
              </button>
            </div>

            {/* 3 Stats in a Row (200K+ / ₦400M+ / 100K+) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#7CFF00]/15 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#FFB800] font-serif-title">
                  200K+
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#A8B5AB] uppercase tracking-wider mt-0.5">
                  ACTIVE MEMBERS
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#FFB800] font-serif-title">
                  ₦400M+
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#A8B5AB] uppercase tracking-wider mt-0.5">
                  TOTAL PAID OUT
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#FFB800] font-serif-title">
                  100K+
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#A8B5AB] uppercase tracking-wider mt-0.5">
                  REWARDED
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Media Card with Live Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-[32px] overflow-hidden bg-[#071A0C] border border-[#7CFF00]/20 p-2 sm:p-3 shadow-2xl shadow-[#7CFF00]/10">
              
              {/* Media Container */}
              <div className="relative aspect-[4/4.8] sm:aspect-[4/4.5] w-full rounded-[24px] overflow-hidden bg-[#020805]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                  alt="9jaPay Nigerian Earner"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Floating Badge 1: Top-Right "TODAY'S EARNINGS" */}
                <div className="absolute top-3.5 right-3.5 bg-[#020805]/85 backdrop-blur-md border border-[#7CFF00]/20 p-2.5 rounded-2xl shadow-xl space-y-0.5 animate-fadeIn">
                  <p className="text-[9px] font-bold text-[#A8B5AB] uppercase tracking-wider">
                    TODAY'S EARNINGS
                  </p>
                  <p className="text-sm sm:text-base font-black text-[#FFB800] font-mono">
                    ₦4,850
                  </p>
                  <p className="text-[10px] text-[#22C55E] font-bold flex items-center gap-0.5">
                    ↑ 18% vs yesterday
                  </p>
                </div>

                {/* Floating Badge 2: Middle-Right "WITHDRAWAL INSTANT" */}
                <div className="absolute top-28 right-3.5 bg-[#020805]/85 backdrop-blur-md border border-[#7CFF00]/20 p-2.5 rounded-2xl shadow-xl space-y-0.5 animate-fadeIn">
                  <p className="text-[9px] font-bold text-[#A8B5AB] uppercase tracking-wider">
                    WITHDRAWAL
                  </p>
                  <p className="text-sm font-black text-[#FFB800] font-serif-title">
                    INSTANT
                  </p>
                  <p className="text-[10px] text-[#22C55E] font-bold flex items-center gap-0.5">
                    ✓ Processed
                  </p>
                </div>

                {/* Floating Badge 3: Bottom-Left "WELCOME BONUS" */}
                <div className="absolute bottom-14 left-3.5 bg-[#020805]/85 backdrop-blur-md border border-[#7CFF00]/20 p-2.5 rounded-2xl shadow-xl space-y-0.5 animate-fadeIn">
                  <p className="text-[9px] font-bold text-[#A8B5AB] uppercase tracking-wider">
                    FREE ACCESS
                  </p>
                  <p className="text-sm font-black text-[#FFB800] font-mono">
                    100% FREE
                  </p>
                  <p className="text-[10px] text-[#22C55E] font-bold">
                    Instant on sign-up ✓
                  </p>
                </div>

                {/* Bottom Center Caption Banner + Audio Mute button */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#020805]/75 backdrop-blur-md border border-[#7CFF00]/20">
                    <span className="text-xs sm:text-sm font-bold text-white font-serif-title">
                      Verified Member Payouts
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      setIsMuted(!isMuted);
                    }}
                    className="w-8 h-8 rounded-full bg-[#020805]/80 backdrop-blur-md border border-[#7CFF00]/20 text-white flex items-center justify-center hover:bg-[#063B16] transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#7CFF00]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. "KNOW EXACTLY WHAT YOU EARN"
      ========================================================= */}
      <section id="earnings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Tag and Title */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#7CFF00] text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT PAYOUTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif-title tracking-tight">
            KNOW EXACTLY WHAT{' '}
            <span className="bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#FFB800] bg-clip-text text-transparent">
              YOU EARN
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#A8B5AB] mt-2">
            How you earn on 9jaPay with no stress
          </p>
        </div>

        {/* 2-Column Grid: Task Rates (Left) vs Upgrade to Premium Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Task Rate Cards */}
          <div className="lg:col-span-7 space-y-2.5">
            {earningRates.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#071A0C] border border-[#7CFF00]/15 hover:border-[#7CFF00]/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#063B16] border border-[#7CFF00]/25 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#E8F0EA]">
                    {item.label}
                  </span>
                </div>

                <div className="font-mono text-sm sm:text-base font-bold text-[#FFB800]">
                  {item.reward}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Upgrade to Premium Box */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[28px] bg-gradient-to-b from-[#071A0C] via-[#041208] to-[#020805] border border-[#7CFF00]/30 p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Lightning Bolt Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#063B16] border border-[#7CFF00]/30 flex items-center justify-center text-[#7CFF00]">
                <Zap className="w-6 h-6 fill-[#7CFF00]" />
              </div>

              {/* Title & Price Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-serif-title tracking-tight">
                  UPGRADE TO PREMIUM
                </h3>
                <p className="text-xs sm:text-sm text-[#A8B5AB] mt-1.5">
                  One-time upgrade of ₦10,000 unlocks a whole new earning tier.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3.5 pt-2">
                {[
                  '5× higher task rewards (₦1,000 per task/video)',
                  'Borrow Loan feature unlocked (up to ₦50,000)',
                  'Daily 24/7 withdrawal access with zero wait',
                  'Full 10 Daily Quizzes unlocked (+₦10,000 daily)',
                  'Instant VIP referral commission (₦6,000 per upgrade)',
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-[#E8F0EA]">
                    <div className="w-4 h-4 rounded-full bg-[#7CFF00]/20 text-[#7CFF00] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#7CFF00]" />
                    </div>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA Button */}
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onOpenAuth('register');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#7CFF00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>UPGRADE TO PREMIUM MEMBERSHIP</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. HOW IT WORKS SECTION
      ========================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-[#7CFF00] text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMPLE STEPS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-title">
            HOW 9JAPAY WORKS
          </h2>
          <p className="text-xs sm:text-sm text-[#A8B5AB] mt-2">
            Start earning real money in 3 simple steps without investment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#063B16] text-[#7CFF00] font-black flex items-center justify-center font-serif-title text-lg border border-[#7CFF00]/30">
              1
            </div>
            <h3 className="text-base font-bold text-white font-display">Create Free Account</h3>
            <p className="text-xs text-[#A8B5AB] leading-relaxed">
              Sign up with your basic details in under 30 seconds. No initial deposit or hidden fees required.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#063B16] text-[#7CFF00] font-black flex items-center justify-center font-serif-title text-lg border border-[#7CFF00]/30">
              2
            </div>
            <h3 className="text-base font-bold text-white font-display">Complete Daily Tasks</h3>
            <p className="text-xs text-[#A8B5AB] leading-relaxed">
              Watch verified YouTube videos, click partner ads, answer trivia quizzes, and refer friends.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#063B16] text-[#7CFF00] font-black flex items-center justify-center font-serif-title text-lg border border-[#7CFF00]/30">
              3
            </div>
            <h3 className="text-base font-bold text-white font-display">Instant Bank Withdrawal</h3>
            <p className="text-xs text-[#A8B5AB] leading-relaxed">
              Request withdrawals directly to any Nigerian commercial or microfinance bank account (OPay, PalmPay, GTBank, etc.).
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. BOTTOM CTA SECTION
      ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 text-center py-8">
        
        {/* Badge: ✦ 100% FREE TO JOIN ✦ */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#063B16]/60 border border-[#7CFF00]/30 text-[#7CFF00] text-xs font-bold mb-6">
          <span>✦ 100% FREE TO JOIN ✦</span>
        </div>

        {/* Giant Headline */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white font-serif-title tracking-tight">
            READY TO START{' '}
            <span className="text-[#7CFF00]">EARNING</span>
          </h2>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#FFB800] font-serif-title tracking-tight">
            REAL CASH?
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-[#A8B5AB] max-w-xl mx-auto mt-4 leading-relaxed">
          Join thousands of Nigerians using 9jaPay, a trusted online earning platform, to earn daily through tasks, referrals, and sponsored activities.
        </p>

        {/* Primary CTA Button */}
        <div className="pt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenAuth('register');
            }}
            className="px-8 sm:px-10 py-4 rounded-full bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black font-black text-sm sm:text-base tracking-wider shadow-2xl shadow-[#7CFF00]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <UserPlus className="w-5 h-5" />
            <span>CREATE FREE ACCOUNT →</span>
          </button>

          {/* Secondary Log In Pill */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenAuth('login');
            }}
            className="px-6 py-2 rounded-full bg-[#071A0C] hover:bg-[#063B16] border border-[#7CFF00]/20 text-xs text-[#A8B5AB] hover:text-white transition-colors"
          >
            Already a member? Log In →
          </button>

          {/* Trust Subtext */}
          <p className="text-[11px] text-[#A8B5AB] font-medium tracking-wide pt-2">
            Secure &bull; Fast Payments &bull; No Investment Required
          </p>
        </div>
      </section>

      {/* =========================================================
          6. FOOTER
      ========================================================= */}
      <footer className="border-t border-[#7CFF00]/15 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8B5AB]">
          <NineJaPayLogo size="sm" />
          <p className="text-center sm:text-left">
            &copy; 2026 9jaPay Nigeria - Online Earning Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="hover:text-white transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
