import React, { useState } from 'react';
import { UserProfile, VideoTask, QuizQuestion, SocialTask } from '../types';
import { WalletWidget } from './WalletWidget';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { 
  Zap, 
  Youtube, 
  Gift, 
  Sparkles, 
  Crown, 
  ArrowRight, 
  CheckCircle, 
  Copy, 
  Check, 
  Play, 
  Clock, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  MousePointerClick
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BentoDashboardProps {
  user: UserProfile;
  videoTasks: VideoTask[];
  quizQuestions: QuizQuestion[];
  socialTasks: SocialTask[];
  quizAnsweredCount: number;
  quizDailyLimit: number;
  onOpenWithdraw: () => void;
  onOpenUpgrade: () => void;
  onOpenLoan: () => void;
  onSelectTab: (tab: string) => void;
  onCompleteTask: (taskId: string, type: 'video' | 'social') => Promise<void>;
  onSubmitQuiz: (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D') => Promise<{
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    rewardEarned: number;
  }>;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  user,
  videoTasks,
  quizQuestions,
  socialTasks,
  quizAnsweredCount,
  quizDailyLimit,
  onOpenWithdraw,
  onOpenUpgrade,
  onOpenLoan,
  onSelectTab,
  onCompleteTask,
  onSubmitQuiz,
}) => {
  // Mini Quiz in Bento Card State
  const [selectedQuizOption, setSelectedQuizOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    reward: number;
  } | null>(null);

  // Referral Copy State
  const [copiedLink, setCopiedLink] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://9japay.com.ng';
  const referralLink = `${origin}/register.php?ref=${user.username}`;

  const currentQuiz = quizQuestions[0] || null;
  const featuredVideo = videoTasks[0] || null;

  const handleQuizAnswer = async (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuiz || quizResult || isSubmittingQuiz) return;
    soundManager.playClickSound();
    setSelectedQuizOption(opt);
    setIsSubmittingQuiz(true);

    try {
      const res = await onSubmitQuiz(currentQuiz.id, opt);
      setQuizResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        reward: res.rewardEarned
      });

      if (res.isCorrect) {
        soundManager.playSuccessSound();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch {
      // Handled
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleCopyReferral = () => {
    soundManager.playClickSound();
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    confetti({
      particleCount: 40,
      spread: 40,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Hero Wallet (col-span-8) + Audio Guide (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Available to Withdraw Hero Bento Card (col-span-8) */}
        <div className="lg:col-span-8">
          <WalletWidget
            user={user}
            onOpenWithdraw={onOpenWithdraw}
            onOpenUpgrade={onOpenUpgrade}
            onOpenLoan={onOpenLoan}
          />
        </div>

        {/* Audio Guide Bento Card (col-span-4) */}
        <div className="lg:col-span-4">
          <AudioGuidePlayer />
        </div>
      </div>

      {/* Middle Bento Row: Quiz Bento (col-span-4) + Video/Task Bento (col-span-5) + Referral Hub (col-span-3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Daily Quiz Bento Card (col-span-4) */}
        <div className="lg:col-span-4 bg-[#16121D] rounded-3xl p-6 border border-purple-900/20 flex flex-col justify-between shadow-xl">
          <div>
            {/* Top Badge & Category */}
            <div className="flex items-center justify-between mb-3">
              <span className="bg-purple-900/50 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-500/30 uppercase tracking-wider">
                {currentQuiz?.category || 'General Knowledge'}
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {user.tier === 'PREMIUM' ? '+₦1,000 / Question' : '+₦500 / Question'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-4 leading-snug font-display">
              {currentQuiz ? currentQuiz.question : 'What is the capital city of Nigeria?'}
            </h3>

            {/* Quiz Options */}
            <div className="space-y-2">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const text = currentQuiz?.options[opt] || (opt === 'A' ? 'Abuja' : opt === 'B' ? 'Lagos' : opt === 'C' ? 'Port Harcourt' : 'Kano');
                const isSelected = selectedQuizOption === opt;
                
                let btnStyle = 'bg-[#0A050F] hover:bg-purple-900/30 text-gray-300 border-white/5 hover:border-purple-500/30';
                if (quizResult) {
                  if (opt === quizResult.correctOption) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300';
                  } else if (isSelected && !quizResult.isCorrect) {
                    btnStyle = 'bg-red-950/60 border-red-500/60 text-red-300';
                  } else {
                    btnStyle = 'bg-[#0A050F]/50 opacity-50 border-transparent text-gray-500';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-purple-600/30 border-purple-500 text-purple-200';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleQuizAnswer(opt)}
                    disabled={Boolean(quizResult) || isSubmittingQuiz}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[10px] text-gray-400 flex-shrink-0">
                      {opt}
                    </span>
                    <span className="truncate">{text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {quizResult && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs font-semibold text-center border ${
                quizResult.isCorrect 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}>
                {quizResult.isCorrect ? `🎉 Correct! +₦${user.tier === 'PREMIUM' ? '1,000' : '500'} added to your balance!` : `Incorrect! Correct answer was ${quizResult.correctOption}`}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {quizAnsweredCount} / {quizDailyLimit} answered today
            </span>
            <button
              onClick={() => {
                soundManager.playClickSound();
                onSelectTab('quiz');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 group"
            >
              <span>View All 10 Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. Watch & Earn Video Bento Card with 3 Metric Chips (col-span-5) */}
        <div className="lg:col-span-5 bg-[#16121D] rounded-3xl p-6 border border-purple-900/20 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" /> Watch & Earn
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {user.tier === 'PREMIUM' ? '₦1,000 / Video' : '₦500 / Video'}
              </span>
            </div>

            {/* Featured Video Player Card */}
            {featuredVideo && (
              <div 
                onClick={() => {
                  soundManager.playClickSound();
                  onSelectTab('videos');
                }}
                className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 cursor-pointer group mb-4"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={featuredVideo.thumbnailUrl}
                    alt={featuredVideo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Center Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-950/60 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold line-clamp-1 text-[11px]">{featuredVideo.title}</span>
                    <span className="text-[10px] font-mono bg-black/60 px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ml-2">
                      <Clock className="w-2.5 h-2.5" /> {featuredVideo.requiredWatchSeconds}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3 Bento Metric Stat Chips */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            
            {/* Chip 1: Tasks Done */}
            <div 
              onClick={() => onSelectTab('videos')}
              className="bg-[#0A050F] rounded-2xl p-3 border border-white/5 text-center cursor-pointer hover:border-purple-500/30 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tasks</p>
              <p className="text-lg sm:text-xl font-black text-white font-display mt-0.5">
                {user.tasksCompleted}
              </p>
            </div>

            {/* Chip 2: Referrals */}
            <div 
              onClick={() => onSelectTab('referral')}
              className="bg-[#0A050F] rounded-2xl p-3 border border-white/5 text-center cursor-pointer hover:border-purple-500/30 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Referrals</p>
              <p className="text-lg sm:text-xl font-black text-white font-display mt-0.5">
                {user.referralsCount}
              </p>
            </div>

            {/* Chip 3: Total Earned */}
            <div 
              onClick={() => onSelectTab('history')}
              className="bg-[#0A050F] rounded-2xl p-3 border border-white/5 text-center cursor-pointer hover:border-purple-500/30 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
              <p className="text-base sm:text-lg font-black text-emerald-400 font-display mt-0.5 truncate">
                ₦{Math.floor(user.totalEarned).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Referral Hub & FairMoney Upgrade Bento Card (col-span-3) */}
        <div className="lg:col-span-3 bg-gradient-to-b from-[#1E1A26] to-[#16121D] rounded-3xl p-6 border border-purple-900/20 flex flex-col justify-between gap-4 shadow-xl">
          
          {/* Top Referral Quick Copy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Referral Hub
              </span>
              <span className="text-[10px] text-amber-300 font-bold">₦6k on VIP</span>
            </div>
            
            <p className="text-[11px] text-gray-300 mb-3">
              Share link with friends to earn instant commissions.
            </p>

            <div className="bg-[#0A050F] p-2.5 rounded-2xl border border-white/5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-gray-400 truncate select-all">
                {user.username}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0 shadow-sm"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Fast Upgrade Promo Card (Account details hidden until user clicks Upgrade) */}
          <div className="bg-gradient-to-br from-amber-950/30 to-purple-950/20 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 fill-amber-400" /> VIP Lifetime Access
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">₦10,000</span>
            </div>
            
            <div className="text-[11px] text-gray-300 space-y-1">
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 5x Earnings & ₦50k Loans
              </p>
              <p className="text-[10px] text-gray-400">Unlock ₦1,000 per video, 10 daily quizzes, and daily payouts.</p>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenUpgrade();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black text-xs font-black shadow-md hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>{user.tier === 'PREMIUM' ? 'VIP Status Active' : 'Upgrade to VIP (Get Details)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Task Grid: Socials & Extra Click Tasks */}
      <div className="bg-[#16121D] rounded-3xl p-6 border border-purple-900/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-display">Instant Click & Social Tasks</h3>
          </div>
          <button
            onClick={() => onSelectTab('socials')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {socialTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => {
                if (!task.isCompleted) {
                  onCompleteTask(task.id, 'social');
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                task.isCompleted
                  ? 'bg-[#0A050F]/60 border-emerald-500/30 opacity-75'
                  : 'bg-[#0A050F] border-white/5 hover:border-purple-500/40 hover:bg-purple-950/20'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-purple-400 uppercase">{task.platform}</span>
                <p className="text-xs font-bold text-white line-clamp-1">{task.title}</p>
                <p className="text-[10px] text-gray-400">{task.description}</p>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                {task.isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">+₦{task.reward}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
